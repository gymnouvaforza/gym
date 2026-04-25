"use client";

import { CircleDollarSign, Loader2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { addMembershipPaymentEntryAction } from "@/app/(admin)/dashboard/membresias/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCartAmount } from "@/lib/cart/format";

interface MembershipRequestPaymentFormProps {
  balanceDue: number;
  currencyCode: string;
  memberId: string;
  membershipRequestId: string;
}

export default function MembershipRequestPaymentForm({
  balanceDue,
  currencyCode,
  memberId,
  membershipRequestId,
}: Readonly<MembershipRequestPaymentFormProps>) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const normalizedBalance = useMemo(
    () => Number(Math.max(balanceDue, 0).toFixed(2)),
    [balanceDue],
  );
  const parsedAmount = Number.parseFloat(amount.replace(",", "."));
  const hasValidPartialAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const isOverpaying = hasValidPartialAmount && parsedAmount > normalizedBalance && normalizedBalance > 0;
  const isAdjustment = hasValidPartialAmount && normalizedBalance <= 0;

  function submitPayment(mode: "partial" | "full") {
    const resolvedAmount = mode === "full" ? normalizedBalance : parsedAmount;
    setFeedback(null);

    startTransition(async () => {
      try {
        await addMembershipPaymentEntryAction(
          membershipRequestId,
          {
            amount: resolvedAmount,
            note,
          },
          memberId,
        );
        setAmount("");
        setNote("");
        
        let successMessage = "Abono parcial registrado en el ledger manual.";
        if (mode === "full") {
          successMessage = "Membresia cubierta al completo. La ficha recalculo el estado automáticamente.";
        } else if (isAdjustment) {
          successMessage = "Ajuste manual registrado correctamente.";
        } else if (isOverpaying) {
          successMessage = "Sobrepago registrado. El saldo resultará a favor del socio.";
        }

        setFeedback(successMessage);
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : "No se pudo registrar el cobro de la membresia.",
        );
      }
    });
  }

  return (
    <div className="space-y-4 border border-black/10 bg-black/[0.02] p-5">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label
            htmlFor={`membership-payment-amount-${membershipRequestId}`}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]"
          >
            Importe del abono
          </Label>
          <Input
            id={`membership-payment-amount-${membershipRequestId}`}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder={normalizedBalance > 0 ? `${normalizedBalance}` : "0.00"}
          />
          
          {isOverpaying && (
            <p className="text-[10px] font-bold text-[#d71920] uppercase tracking-wider">
              Aviso: El importe supera el saldo pendiente. Se registrará como sobrepago.
            </p>
          )}
          
          {isAdjustment && (
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Info: El saldo actual es 0. Se registrará como ajuste o pago extra.
            </p>
          )}

          <p className="text-xs leading-relaxed text-[#5f6368]">
            El cobro se registra de forma manual y acumulativa. Puedes añadir abonos pequeños
            o ajustes sin depender de la sincronización externa.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`membership-payment-note-${membershipRequestId}`}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]"
          >
            Nota del cobro
          </Label>
          <Textarea
            id={`membership-payment-note-${membershipRequestId}`}
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ejemplo: abono en efectivo, transferencia o ajuste manual."
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-black/8 pt-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => submitPayment("partial")}
            disabled={isPending || !hasValidPartialAmount}
            className="h-11 flex-1 rounded-none text-[10px] font-black uppercase tracking-[0.14em]"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            {isAdjustment ? "Registrar ajuste" : "Registrar abono"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => submitPayment("full")}
            disabled={isPending || normalizedBalance <= 0}
            className="h-11 flex-1 rounded-none text-[10px] font-black uppercase tracking-[0.14em]"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CircleDollarSign className="h-4 w-4" />
            )}
            Cubrir saldo pendiente
          </Button>
        </div>

        <p className="text-sm text-[#5f6368]" aria-live="polite">
          {isPending
            ? "Procesando pago manual..."
            : feedback ?? `Saldo pendiente actual: ${formatCartAmount(normalizedBalance, currencyCode)}.`}
        </p>
      </div>
    </div>
  );
}
