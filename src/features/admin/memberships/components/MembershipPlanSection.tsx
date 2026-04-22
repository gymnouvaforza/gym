import { Ticket } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { AdminFormSelect } from "@/components/admin/shared/forms/AdminFormSelect";
import type { MembershipPlan } from "@/lib/memberships";

interface MembershipPlanSectionProps {
  membershipPlans: MembershipPlan[];
}

export function MembershipPlanSection({ membershipPlans }: MembershipPlanSectionProps) {
  const { watch } = useFormContext();
  const membershipPlanId = watch("membershipPlanId");
  const selectedPlan = membershipPlans.find((p) => p.id === membershipPlanId);

  return (
    <AdminSection title="Plan de Membresía" icon={Ticket}>
      <div className="space-y-3">
        <AdminFormSelect
          name="membershipPlanId"
          label="Selecciona un plan"
          options={[
            { value: "", label: "Selecciona un plan" },
            ...membershipPlans.map((p) => ({
              value: p.id,
              label: p.title,
            })),
          ]}
        />
        {selectedPlan && (
          <p className="text-[10px] font-bold text-[#5f6368] uppercase px-1">
            {selectedPlan.billing_label ?? `${selectedPlan.duration_days} días`} · S/ {selectedPlan.price_amount.toFixed(2)}
          </p>
        )}
      </div>
    </AdminSection>
  );
}
