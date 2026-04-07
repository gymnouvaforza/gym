import FeedbackCallout, { type FeedbackTone } from "@/components/ui/feedback-callout";

interface PublicInlineAlertProps {
  message: string;
  tone?: FeedbackTone;
  title?: string;
  actionLabel?: string;
  actionHref?: string;
  compact?: boolean;
}

export default function PublicInlineAlert({
  message,
  tone = "warning",
  title,
  actionLabel,
  actionHref,
  compact = false,
}: Readonly<PublicInlineAlertProps>) {
  return (
    <FeedbackCallout
      chrome="public"
      tone={tone}
      title={title}
      message={message}
      actionLabel={actionLabel}
      actionHref={actionHref}
      compact={compact}
    />
  );
}
