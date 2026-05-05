"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import {
  Search,
  User,
  Clock,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PauseCircle,
  Ban,
  HelpCircle,
  DoorOpen,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import AdminSurface from "@/components/admin/AdminSurface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FeedbackCallout from "@/components/ui/feedback-callout";
import {
  searchReceptionMembersAction,
  getReceptionMemberSnapshotAction,
  createMemberCheckinAction,
} from "@/app/(admin)/dashboard/recepcion/actions";
import type {
  ReceptionMemberSearchResult,
  ReceptionMemberSnapshot,
  TodayCheckinItem,
} from "@/lib/data/member-checkins";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

function accessStatusConfig(status: string) {
  switch (status) {
    case "active":
      return {
        icon: CheckCircle2,
        badgeVariant: "success" as const,
        tone: "success" as const,
        bgClass: "bg-emerald-50",
        borderClass: "border-emerald-200",
        textClass: "text-emerald-700",
      };
    case "expires_today":
      return {
        icon: AlertTriangle,
        badgeVariant: "warning" as const,
        tone: "warning" as const,
        bgClass: "bg-amber-50",
        borderClass: "border-amber-200",
        textClass: "text-amber-700",
      };
    case "expired":
      return {
        icon: XCircle,
        badgeVariant: "default" as const,
        tone: "error" as const,
        bgClass: "bg-red-50",
        borderClass: "border-red-200",
        textClass: "text-red-700",
      };
    case "paused":
      return {
        icon: PauseCircle,
        badgeVariant: "muted" as const,
        tone: "info" as const,
        bgClass: "bg-slate-50",
        borderClass: "border-slate-200",
        textClass: "text-slate-700",
      };
    case "cancelled":
      return {
        icon: Ban,
        badgeVariant: "default" as const,
        tone: "error" as const,
        bgClass: "bg-red-50",
        borderClass: "border-red-200",
        textClass: "text-red-700",
      };
    case "former":
      return {
        icon: Ban,
        badgeVariant: "muted" as const,
        tone: "error" as const,
        bgClass: "bg-gray-50",
        borderClass: "border-gray-200",
        textClass: "text-gray-600",
      };
    case "no_membership":
      return {
        icon: HelpCircle,
        badgeVariant: "warning" as const,
        tone: "warning" as const,
        bgClass: "bg-amber-50",
        borderClass: "border-amber-200",
        textClass: "text-amber-700",
      };
    default:
      return {
        icon: HelpCircle,
        badgeVariant: "muted" as const,
        tone: "info" as const,
        bgClass: "bg-gray-50",
        borderClass: "border-gray-200",
        textClass: "text-gray-600",
      };
  }
}

function methodLabel(method: string) {
  switch (method) {
    case "qr":
      return "QR";
    case "reception":
      return "Recepcion";
    case "manual":
    default:
      return "Manual";
  }
}

interface ReceptionWorkspaceProps {
  initialTodayCheckins: TodayCheckinItem[];
}

