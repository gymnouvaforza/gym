"use client";

// Client panel for listing append-only private notes on a member profile.
import { useEffect, useMemo, useState } from "react";

import { getMemberNotesAction } from "@/app/(admin)/dashboard/miembros/actions";
import type { MemberNote } from "@/lib/data/member-notes";

interface MemberNotesPanelProps {
  memberId: string;
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "Fecha no disponible";
  }

  const diffInSeconds = Math.round((timestamp - Date.now()) / 1000);
  const divisions = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" },
  ] as const;

  let duration = diffInSeconds;

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return relativeTimeFormatter.format(
        Math.round(duration),
        division.unit as Intl.RelativeTimeFormatUnit,
      );
    }

    duration /= division.amount;
  }

  return "Fecha no disponible";
}

export function MemberNotesPanel({ memberId }: Readonly<MemberNotesPanelProps>) {
  const [notes, setNotes] = useState<MemberNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadNotes() {
      setIsLoading(true);
      const nextNotes = await getMemberNotesAction(memberId);

      if (isMounted) {
        setNotes(nextNotes);
        setIsLoading(false);
      }
    }

    loadNotes().catch(() => {
      if (isMounted) {
        setNotes([]);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [memberId]);

  const sortedNotes = useMemo(
    () => [...notes].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)),
    [notes],
  );

  if (isLoading) {
    return (
      <section className="space-y-3" aria-label="Observaciones internas">
        <p className="text-sm text-[#5f6368]">Cargando observaciones...</p>
      </section>
    );
  }

  return (
    <section className="space-y-3" aria-label="Observaciones internas">
      {sortedNotes.length === 0 ? (
        <p className="border-l-4 border-gray-300 bg-black/[0.02] px-4 py-3 text-sm font-medium text-[#5f6368]">
          Sin observaciones
        </p>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note) => (
            <article
              className="border-l-4 border-gray-300 bg-white px-4 py-3 text-sm shadow-sm"
              key={note.id}
            >
              <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-[#111111]">
                {note.content}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#7a7f87]">
                <span>{note.createdByEmail ?? "Sistema"}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={note.createdAt}>{formatRelativeDate(note.createdAt)}</time>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
