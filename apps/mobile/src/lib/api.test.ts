import { MobileApiError, mobileFetchJson } from "@/lib/api";

describe("mobileFetchJson", () => {
  it("sends auth headers", async () => {
    const fetchMock = jest.fn(async () => ({
      json: async () => ({ ok: true }),
      ok: true,
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await mobileFetchJson<{ ok: boolean }>("/api/mobile/me", {
      accessToken: "token-123",
      method: "GET",
    });

    expect(response).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/mobile/me",
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: "Bearer token-123",
          "content-type": "application/json",
        }),
        method: "GET",
      }),
    );
  });

  it("throws a MobileApiError with backend message", async () => {
    global.fetch = jest.fn(async () => ({
      json: async () => ({ error: "No autorizado" }),
      ok: false,
      status: 401,
    })) as unknown as typeof fetch;

    await expect(mobileFetchJson("/api/mobile/me")).rejects.toEqual(
      expect.objectContaining<Partial<MobileApiError>>({
        message: "No autorizado",
        status: 401,
      }),
    );
  });

  it("retries against the alternate local dev port when the primary port returns html", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        headers: {
          get: () => "text/html; charset=utf-8",
        },
        json: async () => {
          throw new Error("not json");
        },
        ok: false,
        status: 404,
      })
      .mockResolvedValueOnce({
        headers: {
          get: () => "application/json",
        },
        json: async () => ({ ok: true }),
        ok: true,
        status: 200,
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await mobileFetchJson<{ ok: boolean }>("/api/mobile/me", {
      accessToken: "token-123",
    });

    expect(response).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:3000/api/mobile/me",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3001/api/mobile/me",
      expect.any(Object),
    );
  });
});
