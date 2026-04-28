import { getApp, getApps, initializeApp, cert, type App } from "firebase-admin/app";
import {
  getAuth,
  type DecodedIdToken,
  type ListUsersResult,
  type UserRecord,
} from "firebase-admin/auth";
import { cookies } from "next/headers";

import { buildAuthUser, type AuthUser } from "@/lib/auth-user";
import {
  getFirebaseAdminEnv,
  getFirebasePublicEnv,
  hasFirebaseAdminEnv,
} from "@/lib/env";

export const FIREBASE_SESSION_COOKIE = "gym_firebase_session";

let adminApp: App | null = null;

function getFirebaseAdminApp() {
  if (!hasFirebaseAdminEnv()) {
    return null;
  }

  if (adminApp) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }

  const env = getFirebaseAdminEnv();
  
  // Basic validation to avoid cryptic initialization errors
  if (!env.privateKey || !env.privateKey.includes("BEGIN PRIVATE KEY")) {
    console.error("Firebase Private Key no tiene un formato valido.");
    return null;
  }

  try {
    adminApp = initializeApp({
      credential: cert({
        clientEmail: env.clientEmail,
        privateKey: env.privateKey,
        projectId: env.projectId,
      }),
      projectId: env.projectId,
    });
  } catch (error) {
    console.error("Fallo al inicializar Firebase Admin App:", error);
    return null;
  }

  return adminApp;
}

export function getFirebaseAdminAuth() {
  const app = getFirebaseAdminApp();

  if (!app) {
    throw new Error("Firebase Admin no esta configurado.");
  }

  return getAuth(app);
}

export async function getFirebaseSessionTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(FIREBASE_SESSION_COOKIE)?.value ?? null;
}

function resolveProviderFromToken(decodedToken: DecodedIdToken) {
  return decodedToken.firebase?.sign_in_provider ?? "password";
}

function toAuthUser(input: {
  decodedToken: DecodedIdToken;
  userRecord?: UserRecord | null;
}) {
  const fullName =
    input.userRecord?.displayName ??
    (typeof input.decodedToken.name === "string" ? input.decodedToken.name : null);

  return buildAuthUser({
    id: input.decodedToken.uid,
    email: input.decodedToken.email ?? input.userRecord?.email ?? null,
    emailVerified: input.decodedToken.email_verified ?? input.userRecord?.emailVerified ?? false,
    createdAt: input.userRecord?.metadata.creationTime ?? null,
    fullName,
    lastSignInAt: input.userRecord?.metadata.lastSignInTime ?? null,
    provider: resolveProviderFromToken(input.decodedToken),
  });
}

export async function verifyFirebaseSessionToken(idToken: string, checkRevoked = false) {
  const auth = getFirebaseAdminAuth();
  return auth.verifyIdToken(idToken, checkRevoked);
}

export async function getFirebaseUserFromIdToken(
  idToken: string,
  providedDecodedToken?: DecodedIdToken,
): Promise<AuthUser | null> {
  if (!hasFirebaseAdminEnv() || (!idToken && !providedDecodedToken)) {
    return null;
  }

  try {
    const decodedToken = providedDecodedToken ?? (await verifyFirebaseSessionToken(idToken));
    let userRecord: UserRecord | null = null;

    try {
      userRecord = await getFirebaseAdminAuth().getUser(decodedToken.uid);
    } catch {
      userRecord = null;
    }

    return toAuthUser({
      decodedToken,
      userRecord,
    });
  } catch {
    return null;
  }
}

export async function getCurrentFirebaseUserFromCookies(): Promise<AuthUser | null> {
  if (!hasFirebaseAdminEnv()) {
    return null;
  }

  const idToken = await getFirebaseSessionTokenFromCookies();

  if (!idToken) {
    return null;
  }

  return getFirebaseUserFromIdToken(idToken);
}

export async function getFirebaseSessionBearerHeader() {
  const idToken = await getFirebaseSessionTokenFromCookies();

  if (!idToken) {
    return null;
  }

  return `Bearer ${idToken}`;
}

export async function verifyFirebasePassword(email: string, password: string) {
  const publicEnv = getFirebasePublicEnv();
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${publicEnv.apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    },
  );

  if (!response.ok) {
    return false;
  }

  return true;
}

export async function listAllFirebaseUsers() {
  const auth = getFirebaseAdminAuth();
  const users: UserRecord[] = [];
  let nextPageToken: string | undefined;

  do {
    const page: ListUsersResult = await auth.listUsers(1000, nextPageToken);
    users.push(...page.users);
    nextPageToken = page.pageToken;
  } while (nextPageToken);

  return users;
}
