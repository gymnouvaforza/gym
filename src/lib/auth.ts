import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { ADMIN_LOGIN_PATH } from "@/lib/admin";
import type { AuthUser } from "@/lib/auth-user";
import { getCurrentFirebaseUserFromCookies } from "@/lib/firebase/server";
import {
  getLocalAdminEnv,
  hasLocalAdminEnv,
  hasSupabaseServiceRole,
} from "@/lib/env";
import {
  countUsersWithRole,
  SUPERADMIN_ROLE,
  DASHBOARD_ADMIN_ROLE,
  isUserRolesSchemaError,
  listUserRolesForServerSession,
  TRAINER_ROLE,
} from "@/lib/user-roles";

export const LOCAL_ADMIN_COOKIE = "gym_admin_session";
export const DASHBOARD_ROLE_OVERRIDE_COOKIE = "gym_e2e_dashboard_role";
export const MEMBER_LOGIN_PATH = "/acceso";

export interface LocalAdminUser {
  email: string;
  id: string;
  isLocalAdmin: true;
}

export type DashboardAccessMode =
  | "superadmin"
  | "admin"
  | "trainer"
  | "bootstrap"
  | "local";

export interface DashboardAccessState {
  accessMode: DashboardAccessMode | null;
  accessWarning: string | null;
  user: AuthUser | LocalAdminUser | null;
}

type DashboardRoleOverride = Extract<DashboardAccessMode, "superadmin" | "admin" | "trainer">;

function resolveDashboardRoleOverride(input: string | undefined): DashboardRoleOverride | null {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  switch (input) {
    case "superadmin":
    case "admin":
    case "trainer":
      return input;
    default:
      return null;
  }
}

function createLocalAdminUser(user: string): LocalAdminUser {
  return {
    email: `${user} (local)`,
    id: `local-admin:${user}`,
    isLocalAdmin: true,
  };
}

export const isLocalAdminSession = cache(async function isLocalAdminSession() {
  if (!hasLocalAdminEnv()) {
    return false;
  }

  const adminEnv = getLocalAdminEnv();
  const cookieStore = await cookies();
  const localSession = cookieStore.get(LOCAL_ADMIN_COOKIE)?.value;

  return Boolean(adminEnv && localSession === adminEnv.user);
});

export const getAuthenticatedUser = cache(async function getAuthenticatedUser() {
  return getCurrentFirebaseUserFromCookies();
});

export async function getCurrentMemberUser() {
  return getAuthenticatedUser();
}

async function canBootstrapDashboardAccess() {
  if (!hasSupabaseServiceRole()) {
    return false;
  }

  try {
    return (await countUsersWithRole(DASHBOARD_ADMIN_ROLE)) === 0;
  } catch (error) {
    if (isUserRolesSchemaError(error)) {
      return true;
    }

    console.warn(
      "Supabase admin role count could not be resolved while determining dashboard bootstrap access.",
      error instanceof Error ? error.message : String(error),
    );

    return false;
  }
}

export const getDashboardAccessState = cache(
  async function getDashboardAccessState(): Promise<DashboardAccessState> {
  const cookieStore = await cookies();
  const roleOverride = resolveDashboardRoleOverride(
    cookieStore.get(DASHBOARD_ROLE_OVERRIDE_COOKIE)?.value,
  );
  const authenticatedUser = await getAuthenticatedUser();

  if (authenticatedUser?.id) {
    try {
      const roles = await listUserRolesForServerSession(authenticatedUser.id);

      if (
        roles.includes(SUPERADMIN_ROLE) ||
        roles.includes(DASHBOARD_ADMIN_ROLE) ||
        roles.includes(TRAINER_ROLE)
      ) {
        const accessMode =
          roles.includes(SUPERADMIN_ROLE)
            ? "superadmin"
            : roles.includes(DASHBOARD_ADMIN_ROLE)
              ? "admin"
              : "trainer";

        return {
          user: authenticatedUser,
          accessMode,
          accessWarning: null,
        };
      }

      if (await canBootstrapDashboardAccess()) {
        return {
          user: authenticatedUser,
          accessMode: "bootstrap",
          accessWarning:
            "El dashboard esta en modo bootstrap: todavia no existe ningun admin persistente en Supabase. Crea el rol `admin` en `public.user_roles` para cerrar este acceso provisional.",
        };
      }
    } catch (error) {
      if (isUserRolesSchemaError(error)) {
        return {
          user: authenticatedUser,
          accessMode: "bootstrap",
          accessWarning:
            "La tabla `public.user_roles` aun no esta disponible para el dashboard. Se habilita acceso provisional mientras terminas la migracion de roles.",
        };
      }

      console.warn(
        "Supabase dashboard roles could not be resolved while determining admin access.",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  if (await isLocalAdminSession()) {
    const adminEnv = getLocalAdminEnv();
    if (adminEnv) {
      if (roleOverride) {
        return {
          user: createLocalAdminUser(adminEnv.user),
          accessMode: roleOverride,
          accessWarning: null,
        };
      }

      return {
        user: createLocalAdminUser(adminEnv.user),
        accessMode: "local",
        accessWarning: null,
      };
    }
  }

  return {
    user: null,
    accessMode: null,
    accessWarning: null,
  };
  },
);

export async function getCurrentAdminUser(): Promise<AuthUser | LocalAdminUser | null> {
  const accessState = await getDashboardAccessState();
  return accessState.user;
}

export async function requireMemberUser(redirectTo = MEMBER_LOGIN_PATH) {
  const user = await getCurrentMemberUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

export async function requireAdminUser(redirectTo = `${ADMIN_LOGIN_PATH}?error=admin-only`) {
  const user = await getCurrentAdminUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

export async function requireSuperadminUser(
  redirectTo = `${ADMIN_LOGIN_PATH}?error=admin-only`,
) {
  const accessState = await getDashboardAccessState();

  if (!accessState.user || accessState.accessMode !== "superadmin") {
    redirect(redirectTo);
  }

  return accessState.user;
}

export const getDashboardCapabilities = cache(async function getDashboardCapabilities() {
  const accessState = await getDashboardAccessState();
  const canManageRealData = hasSupabaseServiceRole();

  return {
    canManageRealData,
    accessMode: accessState.accessMode,
    accessWarning: accessState.accessWarning,
    isBootstrap: accessState.accessMode === "bootstrap",
    isSuperadmin: accessState.accessMode === "superadmin",
    isLocalReadOnly: accessState.accessMode === "local" && !canManageRealData,
    isReadOnly: !canManageRealData,
  };
});
