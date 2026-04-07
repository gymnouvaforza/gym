import FeedbackCallout, { type FeedbackTone } from "@/components/ui/feedback-callout";

import AdminSurface from "./AdminSurface";

interface DashboardNoticeProps {
  message: string;
  tone?: FeedbackTone | "muted";
  title?: string;
  actionLabel?: string;
  actionHref?: string;
  compact?: boolean;
}

export default function DashboardNotice({
  message,
  tone = "warning",
  title,
  actionLabel,
  actionHref,
  compact = false,
}: Readonly<DashboardNoticeProps>) {
  const resolvedTone: FeedbackTone = tone === "muted" ? "info" : tone;

  return (
    <AdminSurface inset className="p-0">
      <FeedbackCallout
        chrome="admin"
        tone={resolvedTone}
        title={title}
        message={message}
        actionLabel={actionLabel}
        actionHref={actionHref}
        compact={compact}
      />
    </AdminSurface>
  );
}
