"use client";

import { forwardRef } from "react";

import { type MemberPaymentDto, type MembershipDto } from "@/lib/data/member-finance";

interface PaymentReceiptProps {
  member: {
    fullName: string;
    memberNumber: string;
    phone: string | null;
  };
  payment: MemberPaymentDto;
  membership: MembershipDto;
}

export const PaymentReceipt = forwardRef<HTMLDivElement, PaymentReceiptProps>(
  ({ member, payment, membership }, ref) => {
    return (
      <div
        ref={ref}
        className="p-8 bg-white text-black font-mono text-sm max-w-[300px] mx-auto border border-dashed border-gray-300"
        style={{ fontSize: "12px" }}
      >
        <div className="text-center mb-6">
          <h1 className="font-black text-lg uppercase tracking-tighter">NOVA FORZA GYM</h1>
          <p className="text-[10px] uppercase">RUC: 20601234567</p>
          <p className="text-[10px]">Calle Falsa 123, Lima, Peru</p>
        </div>

        <div className="border-t border-b border-black py-4 mb-4 space-y-1">
          <p>
            <span className="font-bold">RECIBO:</span> {payment.id.slice(0, 8).toUpperCase()}
          </p>
          <p>
            <span className="font-bold">FECHA:</span>{" "}
            {new Date(payment.recordedAt).toLocaleString()}
          </p>
          <p>
            <span className="font-bold">SOCIO:</span> {member.fullName}
          </p>
          <p>
            <span className="font-bold">ID:</span> {member.memberNumber}
          </p>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between font-bold uppercase">
            <span>Descripcion</span>
            <span>Monto</span>
          </div>
          <div className="flex justify-between">
            <span className="uppercase">Abono {membership.planTitle}</span>
            <span>S/ {payment.amountPaid.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-black pt-4 space-y-1 text-right">
          <p>
            <span className="font-bold">TOTAL PAGADO:</span> S/ {payment.amountPaid.toFixed(2)}
          </p>
          <p className="text-[10px]">
            <span className="font-bold">METODO:</span> {payment.paymentMethod.toUpperCase()}
          </p>
          <p className="text-[10px] font-bold text-[#d71920]">
            SALDO PENDIENTE: S/ {membership.balanceDue.toFixed(2)}
          </p>
        </div>

        <div className="mt-8 text-center text-[10px] italic">
          <p>Gracias por entrenar con nosotros.</p>
          <p>www.novaforza.gym</p>
        </div>
      </div>
    );
  },
);

PaymentReceipt.displayName = "PaymentReceipt";
