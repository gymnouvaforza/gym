import Link from "next/link";

import type { SiteSettings } from "@/lib/supabase/database.types";
import { formatTopbarDeadline, resolveActiveTopbar } from "@/lib/topbar";

const topbarStyles = {
  promotion: "bg-[#d71920] text-white",
  announcement: "bg-[#111111] text-white",
  notice: "bg-[#f7f4ef] text-[#111111] border-b border-black/10",
} as const;

const badgeStyles = {
  promotion: "bg-white/12 text-white",
  announcement: "bg-[#d71920] text-white",
  notice: "bg-[#d71920] text-white",
} as const;

const variantLabels = {
  promotion: "Promo",
  announcement: "Anuncio",
  notice: "Aviso",
} as const;

export default function SiteTopbar({ settings }: { settings: SiteSettings }) {
  const topbar = resolveActiveTopbar(settings);

  if (!topbar) {
    return null;
  }

  const deadline = formatTopbarDeadline(topbar.expiresAt);
  const palette = topbarStyles[topbar.variant];
  const badgePalette = badgeStyles[topbar.variant];

  return (
    <div className={palette}>
      <div className="section-shell flex flex-col gap-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className={`inline-flex w-fit items-center px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ${badgePalette}`}>
            {variantLabels[topbar.variant]}
          </span>
          <p className="text-sm font-medium leading-6">{topbar.text}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {deadline ? (
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] opacity-80">
              Hasta {deadline}
            </span>
          ) : null}
          {topbar.ctaLabel && topbar.ctaUrl ? (
            <Link
              href={topbar.ctaUrl}
              className="inline-flex w-fit items-center justify-center border border-current/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] transition hover:border-current/50 hover:bg-black/10"
            >
              {topbar.ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
