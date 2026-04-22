import type {
  MemberHistoryResponse,
  MemberRoutineResponse,
  MobileSession,
  RoutineTemplateListItemDto,
  StaffDashboardDto,
  StaffMemberDetailDto,
  StaffMembersResponse,
} from "@mobile-contracts";

import type { AuthContextValue } from "@/providers/auth-provider";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export function createMobileSession(
  overrides: DeepPartial<MobileSession> = {},
): MobileSession {
  return {
    displayName: "Nova Tester",
    email: "tester@novaforza.com",
    hasActiveRoutine: true,
    member: {
      branchName: "Centro",
      currentRoutineTitle: "Fuerza base",
      email: "tester@novaforza.com",
      fullName: "Nova Tester",
      id: "member-1",
      joinDate: "2026-01-10",
      memberNumber: "NF-0001",
      nextActionLabel: "Ver rutina activa",
      planLabel: "Elite",
      status: "active",
    },
    role: "member",
    staffAccessLevel: null,
    userId: "user-1",
    ...overrides,
  } as MobileSession;
}

export function createAuthContextValue(
  overrides: Partial<AuthContextValue> = {},
): AuthContextValue {
  const mobileSession = overrides.mobileSession ?? createMobileSession();

  return {
    isHydrated: true,
    isProfileLoading: false,
    mobileSession,
    profileError: null,
    refreshProfile: jest.fn(async () => undefined),
    role: mobileSession?.role ?? null,
    session: {
      access_token: "token-1",
      expires_at: 9999999999,
      expires_in: 3600,
      refresh_token: "refresh-token",
      token_type: "bearer",
      user: {
        app_metadata: {},
        aud: "authenticated",
        created_at: "2026-01-01T00:00:00.000Z",
        id: "user-1",
      },
    } as AuthContextValue["session"],
    signIn: jest.fn(async () => ({ error: null })),
    signOut: jest.fn(async () => undefined),
    signUp: jest.fn(async () => ({ error: null, needsEmailVerification: false })),
    ...overrides,
  };
}

export function createMemberRoutineResponse(
  overrides: DeepPartial<MemberRoutineResponse> = {},
): MemberRoutineResponse {
  return {
    routine: {
      assignedAt: "2026-02-10T10:00:00.000Z",
      blocks: [
        {
          description: "Trabajo principal",
          exercises: [
            {
              id: "exercise-1",
              liked: false,
              memberNote: null,
              name: "Back squat",
              notes: "Tempo controlado",
              reps: "5",
              restSeconds: 120,
              sets: "4",
            },
          ],
          id: "block-1",
          title: "Dia 1",
        },
      ],
      durationLabel: "6 semanas",
      endsOn: "2026-03-24",
      goal: "Fuerza general",
      heroImageUrl: null,
      id: "routine-1",
      intensityLabel: "Media",
      liked: true,
      memberNote: "Me ayuda mucho entrenarla por la tarde.",
      recommendedScheduleLabel: "Lun/Mie/Vie · 19:00",
      startsOn: "2026-02-10",
      statusLabel: "Activa",
      summary: "Base de fuerza para volver a ritmo.",
      title: "Fuerza base",
      trainerName: "Coach Nova",
    },
    ...overrides,
  } as MemberRoutineResponse;
}

export function createMemberHistoryResponse(
  overrides: DeepPartial<MemberHistoryResponse> = {},
): MemberHistoryResponse {
  return {
    items: [
      {
        completedAt: "2026-02-09T10:00:00.000Z",
        id: "history-1",
        metricLabel: "ESTADO",
        metricValue: "ARCHIVADA",
        title: "Rutina anterior",
      },
    ],
    ...overrides,
  } as MemberHistoryResponse;
}

export function createStaffDashboard(
  overrides: DeepPartial<StaffDashboardDto> = {},
): StaffDashboardDto {
  return {
    activeMembers: 12,
    pendingAssignments: 2,
    quickActions: [
      { href: "/members", id: "members", label: "Buscar miembro" },
      { href: "/templates", id: "templates", label: "Plantillas" },
    ],
    recentActivity: [
      {
        accentLabel: "Rutina",
        description: "Fuerza base lista para seguimiento mobile.",
        id: "activity-1",
        memberName: "Nova Tester",
      },
    ],
    systemStatus: "Miembros y rutinas sincronizados.",
    ...overrides,
  } as StaffDashboardDto;
}

export function createStaffMembersResponse(
  overrides: DeepPartial<StaffMembersResponse> = {},
): StaffMembersResponse {
  return {
    items: [
      {
        fullName: "Nova Tester",
        id: "member-1",
        planLabel: "Elite",
        priorityLabel: "Asignar rutina",
        routineTitle: null,
        status: "active",
      },
    ],
    ...overrides,
  } as StaffMembersResponse;
}

export function createStaffMemberDetail(
  overrides: DeepPartial<StaffMemberDetailDto> = {},
): StaffMemberDetailDto {
  return {
    accountTypeLabel: "Elite",
    activeRoutine: {
      durationLabel: "6 semanas",
      goal: "Fuerza general",
      heroImageUrl: null,
      id: "routine-1",
      intensityLabel: "Media",
      statusLabel: "Activa",
      summary: "Base de fuerza",
      title: "Fuerza base",
    },
    assignmentHistory: [],
    branchLabel: "Centro",
    lastAttendanceLabel: "ayer",
    member: createMobileSession().member!,
    plan: {
      endsAt: null,
      id: "plan-1",
      label: "Elite",
      notes: null,
      startedAt: "2026-01-10",
      status: "active",
    },
    trainingFeedback: {
      exercises: [
        {
          exerciseId: "exercise-1",
          exerciseName: "Back squat",
          liked: true,
          note: "Buena carga para empezar.",
        },
      ],
      routine: {
        liked: true,
        note: "Buen bloque para retomar ritmo.",
      },
    },
    quickStats: [
      { id: "member-number", label: "Member", value: "NF-0001" },
    ],
    recommendedAction: {
      helperText: "Puedes ajustar la ficha o reasignar plantilla.",
      title: "REVISAR FICHA",
    },
    status: {
      helperText: "Ficha operativa y lista para consumo mobile.",
      label: "ACTIVE",
      status: "active",
    },
    ...overrides,
  } as StaffMemberDetailDto;
}

export function createRoutineTemplates(
  overrides?: DeepPartial<RoutineTemplateListItemDto>[],
): RoutineTemplateListItemDto[] {
  if (overrides?.length) {
    return overrides as RoutineTemplateListItemDto[];
  }

  return [
    {
      blockCount: 3,
      difficultyLabel: "Media",
      durationLabel: "6 semanas",
      exerciseCount: 12,
      goal: "Fuerza general",
      id: "template-1",
      intensityLabel: "Media",
      statusLabel: "Activa",
      summary: "Base operativa para seguimiento y asignacion recurrente.",
      title: "Fuerza base",
      trainerName: "Coach Nova",
      updatedAt: "2026-04-01T10:00:00.000Z",
    },
  ];
}
