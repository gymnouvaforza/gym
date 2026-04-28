import { ElementType } from "react";
import {
  Activity,
  ExternalLink,
  Package,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";

import MemberAccountSettings from "@/components/auth/MemberAccountSettings";
import MemberTestimonialForm from "@/components/auth/MemberTestimonialForm";
import AuthFeedbackDialog from "@/components/auth/AuthFeedbackDialog";
import { MemberSignOutButtonWithRedirect } from "@/components/auth/MemberSignOutButton";
import MembershipReserveButton from "@/components/public/MembershipReserveButton";
import MembershipQrCard from "@/components/public/MembershipQrCard";
import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuthenticatedUser } from "@/lib/auth";
import { formatCartAmount } from "@/lib/cart/format";
import {
  getPickupRequestStatusTone,
  pickupRequestStatusLabels,
} from "@/lib/cart/pickup-request";
import { getCurrentCartSnapshot } from "@/lib/cart/server";
import type { Cart, PickupRequestDetail } from "@/lib/cart/types";
import {
  getAuthenticatedMemberTestimonial,
  getMemberAccountViewModel,
} from "@/lib/data/member-account";
import type {
  MemberAccountViewModel,
  MemberMarketingTestimonialViewModel,
} from "@/lib/data/member-account";
import { ensureMemberProfileForUser } from "@/lib/data/gym-management";
import {
  buildMembershipValidationUrl,
  getLatestMembershipRequestForUser,
  listMembershipPlans,
} from "@/lib/data/memberships";
import { getMemberPickupRequestsHistory } from "@/lib/data/pickup-requests";
import { formatMemberAccountDate } from "@/lib/member-account";
import {
  membershipRequestStatusLabels,
  membershipValidationStatusLabels,
} from "@/lib/memberships";
import type { DBMemberProfile } from "@/lib/supabase/database.types";
import { normalizeMembershipQrToken } from "@/lib/membership-qr";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type MemberAccountTab = "resumen" | "membresia" | "pedidos" | "cuenta";

type MemberAccountPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const memberAccountTabs: Array<{
  value: MemberAccountTab;
  label: string;
  description: string;
  icon: ElementType;
}> = [
  {
    value: "resumen",
    label: "Resumen",
    description: "Lo importante de tu cuenta en una sola vista.",
    icon: Activity,
  },
  {
    value: "membresia",
    label: "Membresía",
    description: "QR, vigencia, saldo y renovacion sin mezclarlo con la tienda.",
    icon: QrCode,
  },
  {
    value: "pedidos",
    label: "Pedidos",
    description: "Carrito activo y trazabilidad pickup desde el mismo portal.",
    icon: ShoppingBag,
  },
  {
    value: "cuenta",
    label: "Cuenta",
    description: "Perfil, seguridad y resena publica ordenados por separado.",
    icon: ShieldCheck,
  },
];

function getSafeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message && error.message !== "An unknown error occurred.") {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const candidate = error as { message?: unknown };
    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }
  }

  return fallback;
}

function resolveMemberAccountTab(value: string | string[] | undefined): MemberAccountTab {
  const candidate = Array.isArray(value) ? value[0] : value;

  return memberAccountTabs.some((tab) => tab.value === candidate)
    ? (candidate as MemberAccountTab)
    : "resumen";
}

function buildMemberAccountTabHref(tab: MemberAccountTab) {
  return tab === "resumen" ? "/mi-cuenta#account-tabs" : `/mi-cuenta?tab=${tab}#account-tabs`;
}

function buildMemberAccountTabSectionHref(tab: MemberAccountTab, sectionId: string) {
  return `${buildMemberAccountTabHref(tab).replace("#account-tabs", "")}#${sectionId}`;
}

