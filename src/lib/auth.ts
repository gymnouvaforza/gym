import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_LOGIN_PATH } from "@/lib/admin";
import { getLocalAdminEnv, hasLocalAdminEnv, hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const LOCAL_ADMIN_COOKIE = "gym_admin_session";

export async function isLocalAdminSession() {
  if (!hasLocalAdminEnv()) {
    return false;
  }

  const adminEnv = getLocalAdminEnv();
  const cookieStore = await cookies();
  const localSession = cookieStore.get(LOCAL_ADMIN_COOKIE)?.value;

  return Boolean(adminEnv && localSession === adminEnv.user);
}

export async function getCurrentUser() {
  if (hasSupabasePublicEnv()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return user;
    }
  }

  if (await isLocalAdminSession()) {
    const adminEnv = getLocalAdminEnv();
    if (adminEnv) {
      return {
        email: `${adminEnv.user} (local)`,
        id: `local-admin:${adminEnv.user}`,
      };
    }
  }

  return null;
}

export async function requireUser(redirectTo = ADMIN_LOGIN_PATH) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

export async function getDashboardCapabilities() {
  const localAdminSession = await isLocalAdminSession();
  const canManageRealData = !localAdminSession || Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return {
    canManageRealData,
    isLocalReadOnly: localAdminSession && !canManageRealData,
  };
}
