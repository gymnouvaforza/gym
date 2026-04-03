import { beforeAll, describe, expect, it } from "vitest";

import { createClient } from "@supabase/supabase-js";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} for mobile live tests.`);
  }

  return value;
}

async function signIn(email: string, password: string) {
  const supabase = createClient(
    getRequiredEnv("TEST_MOBILE_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session?.access_token) {
    throw new Error(error?.message ?? `No se pudo iniciar sesion para ${email}.`);
  }

  return data.session.access_token;
}

describe("mobile live API routes", () => {
  let trainerToken = "";
  let user1Token = "";
  let user2Token = "";
  let user3Token = "";

  beforeAll(async () => {
    trainerToken = await signIn(
      getRequiredEnv("TEST_MOBILE_DEMO_TRAINER_EMAIL"),
      getRequiredEnv("TEST_MOBILE_DEMO_TRAINER_PASSWORD"),
    );
    user1Token = await signIn(
      getRequiredEnv("TEST_MOBILE_DEMO_USER_1_EMAIL"),
      getRequiredEnv("TEST_MOBILE_DEMO_USER_1_PASSWORD"),
    );
    user2Token = await signIn(
      getRequiredEnv("TEST_MOBILE_DEMO_USER_2_EMAIL"),
      getRequiredEnv("TEST_MOBILE_DEMO_USER_2_PASSWORD"),
    );
    user3Token = await signIn(
      getRequiredEnv("TEST_MOBILE_DEMO_USER_3_EMAIL"),
      getRequiredEnv("TEST_MOBILE_DEMO_USER_3_PASSWORD"),
    );
  });

  it("returns live session and active routine for usuario1", async () => {
    const [{ GET: getMe }, { GET: getRoutine }] = await Promise.all([
      import("./me/route"),
      import("./me/routine/route"),
    ]);

    const meResponse = await getMe(
      new Request("http://localhost/api/mobile/me", {
        headers: {
          authorization: `Bearer ${user1Token}`,
          "x-mobile-scenario": "live",
        },
      }),
    );
    const routineResponse = await getRoutine(
      new Request("http://localhost/api/mobile/me/routine", {
        headers: {
          authorization: `Bearer ${user1Token}`,
          "x-mobile-scenario": "live",
        },
      }),
    );

    const mePayload = await meResponse.json();
    const routinePayload = await routineResponse.json();

    expect(meResponse.status).toBe(200);
    expect(mePayload.member.memberNumber).toBe("NF-101");
    expect(routinePayload.routine.title).toBe("FUERZA BASE A");
  });

  it("returns an empty routine for usuario2 and archived history for usuario3", async () => {
    const [{ GET: getRoutine }, { GET: getHistory }] = await Promise.all([
      import("./me/routine/route"),
      import("./me/history/route"),
    ]);

    const routineResponse = await getRoutine(
      new Request("http://localhost/api/mobile/me/routine", {
        headers: {
          authorization: `Bearer ${user2Token}`,
          "x-mobile-scenario": "live",
        },
      }),
    );
    const historyResponse = await getHistory(
      new Request("http://localhost/api/mobile/me/history", {
        headers: {
          authorization: `Bearer ${user3Token}`,
          "x-mobile-scenario": "live",
        },
      }),
    );

    const routinePayload = await routineResponse.json();
    const historyPayload = await historyResponse.json();

    expect(routineResponse.status).toBe(200);
    expect(routinePayload.routine).toBeNull();
    expect(historyPayload.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          metricValue: "ARCHIVADA",
          title: "HIPERTROFIA CONTROLADA",
        }),
      ]),
    );
  });

  it("allows trainer access to staff endpoints and rejects normal users", async () => {
    const [{ GET: getDashboard }, { GET: getMembers }] = await Promise.all([
      import("./staff/dashboard/route"),
      import("./staff/members/route"),
    ]);

    const trainerDashboard = await getDashboard(
      new Request("http://localhost/api/mobile/staff/dashboard", {
        headers: {
          authorization: `Bearer ${trainerToken}`,
          "x-mobile-scenario": "live",
        },
      }),
    );

    const memberForbidden = await getMembers(
      new Request("http://localhost/api/mobile/staff/members", {
        headers: {
          authorization: `Bearer ${user1Token}`,
          "x-mobile-scenario": "live",
        },
      }),
    );

    expect(trainerDashboard.status).toBe(200);
    expect(memberForbidden.status).toBe(403);
  });

  it("lets trainer assign routines and patch member state against real data", async () => {
    const [{ POST: assignRoutine }, { PATCH: patchMember }] = await Promise.all([
      import("./staff/routine-assignments/route"),
      import("./staff/members/[id]/route"),
    ]);

    const assignResponse = await assignRoutine(
      new Request("http://localhost/api/mobile/staff/routine-assignments", {
        body: JSON.stringify({
          memberId: "10000000-0000-0000-0000-000000000002",
          templateId: "30000000-0000-0000-0000-000000000002",
        }),
        headers: {
          authorization: `Bearer ${trainerToken}`,
          "content-type": "application/json",
          "x-mobile-scenario": "live",
        },
        method: "POST",
      }),
    );

    const patchResponse = await patchMember(
      new Request("http://localhost/api/mobile/staff/members/10000000-0000-0000-0000-000000000002", {
        body: JSON.stringify({ status: "paused" }),
        headers: {
          authorization: `Bearer ${trainerToken}`,
          "content-type": "application/json",
          "x-mobile-scenario": "live",
        },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({ id: "10000000-0000-0000-0000-000000000002" }),
      },
    );

    const assignPayload = await assignResponse.json();
    const patchPayload = await patchResponse.json();

    expect(assignResponse.status).toBe(201);
    expect(assignPayload.status).toBe("active");
    expect(patchResponse.status).toBe(200);
    expect(patchPayload.status.status).toBe("paused");
  });
});