export default function ReceptionWorkspace({ initialTodayCheckins }: ReceptionWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReceptionMemberSearchResult[]>([]);
  const [selected, setSelected] = useState<ReceptionMemberSnapshot | null>(null);
  const [todayCheckins, setTodayCheckins] = useState<TodayCheckinItem[]>(initialTodayCheckins);
  const [searching, setSearching] = useState(false);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [isCheckingIn, startCheckinTransition] = useTransition();
  const [showResults, setShowResults] = useState(false);

  const performSearch = useCallback(async (value: string) => {
    if (!value.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setSearching(true);
    try {
      const data = await searchReceptionMembersAction(value);
      setResults(data);
      setShowResults(true);
    } catch {
      toast.error("Error al buscar socios.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  async function handleSelectMember(memberId: string) {
    setShowResults(false);
    setLoadingSnapshot(true);
    try {
      const snapshot = await getReceptionMemberSnapshotAction(memberId);
      if (snapshot) {
        setSelected(snapshot);
        setQuery(snapshot.member.fullName);
      } else {
        toast.error("No se pudo cargar la ficha del socio.");
      }
    } catch {
      toast.error("Error al cargar la ficha del socio.");
    } finally {
      setLoadingSnapshot(false);
    }
  }

  function handleCheckIn() {
    if (!selected) return;
    startCheckinTransition(async () => {
      try {
        const checkin = await createMemberCheckinAction(selected.member.id);
        toast.success(`Entrada registrada: ${selected.member.fullName}`);
        // Refresh today's checkins manually since we already have the data
        setTodayCheckins((prev) => [
          {
            id: checkin.id,
            checkedInAt: checkin.checked_in_at,
            memberId: selected.member.id,
            memberName: selected.member.fullName,
            memberNumber: selected.member.memberNumber,
            statusSnapshot: checkin.status_snapshot,
            method: checkin.method,
            registeredByEmail: checkin.registered_by_email,
          },
          ...prev,
        ]);
        // Refresh selected member snapshot to show new checkin
        const refreshed = await getReceptionMemberSnapshotAction(selected.member.id);
        if (refreshed) {
          setSelected(refreshed);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al registrar entrada.");
      }
    });
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
      {/* LEFT: Search + Member Panel */}
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/20 group-focus-within:text-[#d71920] transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value.trim()) {
                  setSelected(null);
                  setShowResults(false);
                }
              }}
              placeholder="Buscar por nombre, telefono, correo o codigo..."
              className="flex h-16 w-full border border-black/5 bg-black/[0.02] pl-14 pr-4 text-base font-bold text-[#111111] outline-none focus:bg-white focus:ring-1 focus:ring-[#111111]/5 focus:border-black/20 transition-all placeholder:text-[#7a7f87]/40"
            />
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#d71920] border-t-transparent" />
              </div>
            )}
          </div>

          {/* Search Results */}
          {showResults && results.length > 0 && !selected && (
            <div className="absolute z-30 mt-2 w-full border border-black/5 bg-white shadow-xl">
              {results.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleSelectMember(member.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-black/[0.02] transition-colors border-b border-black/5 last:border-b-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#111111] text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#111111] truncate">{member.fullName}</p>
                    <p className="text-[11px] text-[#7a7f87] font-medium">
                      {member.memberNumber} · {member.phone ?? member.email}
                    </p>
                  </div>
                  <Badge variant={member.status === "active" ? "success" : "muted"} className="text-[9px]">
                    {member.status.toUpperCase()}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {showResults && results.length === 0 && !searching && query.trim() && (
            <div className="absolute z-30 mt-2 w-full border border-black/5 bg-white shadow-xl p-6 text-center">
              <p className="text-sm font-bold text-[#7a7f87]">No se encontraron socios.</p>
            </div>
          )}
        </div>

        {/* Selected Member Panel */}
        {selected ? (
          <div className="space-y-6">
            {/* Member Header Card */}
            <AdminSurface className="p-6 border-black/5 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-[#111111] text-white">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d71920]">
                        {selected.member.memberNumber}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-[#111111]">
                      {selected.member.fullName}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#7a7f87] font-medium">
                      {selected.member.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {selected.member.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {selected.member.email}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={accessStatusConfig(selected.access.status).badgeVariant} className="text-[9px]">
                  {selected.access.label}
                </Badge>
              </div>

              {/* Access Status Callout */}
              <div className="mt-6">
                <FeedbackCallout
                  chrome="admin"
                  tone={accessStatusConfig(selected.access.status).tone}
                  title={selected.access.message}
                  message={
                    selected.membership.balanceDue > 0
                      ? `Saldo pendiente: S/ ${selected.membership.balanceDue.toFixed(2)}`
                      : selected.access.status === "active"
                        ? "Membresia al dia."
                        : "Revisa estado antes de permitir el acceso."
                  }
                  compact
                />
              </div>

              {/* Membership Details */}
              {selected.membership.planTitle ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="border border-black/8 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                      Plan
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#111111]">{selected.membership.planTitle}</p>
                  </div>
                  <div className="border border-black/8 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                      <Calendar className="inline h-3 w-3 mr-1" /> Inicio
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#111111]">
                      {selected.membership.cycleStartsOn
                        ? new Date(selected.membership.cycleStartsOn).toLocaleDateString("es-PE")
                        : "---"}
                    </p>
                  </div>
                  <div className="border border-black/8 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                      <Calendar className="inline h-3 w-3 mr-1" /> Vence
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#111111]">
                      {selected.membership.cycleEndsOn
                        ? new Date(selected.membership.cycleEndsOn).toLocaleDateString("es-PE")
                        : "---"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 border border-black/8 bg-white p-4 text-center">
                  <p className="text-sm font-bold text-[#7a7f87]">Sin membresia vinculada</p>
                </div>
              )}

              {/* Balance Warning */}
              {selected.membership.balanceDue > 0 && (
                <div className="mt-4 flex items-center gap-2 text-[#d71920]">
                  <CreditCard className="h-4 w-4" />
                  <p className="text-sm font-bold">
                    Saldo pendiente: S/ {selected.membership.balanceDue.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selected.member.notes && (
                <div className="mt-4 border-l-2 border-black/10 bg-black/[0.02] p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87] mb-1">
                    <FileText className="inline h-3 w-3 mr-1" /> Observaciones
                  </p>
                  <p className="text-[12px] font-medium text-[#5f6368] leading-relaxed">
                    {selected.member.notes}
                  </p>
                </div>
              )}

              {/* Recent Checkins */}
              {selected.recentCheckins.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87] mb-3">
                    Ultimas asistencias
                  </p>
                  <div className="space-y-2">
                    {selected.recentCheckins.map((checkin) => {
                      const cfg = accessStatusConfig(checkin.status_snapshot);
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={checkin.id}
                          className="flex items-center gap-3 border border-black/5 bg-white p-3"
                        >
                          <Icon className={`h-4 w-4 ${cfg.textClass}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#111111]">
                              {formatDateShort(checkin.checked_in_at)} · {formatTime(checkin.checked_in_at)}
                            </p>
                            <p className="text-[10px] text-[#7a7f87] uppercase font-medium">
                              {methodLabel(checkin.method)}
                            </p>
                          </div>
                          <Badge variant={cfg.badgeVariant} className="text-[9px]">
                            {checkin.status_snapshot.toUpperCase()}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Check-in Button */}
              <div className="mt-8">
                <Button
                  onClick={handleCheckIn}
                  disabled={isCheckingIn}
                  className="h-16 w-full bg-[#d71920] hover:bg-[#bf161c] text-white font-black uppercase text-sm tracking-[0.2em] shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {isCheckingIn ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Registrando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <DoorOpen className="h-5 w-5" />
                      Registrar entrada
                    </span>
                  )}
                </Button>
              </div>
            </AdminSurface>
          </div>
        ) : loadingSnapshot ? (
          <AdminSurface className="p-12 border-black/5 bg-white shadow-sm text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d71920] border-t-transparent mx-auto mb-4" />
            <p className="text-sm font-bold text-[#7a7f87]">Cargando ficha del socio...</p>
          </AdminSurface>
        ) : null}
      </div>

      {/* RIGHT: Today's Checkins */}
      <div>
        <AdminSurface className="p-6 border-black/5 bg-white shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#111111] text-white">
              <ClipboardCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#111111]">
                Entradas de hoy
              </h3>
              <p className="text-[10px] text-[#7a7f87] font-bold uppercase tracking-wider">
                {todayCheckins.length} registros
              </p>
            </div>
          </div>

          {todayCheckins.length === 0 ? (
            <div className="text-center py-10">
              <Clock className="h-8 w-8 text-black/10 mx-auto mb-2" />
              <p className="text-xs font-bold text-[#7a7f87] uppercase tracking-wider">
                Aun no hay entradas hoy
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {todayCheckins.map((checkin) => {
                const cfg = accessStatusConfig(checkin.statusSnapshot);
                const Icon = cfg.icon;
                return (
                  <div
                    key={checkin.id}
                    className="flex items-center gap-3 border border-black/5 p-3 hover:bg-black/[0.01] transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-black/5">
                      <Icon className={`h-4 w-4 ${cfg.textClass}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/dashboard/miembros/${checkin.memberId}`}
                        className="text-sm font-bold text-[#111111] hover:text-[#d71920] transition-colors"
                      >
                        {checkin.memberName}
                      </Link>
                      <p className="text-[10px] text-[#7a7f87] uppercase font-medium">
                        {checkin.memberNumber} · {formatTime(checkin.checkedInAt)}
                      </p>
                    </div>
                    <Badge variant={cfg.badgeVariant} className="text-[9px]">
                      {checkin.statusSnapshot.toUpperCase()}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </AdminSurface>
      </div>
    </div>
  );
}