export default async function MemberAccountPage({
  searchParams,
}: Readonly<MemberAccountPageProps>) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const activeTab = resolveMemberAccountTab(resolvedSearchParams?.tab);
  const user = await requireAuthenticatedUser();

  let account: MemberAccountViewModel = {
    fullName: "Socio Titan",
    email: user.email ?? "",
    providerLabel: "Autenticacion segura",
    canManagePassword: false,
    phone: null,
  };
  let activeCart: Cart | null = null;
  let testimonial: MemberMarketingTestimonialViewModel | null = null;
  let pickupHistory = { pickupRequests: [] as PickupRequestDetail[], warning: null as string | null };
  let memberProfile: DBMemberProfile | null = null;
  let latestMembershipRequest:
    | Awaited<ReturnType<typeof getLatestMembershipRequestForUser>>
    | null = null;
  let membershipPlans = [] as Awaited<ReturnType<typeof listMembershipPlans>>;
  let loadError: string | null = null;

  try {
    try {
      memberProfile = await ensureMemberProfileForUser(user);
    } catch (error) {
      loadError = getSafeErrorMessage(error, "No se pudo sincronizar la ficha base del socio.");
    }

    const [
      accResult,
      cartResult,
      historyResult,
      testimonialResult,
      membershipResult,
      membershipPlansResult,
    ] = await Promise.allSettled([
      getMemberAccountViewModel(user),
      getCurrentCartSnapshot(),
      getMemberPickupRequestsHistory({
        email: user.email,
        supabaseUserId: user.id,
      }),
      getAuthenticatedMemberTestimonial(),
      getLatestMembershipRequestForUser(user.id),
      listMembershipPlans({ activeOnly: true }),
    ]);

    if (accResult.status === "fulfilled") {
      account = accResult.value;
    }
    if (cartResult.status === "fulfilled") {
      activeCart = cartResult.value;
    }
    if (historyResult.status === "fulfilled") {
      pickupHistory = historyResult.value;
    }
    if (testimonialResult.status === "fulfilled") {
      testimonial = testimonialResult.value;
    }
    if (membershipResult.status === "fulfilled") {
      latestMembershipRequest = membershipResult.value;
    }
    if (membershipPlansResult.status === "fulfilled") {
      membershipPlans = membershipPlansResult.value;
    }

    if (
      accResult.status === "rejected" ||
      historyResult.status === "rejected" ||
      testimonialResult.status === "rejected" ||
      membershipResult.status === "rejected" ||
      membershipPlansResult.status === "rejected"
    ) {
      const rejectedReason =
        accResult.status === "rejected"
          ? accResult.reason
          : historyResult.status === "rejected"
            ? historyResult.reason
            : testimonialResult.status === "rejected"
              ? testimonialResult.reason
              : membershipResult.status === "rejected"
                ? membershipResult.reason
                : membershipPlansResult.status === "rejected"
                  ? membershipPlansResult.reason
                  : null;

      loadError = getSafeErrorMessage(
        rejectedReason,
        "Sincronizacion parcial. Los datos comerciales podrian no estar actualizados.",
      );
    }
  } catch (error) {
    loadError = getSafeErrorMessage(
      error,
      "Error de conexion con el servidor. Reintentando en breve.",
    );
  }

  const latestPickupRequest = pickupHistory.pickupRequests[0] ?? null;
  const activeCartItemCount = activeCart?.summary.itemCount ?? 0;
  const pickupCount = pickupHistory.pickupRequests.length;
  const membershipDetailHref = latestMembershipRequest
    ? `/mi-cuenta/membresias/${latestMembershipRequest.id}`
    : buildMemberAccountTabHref("membresia");
  const membershipQrHref =
    latestMembershipRequest && memberProfile
      ? buildMemberAccountTabSectionHref("membresia", "membership-qr")
      : membershipDetailHref;
  const memberQrToken = normalizeMembershipQrToken(memberProfile?.membership_qr_token);
  const memberQrUrl = memberQrToken ? buildMembershipValidationUrl(memberQrToken) : null;

  return (
    <main className="min-h-screen bg-[#fbfbf8] pb-12">
      <AuthFeedbackDialog variant="welcome" />

      {/* Header Compacto - Mobile First */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-[#111111] px-4 lg:h-20 lg:px-12">
        <div className="flex items-center gap-3 lg:gap-6">
          <div className="flex h-7 w-7 items-center justify-center bg-white lg:h-9 lg:w-9">
            <Activity className="h-4 w-4 text-[#d71920] lg:h-5 lg:w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white lg:text-xs">
              Portal <span className="text-[#d71920]">Socio</span>
            </p>
            <p className="hidden text-[8px] font-medium uppercase tracking-[0.1em] text-white/30 sm:block">
              Nuova Forza System V2
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden h-6 w-px bg-white/10 sm:block" />
          <MemberSignOutButtonWithRedirect />
          <div className="h-6 w-px bg-white/10" />
          <Link
            href="/"
            className="group flex items-center gap-2 text-[10px] font-black uppercase text-white/60 transition-colors hover:text-white"
          >
            <span className="hidden sm:inline">Salir al sitio</span>
            <ExternalLink className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px] px-0 lg:px-8">
        {loadError ? (
          <div className="px-4 py-4 lg:px-0">
            <PublicInlineAlert
              tone="warning"
              title="Sincronización parcial"
              message={loadError}
              compact
            />
          </div>
        ) : null}

        <div className="flex flex-col">
          {/* Perfil del Socio - Rediseño Mobile First */}
          <section className="bg-white px-4 py-8 border-b border-black/5 lg:bg-transparent lg:border-none lg:px-0 lg:py-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#d71920]/10 px-2 py-1">
                  <span className="h-1.5 w-1.5 bg-[#d71920]" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d71920]">
                    Área Privada del Socio
                  </p>
                </div>
                <div className="space-y-1">
                  <h1 className="font-display text-4xl font-black uppercase leading-[0.9] tracking-tight text-[#111111] italic sm:text-6xl lg:text-7xl">
                    Mi Espacio
                  </h1>
                  <p className="text-xs font-medium text-[#5f6368] lg:text-base">
                    {account.fullName} <span className="mx-1 text-black/10">|</span> {account.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-black/5 border border-black/5 lg:flex lg:flex-row lg:bg-transparent lg:border-none lg:gap-4">
                <div className="bg-white p-3 lg:border lg:border-black/10 lg:min-w-[140px] lg:p-4">
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#7a7f87] lg:text-[9px]">
                    Miembro desde
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-tight text-[#111111] lg:text-sm">
                    {formatMemberAccountDate(memberProfile?.created_at ?? user.created_at)}
                  </p>
                </div>
                <div className="bg-white p-3 lg:border lg:border-black/10 lg:min-w-[140px] lg:p-4">
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#7a7f87] lg:text-[9px]">
                    Último Acceso
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-tight text-[#111111] lg:text-sm">
                    {formatMemberAccountDate(user.last_sign_in_at)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Tabs value={activeTab} className="flex w-full flex-col">
            {/* Navegación de Pestañas - Estilo Dashboard */}
            <div className="sticky top-16 z-30 flex w-full bg-[#fbfbf8]/95 backdrop-blur-md lg:top-20 lg:static lg:bg-transparent lg:backdrop-blur-none lg:mb-12 pt-4 lg:pt-0">
              <div className="flex w-full items-center justify-between border-b border-black/5">
                <TabsList className="hide-scrollbar flex w-full flex-nowrap items-center justify-start overflow-x-auto bg-transparent p-0 h-auto gap-8 lg:gap-16 lg:w-max">
                  {memberAccountTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      asChild
                      className="relative flex-shrink-0 border-b-[4px] border-transparent rounded-none px-2 lg:px-0 pb-4 lg:pb-5 font-black uppercase text-[12px] lg:text-[14px] tracking-[0.2em] transition-all bg-transparent shadow-none data-[state=inactive]:shadow-none text-[#7a7f87] hover:text-[#111111] data-[state=active]:text-[#d71920] data-[state=active]:border-[#d71920]"
                    >
                      <Link href={buildMemberAccountTabHref(tab.value)} className="w-full">
                        <div className="flex w-full items-center justify-center gap-3">
                          <tab.icon className="h-5 w-5 lg:h-6 lg:w-6 transition-colors" />
                          <span>{tab.label}</span>
                        </div>
                      </Link>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            <section id="account-tabs" className="w-full px-3 py-6 lg:mx-auto lg:max-w-[1000px] lg:px-0 lg:py-0">
              <TabsContent value="resumen" className="mt-0 space-y-4 outline-none lg:space-y-8">
                {/* Bloque QR de Acceso Inmediato */}
                {latestMembershipRequest ? (
                  <div className="group relative overflow-hidden border border-[#111111] bg-[#111111] p-5 text-white lg:p-10">
                    <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-[#d71920]" />
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#d71920]">
                            Acceso Directo
                          </p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-display text-3xl font-black uppercase tracking-tight italic lg:text-5xl">
                            {memberProfile ? "Tu Pase de Socio" : "Membresía Activa"}
                          </h4>
                          <p className="max-w-md text-xs leading-relaxed text-white/50 lg:text-base">
                            {memberProfile
                              ? "Muestra tu código QR en la terminal para ingresar al gimnasio."
                              : "Tu solicitud de membresía está activa. Revisa tu vigencia y saldo."}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row lg:min-w-[320px] lg:gap-3">
                        <Button asChild className="h-12 flex-1 bg-[#d71920] text-[9px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-[#111111] lg:h-14 lg:text-[10px]">
                          <Link href={membershipQrHref}>
                            {memberProfile ? "Ver mi QR" : "Abrir Membresía"}
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="h-12 flex-1 border-white/20 bg-transparent text-[9px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-[#111111] lg:h-14 lg:text-[10px]"
                        >
                          <Link href={membershipDetailHref}>Ver Detalle</Link>
                        </Button>
                      </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -right-12 -top-12 h-64 w-64 bg-[#d71920]/5 blur-3xl" />
                  </div>
                ) : null}

                {/* Grid de Estado de Cuenta */}
                <div className="grid gap-3 lg:grid-cols-3 lg:gap-6">
                  {/* Status: Membresía */}
                  <div className="border border-black/10 bg-white p-5 lg:p-8">
                    <div className="mb-4 flex items-center justify-between border-b border-black/5 pb-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d71920] lg:text-[10px]">
                        Plan Actual
                      </p>
                      <ShieldCheck className="h-3.5 w-3.5 text-black/10 lg:h-4 lg:w-4" />
                    </div>
                    <div className="space-y-4 lg:space-y-6">
                      <div className="space-y-1">
                        <h5 className="font-display text-2xl font-black uppercase tracking-tight text-[#111111] lg:text-3xl">
                          {latestMembershipRequest?.planTitleSnapshot ?? "Sin Plan"}
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          <Badge 
                            variant={latestMembershipRequest?.status === "active" ? "success" : "muted"}
                            className="h-5 border-none px-1.5 text-[7px] font-black uppercase tracking-widest lg:h-6 lg:px-2 lg:text-[8px]"
                          >
                            {latestMembershipRequest ? membershipRequestStatusLabels[latestMembershipRequest.status] : "Inactivo"}
                          </Badge>
                        </div>
                      </div>
                      <Button asChild variant="outline" className="h-10 w-full border-black/10 text-[8px] font-black uppercase tracking-widest hover:bg-[#111111] hover:text-white lg:h-12 lg:text-[9px]">
                        <Link href={buildMemberAccountTabHref("membresia")}>Ficha Membresía</Link>
                      </Button>
                    </div>
                  </div>

                  {/* Status: Finanzas */}
                  <div className="border border-black/10 bg-white p-5 lg:p-8">
                    <div className="mb-4 flex items-center justify-between border-b border-black/5 pb-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d71920] lg:text-[10px]">
                        Finanzas
                      </p>
                      <Activity className="h-4 w-4 text-black/10" />
                    </div>
                    <div className="space-y-4 lg:space-y-6">
                      <div className="space-y-1">
                        <h5 className="font-display text-2xl font-black uppercase tracking-tight text-[#111111] lg:text-3xl">
                          {latestMembershipRequest
                            ? formatCartAmount(
                                latestMembershipRequest.manualPaymentSummary.balanceDue,
                                latestMembershipRequest.currencyCode,
                              )
                            : "S/ 0.00"}
                        </h5>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                          Saldo Pendiente
                        </p>
                      </div>
                      <div className="bg-[#fbfbf8] p-3 border border-black/5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[#7a7f87]">
                          Vigencia Ciclo
                        </p>
                        <p className="text-xs font-bold text-[#111111]">
                          {latestMembershipRequest?.cycleEndsOn
                            ? formatMemberAccountDate(latestMembershipRequest.cycleEndsOn)
                            : "No registrado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status: Tienda */}
                  <div className="border border-black/10 bg-white p-5 lg:p-8">
                    <div className="mb-4 flex items-center justify-between border-b border-black/5 pb-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d71920]">
                        E-Commerce
                      </p>
                      <ShoppingBag className="h-4 w-4 text-black/10" />
                    </div>
                    <div className="space-y-4 lg:space-y-6">
                      <div className="space-y-1">
                        <h5 className="font-display text-2xl font-black uppercase tracking-tight text-[#111111] lg:text-3xl">
                          {latestPickupRequest?.requestNumber ?? (activeCartItemCount > 0 ? "En Carrito" : "0 Pedidos")}
                        </h5>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                          {activeCartItemCount > 0 ? `${activeCartItemCount} Artículos esperando` : "Historial de Pedidos"}
                        </p>
                      </div>
                      <Button asChild variant="outline" className="h-10 w-full border-black/10 text-[8px] font-black uppercase tracking-widest hover:bg-[#111111] hover:text-white lg:h-12 lg:text-[9px]">
                        <Link href={buildMemberAccountTabHref("pedidos")}>Mis Pedidos</Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Accesos Rápidos Táctiles */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                  <Button asChild variant="outline" className="h-16 flex-col items-start gap-1 border-black/10 bg-white p-4 transition-all hover:bg-[#111111] hover:text-white lg:h-20 lg:p-6">
                    <Link href={buildMemberAccountTabHref("cuenta")}>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Profile</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Ajustes</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-16 flex-col items-start gap-1 border-black/10 bg-white p-4 transition-all hover:bg-[#111111] hover:text-white lg:h-20 lg:p-6">
                    <Link href="/tienda">
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Store</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Tienda</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-16 flex-col items-start gap-1 border-black/10 bg-white p-4 transition-all hover:bg-[#111111] hover:text-white lg:h-20 lg:p-6">
                    <Link href={buildMemberAccountTabSectionHref("pedidos", "pickup-history")}>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Logs</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Historial</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-16 flex-col items-start gap-1 border-[#d71920]/20 bg-[#d71920]/5 p-4 transition-all hover:bg-[#d71920] hover:text-white lg:h-20 lg:p-6">
                    <Link href="/">
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Home</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Inicio</span>
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="membresia" className="mt-0 space-y-6 outline-none lg:space-y-10">
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="flex h-12 w-12 items-center justify-center bg-[#111111] lg:h-16 lg:w-16">
                    <QrCode className="h-6 w-6 text-[#d71920] lg:h-8 lg:w-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d71920]">
                      Estado Operativo
                    </p>
                    <h3 className="font-display text-3xl font-black uppercase tracking-tight text-[#111111] lg:text-5xl">
                      Membresía y QR
                    </h3>
                  </div>
                </div>

                {latestMembershipRequest ? (
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
                    {/* Lado QR */}
                    <div id="membership-qr" className="w-full lg:sticky lg:top-40 lg:w-[360px]">
                      {memberQrUrl ? (
                        <MembershipQrCard
                          memberName={account.fullName}
                          qrUrl={memberQrUrl}
                          validation={latestMembershipRequest.validation}
                          detailHref={membershipDetailHref}
                        />
                      ) : (
                        <PublicInlineAlert
                          tone="warning"
                          title="QR aun no disponible"
                          message="Estamos regenerando tu identificador QR. Recarga la pagina en unos segundos."
                        />
                      )}
                    </div>

                    {/* Lado Detalle */}
                    <div className="flex-1 space-y-6">
                      <div className="border border-black/10 bg-white p-6 lg:p-10">
                        <div className="flex flex-col gap-6 border-b border-black/5 pb-8 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d71920]">
                              Plan Vigente
                            </p>
                            <h3 className="font-display text-4xl font-black uppercase tracking-tight text-[#111111] lg:text-5xl">
                              {latestMembershipRequest.planTitleSnapshot}
                            </h3>
                            <p className="text-sm font-medium text-[#7a7f87]">
                              ID {latestMembershipRequest.requestNumber} <span className="mx-2 text-black/10">|</span> 
                              {latestMembershipRequest.billingLabel ?? `${latestMembershipRequest.durationDays} Días`}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:gap-3">
                            <Badge variant={latestMembershipRequest.validation.tone === "success" ? "success" : "warning"} className="h-7 border-none px-3 text-[9px] font-black uppercase tracking-widest">
                              {membershipValidationStatusLabels[latestMembershipRequest.validation.status]}
                            </Badge>
                            <Badge variant={latestMembershipRequest.status === "active" ? "success" : "muted"} className="h-7 border-none px-3 text-[9px] font-black uppercase tracking-widest">
                              {membershipRequestStatusLabels[latestMembershipRequest.status]}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                          <div className="bg-[#fbfbf8] p-5 border border-black/5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#7a7f87]">Precio Ciclo</p>
                            <p className="mt-2 text-xl font-black text-[#111111]">
                              {formatCartAmount(latestMembershipRequest.priceAmount, latestMembershipRequest.currencyCode)}
                            </p>
                          </div>
                          <div className="bg-[#fbfbf8] p-5 border border-black/5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#7a7f87]">Pagado</p>
                            <p className="mt-2 text-xl font-black text-green-600">
                              {formatCartAmount(latestMembershipRequest.manualPaymentSummary.paidTotal, latestMembershipRequest.currencyCode)}
                            </p>
                          </div>
                          <div className="bg-black/2 p-5 border border-black/5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#7a7f87]">Saldo</p>
                            <p className="mt-2 text-xl font-black text-[#d71920]">
                              {formatCartAmount(latestMembershipRequest.manualPaymentSummary.balanceDue, latestMembershipRequest.currencyCode)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-4 lg:flex-row">
                          <Button asChild className="h-14 flex-1 bg-[#111111] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#d71920]">
                            <Link href={`/mi-cuenta/membresias/${latestMembershipRequest.id}`}>
                              Ver Expediente Completo
                            </Link>
                          </Button>
                          <MembershipReserveButton
                            membershipPlanId={latestMembershipRequest.plan.id}
                            renewsFromRequestId={latestMembershipRequest.id}
                            label="Renovar mi Plan"
                            variant="outline"
                            className="h-14 flex-1 border-black/10 text-[10px] font-black uppercase tracking-widest hover:bg-[#111111] hover:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
                    <div className="flex-1 space-y-8 border border-black/10 bg-white p-8 lg:p-12">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d71920]">Sin Ciclo Activo</p>
                        <h3 className="font-display text-4xl font-black uppercase tracking-tight text-[#111111] lg:text-6xl">
                          Activa tu Membresía
                        </h3>
                        <p className="max-w-xl text-sm leading-relaxed text-[#5f6368] lg:text-base">
                          Elige tu plan de entrenamiento y reserva tu lugar hoy mismo. Podrás gestionar el pago en recepción y activar tu QR de acceso.
                        </p>
                      </div>
                      <div className="grid gap-4">
                        {membershipPlans.slice(0, 3).map((plan) => (
                          <div key={plan.id} className="flex flex-col gap-6 bg-[#fbfbf8] border border-black/5 p-6 sm:flex-row sm:items-center sm:justify-between transition-all hover:border-[#d71920]">
                            <div className="space-y-1">
                              <p className="text-xl font-black uppercase tracking-tight text-[#111111]">{plan.title}</p>
                              <p className="text-[11px] font-bold text-[#7a7f87] uppercase tracking-widest">
                                {plan.billing_label ?? `${plan.duration_days} días`} · S/ {plan.price_amount.toFixed(2)}
                              </p>
                            </div>
                            <MembershipReserveButton
                              membershipPlanId={plan.id}
                              label="Reservar Ahora"
                              className="h-12 bg-[#111111] px-8 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#d71920]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pedidos" className="mt-0 space-y-8 outline-none">
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="flex h-12 w-12 items-center justify-center bg-[#111111] lg:h-16 lg:w-16">
                    <ShoppingBag className="h-6 w-6 text-[#d71920] lg:h-8 lg:w-8" />
                  </div>
                  <h3 className="font-display text-3xl font-black uppercase tracking-tight text-[#111111] lg:text-5xl">
                    Tienda y Pedidos
                  </h3>
                </div>

                <div className={cn(
                  "relative overflow-hidden border p-8 lg:p-16",
                  activeCart && activeCart.items?.length > 0
                    ? "bg-[#111111] text-white border-[#111111]"
                    : "bg-[#fbfbf8] border-dashed border-black/10"
                )}>
                  {activeCart && activeCart.items?.length > 0 ? (
                    <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Zap className="h-5 w-5 animate-pulse text-[#d71920]" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d71920]">Carrito Pendiente</p>
                        </div>
                        <h4 className="font-display text-4xl font-black uppercase tracking-tight italic lg:text-6xl">
                          Tienes {activeCart.summary.itemCount} productos
                        </h4>
                        <p className="text-xl text-white/40">
                          Total: <span className="font-bold text-white">{formatCartAmount(activeCart.summary.total, activeCart.summary.currencyCode)}</span>
                        </p>
                      </div>
                      <Button asChild className="h-16 bg-[#d71920] px-12 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white hover:text-[#111111] lg:h-20 lg:px-16">
                        <Link href="/carrito">Finalizar Pedido Ahora</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-6 py-6 text-center">
                      <ShoppingBag className="h-12 w-12 text-black/10" />
                      <div className="space-y-2">
                        <p className="text-xl font-black uppercase tracking-tight text-[#111111]">Carrito Vacío</p>
                        <p className="max-w-xs text-sm text-[#7a7f87]">Visita nuestra tienda para ver suplementos y equipo profesional.</p>
                      </div>
                      <Button asChild variant="outline" className="h-10 border-black/10 text-[9px] font-black uppercase tracking-widest">
                        <Link href="/tienda">Ir al Catálogo</Link>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Historial de Recogida */}
                <div id="pickup-history" className="space-y-6">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-black/20" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">Logística de Recogida</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="flex-1 space-y-6 border border-black/10 bg-white p-8 lg:p-12">
                      {latestPickupRequest ? (
                        <div className="space-y-10">
                          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#d71920]">Pedido Reciente</p>
                              <h4 className="font-display text-6xl font-black uppercase leading-none tracking-tighter text-[#111111] italic lg:text-7xl">
                                {latestPickupRequest.requestNumber}
                              </h4>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <Badge variant="default" className={cn(
                                "h-8 border-none px-6 text-[10px] font-black uppercase tracking-widest",
                                getPickupRequestStatusTone(latestPickupRequest.status) === "success" ? "bg-green-600" : "bg-[#111111]"
                              )}>
                                {pickupRequestStatusLabels[latestPickupRequest.status]}
                              </Badge>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-[#7a7f87]">
                                Monto: {formatCartAmount(latestPickupRequest.total, latestPickupRequest.currencyCode)}
                              </p>
                            </div>
                          </div>
                          <Button asChild variant="outline" className="h-14 w-full border-black/10 font-black uppercase tracking-widest hover:bg-[#111111] hover:text-white">
                            <Link href={`/mi-cuenta/pedidos/${latestPickupRequest.id}`}>Trazabilidad del Pedido</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <p className="text-xs font-bold uppercase tracking-widest text-black/20">Sin registros recientes.</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center gap-6 bg-[#111111] p-10 text-white lg:w-[280px]">
                      <p className="font-display text-7xl font-black italic">{pickupCount}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Total Pedidos</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cuenta" className="mt-0 space-y-8 outline-none lg:space-y-12">
                <section className="space-y-6">
                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className="flex h-12 w-12 items-center justify-center bg-[#111111] lg:h-16 lg:w-16">
                      <Activity className="h-6 w-6 text-[#d71920] lg:h-8 lg:w-8" />
                    </div>
                    <h3 className="font-display text-3xl font-black uppercase tracking-tight text-[#111111] lg:text-5xl">
                      Ajustes del Perfil
                    </h3>
                  </div>
                  <div className="border border-black/10 bg-white p-6 lg:p-12">
                    <MemberAccountSettings initialAccount={account} />
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className="flex h-12 w-12 items-center justify-center bg-[#111111] lg:h-16 lg:w-16">
                      <Star className="h-6 w-6 text-[#d71920] lg:h-8 lg:w-8" />
                    </div>
                    <h3 className="font-display text-3xl font-black uppercase tracking-tight text-[#111111] lg:text-5xl">
                      Reseña Comunidad
                    </h3>
                  </div>
                  <div className="border border-black/10 bg-white p-6 lg:p-12">
                    <MemberTestimonialForm initialTestimonial={testimonial} />
                  </div>
                </section>
              </TabsContent>
            </section>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
