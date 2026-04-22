"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Repeat } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { createMembershipRequestFromDashboardAction } from "@/app/(admin)/dashboard/membresias/actions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { MembershipPlan } from "@/lib/memberships";
import { membershipAdminCreateRequestSchema, type MembershipAdminCreateRequestInput } from "@/lib/validators/memberships";

// Domain Specific Imports
import { toMembershipRequestFormValues } from "@/features/admin/memberships/services/membership-mappers";
import { MembershipPlanSection } from "@/features/admin/memberships/components/MembershipPlanSection";
import { MembershipCycleSection } from "@/features/admin/memberships/components/MembershipCycleSection";
import { MembershipNotesSection } from "@/features/admin/memberships/components/MembershipNotesSection";

interface MembershipRequestCreateFormProps {
  defaultPlanId?: string | null;
  latestRequestId?: string | null;
  memberId: string;
  membershipPlans: MembershipPlan[];
}

export default function MembershipRequestCreateForm({
  defaultPlanId = null,
  latestRequestId = null,
  memberId,
  membershipPlans,
}: Readonly<MembershipRequestCreateFormProps>) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<MembershipAdminCreateRequestInput>({
    resolver: zodResolver(membershipAdminCreateRequestSchema),
    defaultValues: {
      ...toMembershipRequestFormValues(defaultPlanId, membershipPlans),
      memberId,
      renewsFromRequestId: latestRequestId,
      source: latestRequestId ? "renewal" : "admin-dashboard",
    },
  });

  function onSubmit(values: MembershipAdminCreateRequestInput) {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await createMembershipRequestFromDashboardAction(values);
        router.push(`/dashboard/membresias/pedidos/${result.id}`);
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : "No se pudo abrir la solicitud manual.",
        );
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 border border-black/10 bg-black/[0.02] p-8 shadow-sm">
        <MembershipPlanSection membershipPlans={membershipPlans} />
        <MembershipCycleSection />
        <MembershipNotesSection />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-black/5 pt-8">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-[#5f6368] uppercase leading-relaxed max-w-md">
              {feedback ?? "La solicitud se gestiona aparte del carrito para mantener la integridad de la membresía."}
            </p>
          </div>
          
          <Button
            type="submit"
            disabled={isPending}
            className="h-14 px-10 bg-[#111111] text-white font-black uppercase tracking-[0.2em] hover:bg-[#d71920] transition-all rounded-none"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : latestRequestId ? (
              <Repeat className="mr-2 h-5 w-5" />
            ) : (
              <PlusCircle className="mr-2 h-5 w-5" />
            )}
            {latestRequestId ? "Renovar membresía" : "Generar Solicitud"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
