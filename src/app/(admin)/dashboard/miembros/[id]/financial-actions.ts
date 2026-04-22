"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import { registerMemberPayment } from "@/lib/data/member-finance";
import { sendPaymentConfirmationEmail } from "@/lib/email/smtp-service";
import { memberPaymentSchema } from "@/lib/validators/member-finance";

function resolveActorUserId(user: Awaited<ReturnType<typeof requireAdminUser>>) {
  if ("isLocalAdmin" in user && user.isLocalAdmin) {
    return null;
  }

  return user.id;
}

export async function recordMemberPaymentAction(formData: FormData) {
  try {
    const user = await requireAdminUser();
    const parsed = memberPaymentSchema.parse({
      membershipId: formData.get("membershipId"),
      amount: formData.get("amount"),
      method: formData.get("method"),
      reference: formData.get("reference"),
      memberEmail: formData.get("memberEmail"),
      memberName: formData.get("memberName"),
    });

    const result = await registerMemberPayment({
      ...parsed,
      recordedByUserId: resolveActorUserId(user),
    });

    try {
      if (parsed.memberEmail) {
        await sendPaymentConfirmationEmail({
          to: parsed.memberEmail,
          memberName: parsed.memberName,
          amount: result.payment.amountPaid,
          reference: result.payment.referenceCode || "Pago Directo",
        });
      }
    } catch (error) {
      console.error("Error enviando email:", error);
    }

    revalidatePath("/dashboard/miembros");
    revalidatePath("/dashboard/mobile");
    revalidatePath(`/dashboard/miembros/${result.memberId}`);

    return {
      success: true as const,
      newBalance: result.newBalance,
      paymentId: result.payment.id,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo registrar el pago manual.",
    };
  }
}
