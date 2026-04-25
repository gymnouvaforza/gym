"use client";

import { useState, useTransition } from "react";

import { resendMembershipRequestEmailAction } from "@/app/(admin)/dashboard/membresias/actions";
import { Button, type ButtonProps } from "@/components/ui/button";
import FeedbackCallout, { type FeedbackTone } from "@/components/ui/feedback-callout";
import type { MembershipRequestDetail } from "@/lib/memberships";

interface MembershipRequestEmailButtonProps {
  emailStatus?: MembershipRequestDetail["emailStatus"];
  label?: string;
  memberId?: string;
  membershipRequestId: string;
  size?: ButtonProps["size"];
  title?: string;
  variant?: ButtonProps["variant"];
  className?: string;
}

export default function MembershipRequestEmailButton({
  emailStatus = "sent",
  label,
  memberId,
  membershipRequestId,
  size = "default",
  title,
  variant = "outline",
  className,
}: Readonly<MembershipRequestEmailButtonProps>) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ message: string; tone: FeedbackTone } | null>(null);
  const resolvedLabel =
    label ??
    (emailStatus === "failed"
      ? "Reintentar email"
      : emailStatus === "pending"
        ? "Enviar email"
        : "Reenviar email");

  return (
    <div className="space-y-3">
      <Button
        type="button"
        disabled={isPending}
        variant={variant}
        size={size}
        title={title}
        className={className}
        onClick={() => {
          setFeedback(null);

          startTransition(async () => {
            try {
              await resendMembershipRequestEmailAction(membershipRequestId, memberId);
              setFeedback({
                tone: "success",
                message: "Email de membresia reenviado correctamente.",
              });
            } catch (error) {
              setFeedback({
                tone: "error",
                message:
                  error instanceof Error ? error.message : "No se pudo reenviar el email.",
              });
            }
          });
        }}
      >
        {isPending ? "Enviando..." : resolvedLabel}
      </Button>

      {feedback ? (
        <FeedbackCallout chrome="admin" tone={feedback.tone} message={feedback.message} compact />
      ) : null}
    </div>
  );
}
