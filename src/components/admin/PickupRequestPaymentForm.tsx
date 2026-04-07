"use client";

import { CircleDollarSign, Loader2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { addPickupRequestPaymentEntryAction } from "@/app/(admin)/dashboard/tienda/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCartAmount } from "@/lib/cart/format";

interface PickupRequestPaymentFormProps {
  pickupRequestId: string;
  currencyCode: string;
  balanceDue: number;
}

export default function PickupRequestPaymentForm({
  pickupRequestId,
  currencyCode,
  balanceDue,
}: Readonly<PickupRequestPaymentFormProps>) {
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

  function submitPaymentEntry(mode: "partial" | "full") {
    const resolvedAmount = mode === "full" ? normalizedBalance : parsedAmount;

    setFeedback(null);

    startTransition(async () => {
      try {
        await addPickupRequestPaymentEntryAction(pickupRequestId, currencyCode, {
          amount: resolvedAmount,
          note,
        });
        setAmount("");
        setNote("");
        setFeedback(
          mode === "full"
            ? "Pago completo registrado y saldo cubierto."
            : "Abono parcial registrado en la bitacora de pagos.",
        );
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "No se pudo registrar el pago manual.",
        );
      }
    });
  }

  return (
    <div className="space-y-4 border border-black/10 bg-black/[0.02] p-5">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label
            htmlFor={`pickup-request-payment-amount-${pickupRequestId}`}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]"
          >
            Importe del abono
          </Label>
          <Input
            id={`pickup-request-payment-amount-${pickupRequestId}`}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder={normalizedBalance > 0 ? `${normalizedBalance}` : "0.00"}
          />
          <p className="text-xs leading-relaxed text-[#5f6368]">
            Registra cada cobro manual como movimiento nuevo. Si lo prefieres, puedes cubrir
            el saldo pendiente con un solo clic.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`pickup-request-payment-note-${pickupRequestId}`}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]"
          >
            Nota del cobro
          </Label>
          <Textarea
            id={`pickup-request-payment-note-${pickupRequestId}`}
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ejemplo: abono en efectivo en recepcion o transferencia confirmada por WhatsApp."
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-black/8 pt-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => submitPaymentEntry("partial")}
            disabled={isPending || !hasValidPartialAmount}
            className="h-11 flex-1 rounded-none text-[10px] font-black uppercase tracking-[0.14em]"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            Registrar abono parcial
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => submitPaymentEntry("full")}
            disabled={isPending || normalizedBalance <= 0}
            className="h-11 flex-1 rounded-none text-[10px] font-black uppercase tracking-[0.14em]"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CircleDollarSign className="h-4 w-4" />
            )}
            Marcar pago completo
          </Button>
        </div>

        <p className="text-sm text-[#5f6368]" aria-live="polite">
          {isPending
            ? "Registrando pago manual..."
            : feedback ??
              `Saldo pendiente actual: ${formatCartAmount(normalizedBalance, currencyCode)}.`}
        </p>
      </div>
    </div>
  );
}
