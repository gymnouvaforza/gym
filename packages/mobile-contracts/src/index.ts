import { z } from "zod";

export const MobileRoleSchema = z.enum(["member", "staff"]);
export type MobileRole = z.infer<typeof MobileRoleSchema>;

export const MobileStaffAccessLevelSchema = z.enum(["trainer", "admin", "superadmin"]);
export type MobileStaffAccessLevel = z.infer<typeof MobileStaffAccessLevelSchema>;

export const MemberStatusSchema = z.enum([
  "prospect",
  "active",
  "paused",
  "cancelled",
  "former",
]);
export type MemberStatus = z.infer<typeof MemberStatusSchema>;

export const MemberSummaryDtoSchema = z.object({
  id: z.string(),
  memberNumber: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  status: MemberStatusSchema,
  planLabel: z.string(),
  joinDate: z.string(),
  branchName: z.string().nullable(),
  currentRoutineTitle: z.string().nullable(),
  nextActionLabel: z.string().nullable(),
});
export type MemberSummaryDto = z.infer<typeof MemberSummaryDtoSchema>;

export const MemberPlanSnapshotDtoSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(["active", "paused", "cancelled", "expired"]),
  startedAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  notes: z.string().nullable(),
});
export type MemberPlanSnapshotDto = z.infer<typeof MemberPlanSnapshotDtoSchema>;

export const MobileSessionSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: MobileRoleSchema,
  staffAccessLevel: MobileStaffAccessLevelSchema.nullable(),
  displayName: z.string(),
  member: MemberSummaryDtoSchema.nullable(),
  hasActiveRoutine: z.boolean(),
});
export type MobileSession = z.infer<typeof MobileSessionSchema>;

export const MobileSystemModuleNameSchema = z.enum([
  "tienda",
  "rutinas",
  "mobile",
  "leads",
  "marketing",
  "cms",
]);
export type MobileSystemModuleName = z.infer<typeof MobileSystemModuleNameSchema>;

export const MobileSystemModuleDtoSchema = z.object({
  name: MobileSystemModuleNameSchema,
  label: z.string(),
  description: z.string(),
  disabledImpact: z.string(),
  isEnabled: z.boolean(),
  updatedAt: z.string(),
});
export type MobileSystemModuleDto = z.infer<typeof MobileSystemModuleDtoSchema>;

export const MobileSystemModulesResponseSchema = z.object({
  items: z.array(MobileSystemModuleDtoSchema),
});
export type MobileSystemModulesResponse = z.infer<typeof MobileSystemModulesResponseSchema>;

export const UpdateMobileSystemModuleInputSchema = z.object({
  isEnabled: z.boolean(),
});
export type UpdateMobileSystemModuleInput = z.infer<typeof UpdateMobileSystemModuleInputSchema>;

export const UpdateMobileSystemModuleResponseSchema = z.object({
  item: MobileSystemModuleDtoSchema,
});
export type UpdateMobileSystemModuleResponse = z.infer<typeof UpdateMobileSystemModuleResponseSchema>;

export const RoutineExerciseDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  sets: z.string(),
  reps: z.string(),
  restSeconds: z.number().int().nonnegative(),
  notes: z.string().nullable(),
  liked: z.boolean(),
  memberNote: z.string().nullable(),
});
export type RoutineExerciseDto = z.infer<typeof RoutineExerciseDtoSchema>;

export const RoutineBlockDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  exercises: z.array(RoutineExerciseDtoSchema),
});
export type RoutineBlockDto = z.infer<typeof RoutineBlockDtoSchema>;

export const RoutineSummaryDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  goal: z.string(),
  summary: z.string(),
  durationLabel: z.string(),
  intensityLabel: z.string(),
  statusLabel: z.string(),
  heroImageUrl: z.string().nullable(),
});
export type RoutineSummaryDto = z.infer<typeof RoutineSummaryDtoSchema>;

