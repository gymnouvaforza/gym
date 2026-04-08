"use client";

import { Loader2, PlusCircle, Repeat } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { createMembershipRequestFromDashboardAction } from "@/app/(admin)/dashboard/membresias/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MembershipPlan } from "@/lib/memberships";

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
  const [membershipPlanId, setMembershipPlanId] = useState(defaultPlanId ?? membershipPlans[0]?.id ?? "");
  const [cycleStartsOn, setCycleStartsOn] = useState("");
  const [cycleEndsOn, setCycleEndsOn] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedPlan = useMemo(
    () => membershipPlans.find((plan) => plan.id === membershipPlanId) ?? null,
    [membershipPlanId, membershipPlans],
  );

  function handleSubmit() {
    if (!membershipPlanId) {
      setFeedback("Selecciona un plan antes de crear la solicitud.");
      return;
    }

    setFeedback(null);

    startTransition(async () => {
      try {
        const result = await createMembershipRequestFromDashboardAction({
          memberId,
          membershipPlanId,
          cycleStartsOn: cycleStartsOn || null,
          cycleEndsOn: cycleEndsOn || null,
          notes,
          renewsFromRequestId: latestRequestId,
          source: latestRequestId ? "renewal" : "admin-dashboard",
        });
        router.push(`/dashboard/membresias/pedidos/${result.id}`);
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : "No se pudo abrir la solicitud manual de membresia.",
        );
      }
    });
  }

  return (
    <div className="space-y-4 border border-black/10 bg-black/[0.02] p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
            Plan de membresia
          </Label>
          <select
            value={membershipPlanId}
            onChange={(event) => setMembershipPlanId(event.target.value)}
            className="flex h-11 w-full rounded-none border border-black/10 bg-white px-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#111111] outline-none"
          >
            <option value="">Selecciona un plan</option>
            {membershipPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.title}
              </option>
            ))}
          </select>
          {selectedPlan ? (
            <p className="text-xs text-[#5f6368]">
              {selectedPlan.billing_label ?? `${selectedPlan.duration_days} dias`} · S/ {selectedPlan.price_amount.toFixed(2)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
            Inicio del ciclo
          </Label>
          <Input
            type="date"
            value={cycleStartsOn}
            onChange={(event) => setCycleStartsOn(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
            Fin del ciclo
          </Label>
          <Input
            type="date"
            value={cycleEndsOn}
            onChange={(event) => setCycleEndsOn(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
          Nota operativa
        </Label>
        <Textarea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Ejemplo: renovacion acordada por recepcion, socio paga en dos partes."
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#5f6368]" aria-live="polite">
          {isPending
            ? "Creando solicitud..."
            : feedback ?? "La solicitud se gestiona aparte del carrito de productos para no mezclar operacion."}
        </p>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !membershipPlanId}
          className="h-11 rounded-none text-[10px] font-black uppercase tracking-[0.14em]"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : latestRequestId ? (
            <Repeat className="h-4 w-4" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          {latestRequestId ? "Renovar membresia" : "Crear solicitud"}
        </Button>
      </div>
    </div>
  );
}
