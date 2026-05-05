"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import {
  PUBLIC_CACHE_TAGS,
  revalidatePublicCacheTags,
} from "@/lib/cache/public-cache";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  membershipPlanFormSchema,
  type MembershipPlanFormValues,
} from "@/lib/validators/memberships";

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function slugFromCode(value: string) {
  return normalizeCode(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function revalidateMembershipPlans() {
  revalidatePath("/dashboard/membresias");
  revalidatePath("/dashboard/membresias/planes");
  revalidatePath("/");
  revalidatePublicCacheTags([PUBLIC_CACHE_TAGS.membershipPlans]);
}

export async function saveMembershipPlan(values: MembershipPlanFormValues, planId?: string) {
  await requireAdminUser();

  const parsed = membershipPlanFormSchema.parse(values);
  const supabase = createSupabaseAdminClient();
  const code = normalizeCode(parsed.code);
  const payload = {
    billing_label: `${parsed.duration_days} dias`,
    bonus_days: parsed.bonus_days,
    code,
    description: parsed.description,
    duration_days: parsed.duration_days,
    is_freezable: parsed.is_freezable,
    max_freeze_days: parsed.is_freezable ? parsed.max_freeze_days : 0,
    price_amount: parsed.price_amount,
    slug: slugFromCode(code),
    title: parsed.title,
  };

  const query = planId
    ? supabase.from("membership_plans").update(payload).eq("id", planId).select("id").single()
    : supabase.from("membership_plans").insert(payload).select("id").single();

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidateMembershipPlans();

  return data.id;
}

export async function deleteMembershipPlan(planId: string) {
  await requireAdminUser();

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("membership_plans").delete().eq("id", planId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateMembershipPlans();
}
