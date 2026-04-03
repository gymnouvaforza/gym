import { getMobileConfig } from "@/lib/mobile-config";

interface FetchOptions extends RequestInit {
  accessToken?: string | null;
}

const LOCAL_DEV_PORTS = ["3001", "3000"];

function isPrivateHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "10.0.2.2" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function buildRequestInit(options?: FetchOptions): RequestInit {
  return {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options?.accessToken ? { authorization: `Bearer ${options.accessToken}` } : {}),
      ...(options?.headers ?? {}),
    },
  };
}

async function readResponsePayload(response: Response) {
  return response.json().catch(() => null);
}

function shouldRetryOnAlternateLocalPort(url: URL, response?: Response | null, payload?: unknown) {
  if (!isPrivateHostname(url.hostname) || !LOCAL_DEV_PORTS.includes(url.port || "")) {
    return false;
  }

  if (!response) {
    return true;
  }

  if (response.ok) {
    return false;
  }

  const contentType = response.headers?.get?.("content-type")?.toLowerCase() ?? "";
  const hasStructuredError =
    Boolean(payload) && typeof payload === "object" && "error" in (payload as Record<string, unknown>);

  return contentType.includes("text/html") || !hasStructuredError;
}

export class MobileApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function mobileFetchJson<T>(path: string, options?: FetchOptions): Promise<T> {
  const config = getMobileConfig();
  const url = new URL(path, config.apiBaseUrl);
  const requestInit = buildRequestInit(options);
  let response: Response | null = null;
  let payload: unknown = null;

  try {
    response = await fetch(url.toString(), requestInit);
    payload = await readResponsePayload(response);
  } catch (error) {
    if (!shouldRetryOnAlternateLocalPort(url)) {
      throw error;
    }
  }

  if (shouldRetryOnAlternateLocalPort(url, response, payload)) {
    for (const alternatePort of LOCAL_DEV_PORTS) {
      if (alternatePort === (url.port || "")) {
        continue;
      }

      const alternateUrl = new URL(url.toString());
      alternateUrl.port = alternatePort;

      try {
        const alternateResponse = await fetch(alternateUrl.toString(), requestInit);
        const alternatePayload = await readResponsePayload(alternateResponse);

        if (alternateResponse.ok) {
          return alternatePayload as T;
        }

        response = alternateResponse;
        payload = alternatePayload;

        if (!shouldRetryOnAlternateLocalPort(alternateUrl, alternateResponse, alternatePayload)) {
          break;
        }
      } catch (error) {
        if (alternatePort === LOCAL_DEV_PORTS[LOCAL_DEV_PORTS.length - 1]) {
          throw error;
        }
      }
    }
  }

  if (!response) {
    throw new Error("No se pudo conectar con el backend mobile.");
  }

  if (!response.ok) {
    throw new MobileApiError(
      (payload as { error?: string } | null)?.error ?? "No se pudo completar la operación.",
      response.status,
    );
  }

  return payload as T;
}