export const RoutineDetailDtoSchema = RoutineSummaryDtoSchema.extend({
  assignedAt: z.string(),
  trainerName: z.string().nullable(),
  startsOn: z.string().nullable(),
  endsOn: z.string().nullable(),
  recommendedScheduleLabel: z.string().nullable(),
  liked: z.boolean(),
  memberNote: z.string().nullable(),
  blocks: z.array(RoutineBlockDtoSchema),
});
export type RoutineDetailDto = z.infer<typeof RoutineDetailDtoSchema>;

export const TrainingFeedbackRoutineDtoSchema = z.object({
  liked: z.boolean(),
  note: z.string().nullable(),
});
export type TrainingFeedbackRoutineDto = z.infer<typeof TrainingFeedbackRoutineDtoSchema>;

export const TrainingFeedbackExerciseDtoSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  liked: z.boolean(),
  note: z.string().nullable(),
});
export type TrainingFeedbackExerciseDto = z.infer<typeof TrainingFeedbackExerciseDtoSchema>;

export const TrainingFeedbackDtoSchema = z.object({
  routine: TrainingFeedbackRoutineDtoSchema.nullable(),
  exercises: z.array(TrainingFeedbackExerciseDtoSchema),
});
export type TrainingFeedbackDto = z.infer<typeof TrainingFeedbackDtoSchema>;

export const RoutineTemplateDtoSchema = RoutineSummaryDtoSchema.extend({
  blockCount: z.number().int().nonnegative(),
  difficultyLabel: z.string(),
  exerciseCount: z.number().int().nonnegative(),
  notes: z.string().nullable(),
  slug: z.string(),
  trainerName: z.string().nullable(),
  updatedAt: z.string(),
  blocks: z.array(RoutineBlockDtoSchema),
});
export type RoutineTemplateDto = z.infer<typeof RoutineTemplateDtoSchema>;

export const RoutineAssignmentDtoSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  templateId: z.string(),
  templateTitle: z.string(),
  assignedAt: z.string(),
  startsOn: z.string().nullable(),
  endsOn: z.string().nullable(),
  status: z.enum(["active", "archived", "completed"]),
  notes: z.string().nullable(),
  trainerName: z.string().nullable(),
});
export type RoutineAssignmentDto = z.infer<typeof RoutineAssignmentDtoSchema>;

export const RoutineHistoryItemDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completedAt: z.string(),
  metricLabel: z.string(),
  metricValue: z.string(),
});
export type RoutineHistoryItemDto = z.infer<typeof RoutineHistoryItemDtoSchema>;

export const MemberStatusDtoSchema = z.object({
  label: z.string(),
  status: MemberStatusSchema,
  helperText: z.string(),
});
export type MemberStatusDto = z.infer<typeof MemberStatusDtoSchema>;

export const StaffDashboardActivityItemDtoSchema = z.object({
  id: z.string(),
  memberName: z.string(),
  description: z.string(),
  accentLabel: z.string(),
});
export type StaffDashboardActivityItemDto = z.infer<typeof StaffDashboardActivityItemDtoSchema>;

export const StaffDashboardDtoSchema = z.object({
  activeMembers: z.number().int().nonnegative(),
  pendingAssignments: z.number().int().nonnegative(),
  quickActions: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      href: z.string(),
    }),
  ),
  recentActivity: z.array(StaffDashboardActivityItemDtoSchema),
  systemStatus: z.string(),
});
export type StaffDashboardDto = z.infer<typeof StaffDashboardDtoSchema>;

export const StaffMemberListItemDtoSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  status: MemberStatusSchema,
  planLabel: z.string(),
  routineTitle: z.string().nullable(),
  priorityLabel: z.string().nullable(),
});
export type StaffMemberListItemDto = z.infer<typeof StaffMemberListItemDtoSchema>;

export const StaffMemberDetailDtoSchema = z.object({
  member: MemberSummaryDtoSchema,
  plan: MemberPlanSnapshotDtoSchema.nullable(),
  status: MemberStatusDtoSchema,
  activeRoutine: RoutineSummaryDtoSchema.nullable(),
  trainingFeedback: TrainingFeedbackDtoSchema,
  assignmentHistory: z.array(RoutineAssignmentDtoSchema),
  lastAttendanceLabel: z.string(),
  branchLabel: z.string(),
  accountTypeLabel: z.string(),
  quickStats: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      value: z.string(),
    }),
  ),
  recommendedAction: z.object({
    title: z.string(),
    helperText: z.string(),
  }),
});
export type StaffMemberDetailDto = z.infer<typeof StaffMemberDetailDtoSchema>;

