export interface AuthIdentity {
  provider?: string | null;
}

export interface AuthUser {
  id: string;
  email: string | null;
  emailVerified: boolean;
  created_at?: string | null;
  last_sign_in_at?: string | null;
  app_metadata: {
    full_name?: unknown;
    provider?: unknown;
  } | null;
  user_metadata: {
    full_name?: unknown;
  } | null;
  identities: AuthIdentity[] | null;
}

export function buildAuthUser(input: {
  id: string;
  email?: string | null;
  emailVerified?: boolean;
  createdAt?: string | null;
  fullName?: string | null;
  lastSignInAt?: string | null;
  provider?: string | null;
}): AuthUser {
  const provider = input.provider?.trim() || "password";
  const fullName = input.fullName?.trim() || undefined;

  return {
    id: input.id,
    email: input.email?.trim() || null,
    emailVerified: input.emailVerified ?? false,
    created_at: input.createdAt ?? null,
    last_sign_in_at: input.lastSignInAt ?? null,
    app_metadata: {
      provider,
      ...(fullName ? { full_name: fullName } : {}),
    },
    user_metadata: fullName ? { full_name: fullName } : {},
    identities: [{ provider }],
  };
}
