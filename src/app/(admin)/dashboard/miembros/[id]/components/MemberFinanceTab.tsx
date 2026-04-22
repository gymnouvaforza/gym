"use client";

import { useOptimistic, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  CreditCard,
  Printer,
  QrCode,
  RotateCcw,
  Send,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

import AdminSurface from "@/components/admin/AdminSurface";
import MembershipRequestCreateForm from "@/components/admin/MembershipRequestCreateForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type MemberPaymentDto, type MembershipDto } from "@/lib/data/member-finance";
import type { MembershipPlan } from "@/lib/memberships";
import { cn, generateWhatsAppLink } from "@/lib/utils";

import { recordMemberPaymentAction } from "../financial-actions";

export default function MemberFinanceTab({
  financials,
  memberId,
  memberEmail,
  memberName,
  memberPhone,
  membershipPlans,
}: {
  financials: MembershipDto | null;
  memberId: string;
  memberEmail: string;
  memberName: string;
  memberPhone: string | null;
  membershipPlans: MembershipPlan[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [optimisticFinancials, addOptimisticPayment] = useOptimistic(
    financials,
    (state, newPayment: MemberPaymentDto) => {
      if (!state) return state;
      const nextBalance = Math.max(0, state.balanceDue - newPayment.amountPaid);

      return {
        ...state,
        balanceDue: nextBalance,
        status: nextBalance <= 0 ? "active" : state.status,
        payments: [newPayment, ...state.payments],
      };
    },
  );

  async function onRecordPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = Number.parseFloat(String(formData.get("amount") ?? ""));
    const method = String(formData.get("method") ?? "cash");
    const reference = String(formData.get("reference") ?? "");

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const tempPayment: MemberPaymentDto = {
      id: `temp-${Date.now()}`,
      amountPaid: amount,
      paymentMethod: method,
      referenceCode: reference || null,
      recordedAt: new Date().toISOString(),
    };

    startTransition(async () => {
      addOptimisticPayment(tempPayment);
      const result = await recordMemberPaymentAction(formData);

      if ("success" in result && result.success) {
        toast.success("Pago registrado correctamente");
        event.currentTarget.reset();
        setSelectedMethod("cash");
        return;
      }

      toast.error(result.error || "Error al registrar pago");
    });
  }

  function sendWhatsAppReceipt(payment: MemberPaymentDto) {
    if (!memberPhone) {
      return;
    }

    const message = `*RECIBO DE PAGO - NOVA FORZA GYM*\n\nHola ${memberName}, hemos registrado tu pago de S/ ${payment.amountPaid.toFixed(2)} via ${payment.paymentMethod.toUpperCase()}.\n\n*Referencia:* ${payment.referenceCode || "N/A"}\n*Saldo Pendiente:* S/ ${optimisticFinancials?.balanceDue.toFixed(2)}\n\nGracias por tu preferencia.`;
    window.open(generateWhatsAppLink(memberPhone, message), "_blank");
  }

  if (!optimisticFinancials) {
    return (
      <AdminSurface className="p-12 text-center border-dashed border-black/10">
        <div className="size-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-6">
          <CreditCard className="size-8 text-[#7a7f87]" />
        </div>
        <p className="text-[#7a7f87] font-bold uppercase text-[10px] tracking-widest mb-6">
          Sin membresia activa
        </p>
        <Button
          variant="outline"
          disabled
          title="Alta inicial pendiente de integracion. Usa modulo de membresias."
          className="border-black/10 font-black uppercase text-[10px] tracking-[0.2em] h-12 px-8 hover:bg-black/5"
        >
          Alta Inicial No Disponible
        </Button>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[#7a7f87]">
          Usa modulo de membresias para abrir solicitud manual.
        </p>
      </AdminSurface>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2 space-y-8">
        <AdminSurface className="p-8 border-black/5 shadow-xl shadow-black/[0.02] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />

          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d71920] mb-2">
                Estado de Cuenta
              </h3>
              <p className="text-4xl font-black text-[#111111] tracking-tighter uppercase">
                {optimisticFinancials.planTitle}
              </p>
            </div>
            <div className="text-right">
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                  optimisticFinancials.status === "active"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-red-50 text-[#d71920] border border-red-100 animate-pulse",
                )}
              >
                <div
                  className={cn(
                    "size-1.5 rounded-full",
                    optimisticFinancials.status === "active"
                      ? "bg-emerald-500"
                      : "bg-[#d71920]",
                  )}
                />
                {optimisticFinancials.status === "active" ? "Pagado" : "Deuda Pendiente"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12 relative z-10">
            <div className="p-6 bg-black/[0.01] border border-black/5 rounded-2xl group hover:bg-white hover:shadow-lg transition-all duration-500">
              <p className="text-[9px] font-black text-[#7a7f87] uppercase tracking-widest mb-1 group-hover:text-[#d71920] transition-colors">
                Total Plan
              </p>
              <p className="text-2xl font-black text-[#111111] tracking-tighter">
                S/ {optimisticFinancials.totalPrice.toFixed(2)}
              </p>
            </div>
            <div className="p-6 bg-black/[0.01] border border-black/5 rounded-2xl group hover:bg-white hover:shadow-lg transition-all duration-500">
              <p className="text-[9px] font-black text-[#7a7f87] uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">
                Pagado
              </p>
              <p className="text-2xl font-black text-emerald-600 tracking-tighter">
                S/ {(optimisticFinancials.totalPrice - optimisticFinancials.balanceDue).toFixed(2)}
              </p>
            </div>
            <div
              className={cn(
                "p-6 rounded-2xl transition-all duration-500 border",
                optimisticFinancials.balanceDue > 0
                  ? "bg-red-50/50 border-red-100 shadow-sm"
                  : "bg-black/[0.01] border-black/5",
              )}
            >
              <p
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest mb-1",
                  optimisticFinancials.balanceDue > 0 ? "text-[#d71920]" : "text-[#7a7f87]",
                )}
              >
                Saldo Deudor
              </p>
              <p
                className={cn(
                  "text-2xl font-black tracking-tighter",
                  optimisticFinancials.balanceDue > 0 ? "text-[#d71920]" : "text-[#111111]",
                )}
              >
                S/ {optimisticFinancials.balanceDue.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#111111]">
              Historial de Transacciones
            </h4>
            <div className="h-px flex-1 mx-6 bg-black/5" />
          </div>

          <div className="space-y-3 relative z-10">
            {optimisticFinancials.payments.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-black/5 rounded-2xl">
                <p className="text-xs font-bold text-[#7a7f87] uppercase tracking-widest">
                  No se han registrado pagos todavia.
                </p>
              </div>
            ) : (
              optimisticFinancials.payments.map((payment) => (
                <div
                  key={payment.id}
                  className={cn(
                    "flex items-center justify-between p-4 bg-white border border-black/5 rounded-xl hover:border-[#111111] hover:shadow-xl transition-all duration-300 group",
                    payment.id.toString().startsWith("temp-") &&
                      "opacity-60 grayscale border-dashed border-[#d71920]/30 bg-red-50/20",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-[#111111] group-hover:text-white transition-all duration-500">
                      {payment.paymentMethod === "cash" ? (
                        <Banknote className="size-5" />
                      ) : (
                        <Smartphone className="size-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-black text-[#111111] tracking-tight text-lg">
                          S/ {payment.amountPaid.toFixed(2)}
                        </p>
                        {payment.id.toString().startsWith("temp-") && (
                          <RotateCcw className="size-3 animate-spin text-[#d71920]" />
                        )}
                      </div>
                      <p className="text-[9px] text-[#7a7f87] uppercase font-black tracking-widest">
                        {payment.paymentMethod} - {payment.referenceCode || "Sin referencia"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-[10px] font-bold text-[#7a7f87] uppercase tracking-tighter">
                      {new Date(payment.recordedAt).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Enviar recibo ${payment.id}`}
                      className="h-10 w-10 text-[#7a7f87] hover:text-[#d71920] hover:bg-red-50 rounded-full transition-all"
                      onClick={() => sendWhatsAppReceipt(payment)}
                      disabled={payment.id.toString().startsWith("temp-")}
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminSurface>
      </div>

      <div className="space-y-8">
        <AdminSurface className="p-8 border-none bg-[#111111] text-white shadow-2xl shadow-black/20 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-[#d71920]/20 transition-all duration-700" />

          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a7f87] mb-8 relative z-10">
            Registrar Abono
          </h3>
          <form onSubmit={onRecordPayment} className="space-y-6 relative z-10">
            <input type="hidden" name="membershipId" value={optimisticFinancials.id} />
            <input type="hidden" name="memberEmail" value={memberEmail} />
            <input type="hidden" name="memberName" value={memberName} />
            <input type="hidden" name="method" value={selectedMethod} />

            <div className="space-y-2">
              <label
                htmlFor="member-finance-amount"
                className="text-[9px] font-black uppercase tracking-widest text-[#7a7f87] ml-1"
              >
                Monto a Recibir (S/)
              </label>
              <Input
                id="member-finance-amount"
                name="amount"
                type="number"
                step="0.01"
                max={optimisticFinancials.balanceDue}
                placeholder="0.00"
                className="h-16 bg-white/5 border-white/10 text-white font-black text-3xl tracking-tighter focus:ring-0 focus:border-[#d71920] focus:bg-white/10 transition-all rounded-2xl placeholder:text-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#7a7f87] ml-1">
                Via de Ingreso
              </label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl font-bold">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-white/10 text-white">
                  <SelectItem
                    value="cash"
                    className="focus:bg-[#d71920] focus:text-white font-bold uppercase text-[10px]"
                  >
                    Efectivo
                  </SelectItem>
                  <SelectItem
                    value="yape"
                    className="focus:bg-[#d71920] focus:text-white font-bold uppercase text-[10px]"
                  >
                    Yape
                  </SelectItem>
                  <SelectItem
                    value="plin"
                    className="focus:bg-[#d71920] focus:text-white font-bold uppercase text-[10px]"
                  >
                    Plin
                  </SelectItem>
                  <SelectItem
                    value="bank_transfer"
                    className="focus:bg-[#d71920] focus:text-white font-bold uppercase text-[10px]"
                  >
                    Transferencia
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="member-finance-reference"
                className="text-[9px] font-black uppercase tracking-widest text-[#7a7f87] ml-1"
              >
                Identificador de Operacion
              </label>
              <Input
                id="member-finance-reference"
                name="reference"
                placeholder="Ej. Num Operacion"
                className="h-12 bg-white/5 border-white/10 text-white rounded-xl font-bold focus:ring-0 focus:border-[#d71920] focus:bg-white/10"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending || optimisticFinancials.balanceDue <= 0}
              className={cn(
                "w-full h-16 text-white font-black uppercase text-[11px] tracking-[0.25em] transition-all duration-500 rounded-2xl shadow-xl mt-4",
                isPending
                  ? "bg-white/10"
                  : "bg-[#d71920] hover:bg-white hover:text-[#111111] shadow-red-500/20",
              )}
            >
              {isPending ? (
                <div className="flex items-center gap-3">
                  <RotateCcw className="size-4 animate-spin" />
                  <span>Registrando...</span>
                </div>
              ) : (
                "Confirmar Operacion"
              )}
            </Button>
          </form>
        </AdminSurface>

        <AdminSurface className="p-8 border-black/5 bg-[#fbfbf8] rounded-3xl">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#111111] mb-6">
            Acciones de Gestion
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <Button
              type="button"
              disabled
              variant="outline"
              className="justify-start text-[10px] font-black uppercase tracking-widest h-12 border-black/5 bg-white hover:bg-[#111111] hover:text-white transition-all rounded-xl"
            >
              <Printer className="size-4 mr-3" /> Imprimir Estado
            </Button>
            <Button
              type="button"
              disabled
              variant="outline"
              className="justify-start text-[10px] font-black uppercase tracking-widest h-12 border-black/5 bg-white hover:bg-[#111111] hover:text-white transition-all rounded-xl"
            >
              <CreditCard className="size-4 mr-3" /> Re-negociar Plan
            </Button>
          </div>
        </AdminSurface>
      </div>

      <div className="lg:col-span-3">
        <AdminSurface className="p-8 border-black/5 rounded-[2rem] shadow-xl shadow-black/[0.02]">
          <div className="flex items-center gap-4 mb-10">
            <div className="size-10 rounded-2xl bg-red-50 flex items-center justify-center">
              <QrCode className="size-5 text-[#d71920]" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#111111]">
                Membresia Operativa
              </h3>
              <p className="text-[11px] font-bold text-[#7a7f87] uppercase">
                Ciclo de renovacion y alta de planes
              </p>
            </div>
          </div>
          <MembershipRequestCreateForm
            memberId={memberId}
            membershipPlans={membershipPlans}
            defaultPlanId={null}
            latestRequestId={null}
          />
        </AdminSurface>
      </div>
    </motion.div>
  );
}
