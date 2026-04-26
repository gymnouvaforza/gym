import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorResponse = {
  error: string;
  code?: string;
  details?: unknown;
};

/**
 * Crea una respuesta de error estandarizada y segura para Route Handlers.
 */
export function createApiErrorResponse(
  error: unknown,
  options: {
    status?: number;
    fallbackMessage?: string;
    logError?: boolean;
  } = {}
): NextResponse<ApiErrorResponse> {
  const { status = 400, fallbackMessage = "Error interno del servidor.", logError = true } = options;

  if (logError) {
    console.error("[API Error]:", error);
  }

  // Manejo de errores de validación Zod
  if (error instanceof ZodError || (typeof error === "object" && error !== null && "issues" in error && Array.isArray((error as Record<string, unknown>).issues))) {
    const zodError = error as ZodError;
    return NextResponse.json(
      {
        error: "Error de validación de datos.",
        code: "VALIDATION_ERROR",
        details: zodError.issues?.map((issue) => ({ path: issue.path, message: issue.message })) ?? [],
      },
      { status: 400 }
    );
  }

  // Manejo de errores genéricos con mensaje controlado
  let message = fallbackMessage;
  if (typeof error === "string") {
    message = error;
  } else if (error instanceof Error) {
    // En produccion, no devolvemos el mensaje interno del error a menos que sea un error controlado
    message = process.env.NODE_ENV === "production" ? fallbackMessage : error.message;
  }

  return NextResponse.json(
    {
      error: message,
    },
    { status }
  );
}

/**
 * Respuesta para acceso no autorizado.
 */
export function unauthorizedResponse(message = "No tienes permiso para realizar esta acción.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Respuesta para recurso no encontrado.
 */
export function notFoundResponse(message = "Recurso no encontrado.") {
  return NextResponse.json({ error: message }, { status: 404 });
}
