import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AssignRoutineInput,
  AssignRoutineResponse,
  MemberHistoryResponse,
  MemberRoutineResponse,
  RoutineTemplateListItemDto,
  StaffDashboardDto,
  StaffMemberDetailDto,
  StaffMembersResponse,
  StaffTemplatesResponse,
  UpdateExerciseFeedbackInput,
  UpdateMemberInput,
  UpdateRoutineFeedbackInput,
} from "@mobile-contracts";

import { mobileFetchJson } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

function useAccessToken() {
  const { session } = useAuth();

  return {
    token: session?.access_token ?? null,
  };
}

export function useMemberRoutineQuery() {
  const { token } = useAccessToken();

  return useQuery({
    queryKey: ["member-routine", token],
    enabled: Boolean(token),
    queryFn: () =>
      mobileFetchJson<MemberRoutineResponse>("/api/mobile/me/routine", {
        accessToken: token,
      }),
  });
}

export function useUpdateRoutineFeedbackMutation() {
  const { token } = useAccessToken();
  const queryClient = useQueryClient();
  const queryKey = ["member-routine", token] as const;

  return useMutation({
    mutationFn: (payload: UpdateRoutineFeedbackInput) =>
      mobileFetchJson<MemberRoutineResponse>("/api/mobile/me/routine/feedback", {
        method: "PATCH",
        accessToken: token,
        body: JSON.stringify(payload),
      }),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MemberRoutineResponse>(queryKey);

      if (previous?.routine) {
        queryClient.setQueryData<MemberRoutineResponse>(queryKey, {
          routine: {
            ...previous.routine,
            liked: payload.liked,
            memberNote: payload.note ?? null,
          },
        });
      }

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSuccess: (response) => {
      queryClient.setQueryData(queryKey, response);
    },
  });
}

export function useUpdateExerciseFeedbackMutation() {
  const { token } = useAccessToken();
  const queryClient = useQueryClient();
  const queryKey = ["member-routine", token] as const;

  return useMutation({
    mutationFn: (payload: UpdateExerciseFeedbackInput & { exerciseId: string }) =>
      mobileFetchJson<MemberRoutineResponse>(
        `/api/mobile/me/routine/exercises/${payload.exerciseId}/feedback`,
        {
          method: "PATCH",
          accessToken: token,
          body: JSON.stringify({
            liked: payload.liked,
            note: payload.note ?? null,
          }),
        },
      ),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MemberRoutineResponse>(queryKey);

      if (previous?.routine) {
        queryClient.setQueryData<MemberRoutineResponse>(queryKey, {
          routine: {
            ...previous.routine,
            blocks: previous.routine.blocks.map((block) => ({
              ...block,
              exercises: block.exercises.map((exercise) =>
                exercise.id === payload.exerciseId
                  ? {
                      ...exercise,
                      liked: payload.liked,
                      memberNote: payload.note ?? null,
                    }
                  : exercise,
              ),
            })),
          },
        });
      }

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSuccess: (response) => {
      queryClient.setQueryData(queryKey, response);
    },
  });
}

export function useMemberHistoryQuery() {
  const { token } = useAccessToken();

  return useQuery({
    queryKey: ["member-history", token],
    enabled: Boolean(token),
    queryFn: () =>
      mobileFetchJson<MemberHistoryResponse>("/api/mobile/me/history", {
        accessToken: token,
      }),
  });
}

export function useStaffDashboardQuery() {
  const { token } = useAccessToken();

  return useQuery({
    queryKey: ["staff-dashboard", token],
    enabled: Boolean(token),
    queryFn: () =>
      mobileFetchJson<StaffDashboardDto>("/api/mobile/staff/dashboard", {
        accessToken: token,
      }),
  });
}

export function useStaffMembersQuery(search: string) {
  const { token } = useAccessToken();

  return useQuery({
    queryKey: ["staff-members", token, search],
    enabled: Boolean(token),
    queryFn: () =>
      mobileFetchJson<StaffMembersResponse>(
        `/api/mobile/staff/members${search ? `?q=${encodeURIComponent(search)}` : ""}`,
        {
          accessToken: token,
        },
      ),
  });
}

export function useStaffMemberDetailQuery(memberId: string | string[] | undefined) {
  const { token } = useAccessToken();
  const resolvedId = Array.isArray(memberId) ? memberId[0] : memberId;

  return useQuery({
    queryKey: ["staff-member-detail", token, resolvedId],
    enabled: Boolean(token && resolvedId),
    queryFn: () =>
      mobileFetchJson<StaffMemberDetailDto>(`/api/mobile/staff/members/${resolvedId}`, {
        accessToken: token,
      }),
  });
}

export function useRoutineTemplatesQuery() {
  const { token } = useAccessToken();

  return useQuery({
    queryKey: ["routine-templates", token],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await mobileFetchJson<StaffTemplatesResponse>(
        "/api/mobile/staff/routine-templates",
        {
          accessToken: token,
        },
      );

      return response.items satisfies RoutineTemplateListItemDto[];
    },
  });
}

export function useAssignRoutineMutation() {
  const { token } = useAccessToken();

  return useMutation({
    mutationFn: (payload: AssignRoutineInput) =>
      mobileFetchJson<AssignRoutineResponse>("/api/mobile/staff/routine-assignments", {
        method: "POST",
        accessToken: token,
        body: JSON.stringify(payload),
      }),
  });
}

export function useUpdateStaffMemberMutation(memberId: string | undefined) {
  const { token } = useAccessToken();

  return useMutation({
    mutationFn: (payload: UpdateMemberInput) =>
      mobileFetchJson<StaffMemberDetailDto>(`/api/mobile/staff/members/${memberId}`, {
        method: "PATCH",
        accessToken: token,
        body: JSON.stringify(payload),
      }),
  });
}
