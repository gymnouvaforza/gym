"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";

import { getFirebasePublicEnv, hasFirebasePublicEnv } from "@/lib/env";

let authPromise: Promise<Auth | null> | null = null;

function getFirebaseApp() {
  const config = getFirebasePublicEnv();

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(config);
}

export async function getFirebaseBrowserAuth() {
  if (!hasFirebasePublicEnv()) {
    return null;
  }

  if (!authPromise) {
    authPromise = (async () => {
      const auth = getAuth(getFirebaseApp());
      await setPersistence(auth, browserLocalPersistence);
      return auth;
    })();
  }

  return authPromise;
}
