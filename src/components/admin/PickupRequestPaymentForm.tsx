"use client";

import { CircleDollarSign, Loader2, Wallet, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { addPickupRequestPaymentEntryAction } from "@/app/(admin)/dashboard/tienda/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCartAmount } from "@/lib/cart/format";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
  const [isPending, startTransition] = useTransition();

  const normalizedBalance = useMemo(
    () => Number(Math.max(balanceDue, 0).toFixed(2)),
    [balanceDue],
  );
  const parsedAmount = Number.parseFloat(amount.replace(",", "."));
  const hasValidPartialAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;

  function submitPaymentEntry(mode: "partial" | "full") {
    const resolvedAmount = mode === "full" ? normalizedBalance : parsedAmount;

    startTransition(async () => {
      try {
        await addPickupRequestPaymentEntryAction(pickupRequestId, currencyCode, {
          amount: resolvedAmount,
          note,
        });
        setAmount("");
        setNote("");
        toast.success(
          mode === "full"
            ? "Pago completo registrado y saldo cubierto."
            : "Abono parcial registrado en la bitácora de pagos."
        );
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo registrar el pago manual."
        );
      }
    });
  }

  return (
    <div className="space-y-6 border border-black/5 bg-white shadow-xl shadow-black/[0.02] p-8 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
         <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d71920] mb-1">Tesorería</h4>
            <p className="text-xl font-black text-[#111111] tracking-tighter uppercase">Gestión de Abonos</p>
         </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 group/label">
            <Label
              htmlFor={`pickup-request-payment-amount-${pickupRequestId}`}
              className="text-[10px] font-black uppercase tracking-wider text-[#7a7f87] transition-colors group-focus-within/label:text-[#111111]"
            >
              Importe del abono
            </Label>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <HelpCircle className="size-3 text-muted-foreground/30 cursor-help transition-all hover:text-[#111111] hover:scale-110" />
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-[#111111] text-white border-none p-3 text-[10px] font-bold uppercase tracking-tight max-w-[200px]">
                  Registra cada cobro manual como un movimiento nuevo.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id={`pickup-request-payment-amount-${pickupRequestId}`}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder={normalizedBalance > 0 ? `${normalizedBalance}` : "0.00"}
            className="h-12 bg-black/[0.02] border-black/5 rounded-xl px-4 font-bold text-[#111111] focus-visible:ring-0 focus-visible:border-[#111111] focus-visible:bg-white transition-all duration-300 shadow-none"
          />
        </div>

        <div className="space-y-3">
          <Label
            htmlFor={`pickup-request-payment-note-${pickupRequestId}`}
            className="text-[10px] font-black uppercase tracking-wider text-[#7a7f87] transition-colors"
          >
            Nota del cobro (Opcional)
          </Label>
          <Textarea
            id={`pickup-request-payment-note-${pickupRequestId}`}
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ejemplo: abono en efectivo en recepción o transferencia confirmada..."
            className="min-h-[100px] bg-black/[0.02] border-black/5 rounded-2xl px-5 py-4 font-medium text-[#111111] focus:ring-0 focus:border-[#111111] focus:bg-white transition-all duration-300 placeholder:text-muted-foreground/20 leading-relaxed shadow-inner resize-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-black/5 pt-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => submitPaymentEntry("partial")}
            disabled={isPending || !hasValidPartialAmount}
            className="h-12 flex-1 rounded-xl text-[10px] font-black uppercase tracking-[0.14em] border-black/10 text-[#111111] hover:bg-black/5 transition-all"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span>Procesando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span>Abono parcial</span>
              </div>
            )}
          </Button>
          <Button
            type="button"
            onClick={() => submitPaymentEntry("full")}
            disabled={isPending || normalizedBalance <= 0}
            className={cn(
              "h-12 flex-1 rounded-xl text-[10px] font-black uppercase tracking-[0.14em] text-white transition-all duration-500 shadow-lg",
              isPending ? "bg-black/40 text-white/50" : "bg-[#111111] hover:bg-[#d71920] hover:shadow-red-500/20"
            )}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                <span>Procesando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4" />
                <span>Pago completo</span>
              </div>
            )}
          </Button>
        </div>

        <p className="text-[10px] font-bold text-[#7a7f87] uppercase tracking-widest text-center" aria-live="polite">
          {isPending
            ? "Registrando pago manual..."
            : `Saldo pendiente actual: ${formatCartAmount(normalizedBalance, currencyCode)}`}
        </p>
      </div>
    </div>
  );
}
