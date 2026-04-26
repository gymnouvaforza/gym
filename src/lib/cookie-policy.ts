import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const IS_PROD = process.env.NODE_ENV === "production";

/**
 * Politica base para cookies de sesion.
 */
export const SESSION_COOKIE_OPTIONS: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "lax",
  path: "/",
};

/**
 * Politica para cookies de persistencia (ej. carrito).
 */
export const PERSISTENT_COOKIE_OPTIONS: Partial<ResponseCookie> = {
  httpOnly: false, // El cliente puede necesitar leer el cartId
  secure: IS_PROD,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 1 semana
};

/**
 * Politica para cookies de corta duracion (ej. overrides de desarrollo).
 */
export const SHORT_LIVED_COOKIE_OPTIONS: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60, // 1 hora
};