export const RoutineTemplateListItemDtoSchema = z.object({
  blockCount: z.number().int().nonnegative(),
  difficultyLabel: z.string(),
  id: z.string(),
  exerciseCount: z.number().int().nonnegative(),
  title: z.string(),
  durationLabel: z.string(),
  intensityLabel: z.string(),
  goal: z.string(),
  statusLabel: z.string(),
  summary: z.string(),
  trainerName: z.string().nullable(),
  updatedAt: z.string(),
});
export type RoutineTemplateListItemDto = z.infer<typeof RoutineTemplateListItemDtoSchema>;

export const AssignRoutineInputSchema = z.object({
  memberId: z.string().min(1),
  templateId: z.string().min(1),
  notes: z.string().trim().max(280).optional(),
  startsOn: z.string().nullable().optional(),
  endsOn: z.string().nullable().optional(),
  recommendedScheduleLabel: z.string().trim().max(120).nullable().optional(),
});
export type AssignRoutineInput = z.infer<typeof AssignRoutineInputSchema>;

export const UpdateRoutineFeedbackInputSchema = z.object({
  liked: z.boolean(),
  note: z.string().trim().max(280).nullable().optional(),
});
export type UpdateRoutineFeedbackInput = z.infer<typeof UpdateRoutineFeedbackInputSchema>;

export const UpdateExerciseFeedbackInputSchema = z.object({
  liked: z.boolean(),
  note: z.string().trim().max(280).nullable().optional(),
});
export type UpdateExerciseFeedbackInput = z.infer<typeof UpdateExerciseFeedbackInputSchema>;

export const CreateMemberInputSchema = z.object({
  linkedUserId: z.string().uuid().nullable().optional(),
  trainerUserId: z.string().uuid().nullable().optional(),
  fullName: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(120),
  email: z.string().trim().email("Formato de email inválido"),
  phone: z.string().trim().max(40).nullable().optional(),
  status: MemberStatusSchema.default("prospect"),
  branchName: z.string().trim().max(120).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  joinDate: z.string().min(1, "La fecha de alta es requerida"),
  planLabel: z.string().trim().min(2, "La etiqueta debe tener al menos 2 caracteres").max(120),
  planStatus: MemberPlanSnapshotDtoSchema.shape.status.default("active"),
  planStartedAt: z.string().nullable().optional(),
  planEndsAt: z.string().nullable().optional(),
  planNotes: z.string().trim().max(1000).nullable().optional(),
});
export type CreateMemberInput = z.infer<typeof CreateMemberInputSchema>;

export const UpdateMemberInputSchema = z.object({
  status: MemberStatusSchema.optional(),
  branchName: z.string().trim().max(120).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});
export type UpdateMemberInput = z.infer<typeof UpdateMemberInputSchema>;

export const AssignRoutineResponseSchema = z.object({
  assignmentId: z.string(),
  memberId: z.string(),
  templateId: z.string(),
  status: z.enum(["queued", "active"]),
  message: z.string(),
});
export type AssignRoutineResponse = z.infer<typeof AssignRoutineResponseSchema>;

export const MemberRoutineResponseSchema = z.object({
  routine: RoutineDetailDtoSchema.nullable(),
});
export type MemberRoutineResponse = z.infer<typeof MemberRoutineResponseSchema>;

export const MemberHistoryResponseSchema = z.object({
  items: z.array(RoutineHistoryItemDtoSchema),
});
export type MemberHistoryResponse = z.infer<typeof MemberHistoryResponseSchema>;

export const StaffMembersResponseSchema = z.object({
  items: z.array(StaffMemberListItemDtoSchema),
});
export type StaffMembersResponse = z.infer<typeof StaffMembersResponseSchema>;

export const StaffTemplatesResponseSchema = z.object({
  items: z.array(RoutineTemplateListItemDtoSchema),
});
export type StaffTemplatesResponse = z.infer<typeof StaffTemplatesResponseSchema>;
