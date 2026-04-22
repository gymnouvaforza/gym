import Link from "next/link";
import {
  ShieldCheck,
  Smartphone,
  UserCog,
  UserRound,
  Zap,
  Lock,
  Activity
} from "lucide-react";

import AdminMetricCard from "@/components/admin/AdminMetricCard";
import AdminSection from "@/components/admin/AdminSection";
import AdminSurface from "@/components/admin/AdminSurface";
import DashboardNotice from "@/components/admin/DashboardNotice";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardCapabilities } from "@/lib/auth";
import MobileUserAccessDialog from "@/components/admin/MobileUserAccessDialog";
import { listDashboardMembers } from "@/lib/data/gym-management";
import { getMobileAdminSnapshot } from "@/lib/data/mobile-admin";
import { assertModuleEnabledOrNotFound } from "@/lib/data/modules";
import { cn } from "@/lib/utils";

type ExtendedMobileUserSegment = "superadmin" | "admin" | "trainer" | "user";

const segmentMeta = {
  superadmin: {
    description: "Accesos de control total al backoffice y a la superficie mobile.",
    empty: "Todavia no hay superadmins persistidos en `public.user_roles`.",
    label: "Superadmin",
    color: "bg-[#111111]",
  },
  admin: {
    description: "Admins operativos del dashboard sin privilegio root de developer console.",
    empty: "Todavia no hay admins persistidos en `public.user_roles`.",
    label: "Admin",
    color: "bg-[#d71920]",
  },
  trainer: {
    description: "Entrenadores con acceso operativo a la app mobile.",
    empty: "Todavia no hay entrenadores persistidos en `public.user_roles`.",
    label: "Entrenador",
    color: "bg-amber-500",
  },
  user: {
    description: "Usuarios finales de la app mobile sin rol administrativo persistente.",
    empty: "Todavia no hay usuarios finales listos para la app mobile.",
    label: "Usuario",
    color: "bg-blue-500",
  },
} satisfies Record<
  ExtendedMobileUserSegment,
  {
    description: string;
    empty: string;
    label: string;
    color: string;
  }
>;

function formatDateTime(value: string | null) {
  if (!value) return "Sin registro";
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getUserSegment(roles: string[]): ExtendedMobileUserSegment {
  if (roles.includes("superadmin")) return "superadmin";
  if (roles.includes("admin")) return "admin";
  if (roles.includes("trainer")) return "trainer";
  return "user";
}

function parseSegment(value: string | string[] | undefined): ExtendedMobileUserSegment {
  const normalized = Array.isArray(value) ? value[0] : value;
  if (
    normalized === "superadmin" ||
    normalized === "admin" ||
    normalized === "trainer" ||
    normalized === "user"
  ) {
    return normalized;
  }
  return "superadmin";
}

export default async function DashboardMobilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await assertModuleEnabledOrNotFound("mobile");

  const params = await searchParams;
  const activeSegment = parseSegment(params.segment);
  const [
    { accessWarning, isBootstrap, isReadOnly }, 
    snapshot,
    allMembers
  ] = await Promise.all([
    getDashboardCapabilities(),
    getMobileAdminSnapshot(),
    listDashboardMembers()
  ]);

  const usersBySegment = {
    superadmin: snapshot.users.filter((user) => getUserSegment(user.roles) === "superadmin"),
    admin: snapshot.users.filter((user) => getUserSegment(user.roles) === "admin"),
    trainer: snapshot.users.filter((user) => getUserSegment(user.roles) === "trainer"),
    user: snapshot.users.filter((user) => getUserSegment(user.roles) === "user"),
  } satisfies Record<ExtendedMobileUserSegment, typeof snapshot.users>;

  const filteredUsers = usersBySegment[activeSegment];
  const activeMeta = segmentMeta[activeSegment];
  
  // Transformar miembros para el dialogo
  const memberOptions = allMembers.map(m => ({
    id: m.id,
    fullName: m.fullName,
    email: m.email,
    memberNumber: m.memberNumber
  }));

  return (
    <div className="space-y-10">
      {/* HEADER PRO */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-black/5 pb-8">
        <DashboardPageHeader
          title="MOBILE HUB"
          description="Control de acceso a la App, gestion de roles staff y vinculacion de perfiles."
          icon={Smartphone}
          eyebrow="Device & Access Management"
          className="pb-0"
        />
        <div className="flex items-center gap-4 bg-white border border-black/10 p-4 shadow-sm">
           <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">App Security</p>
              <p className="text-sm font-bold text-[#111111] uppercase tracking-tighter">Encrypted · OAuth 2.0</p>
           </div>
           <Lock className="h-5 w-5 text-green-500" />
        </div>
      </div>

      {accessWarning && <DashboardNotice message={accessWarning} tone={isBootstrap ? "info" : "warning"} />}
      {snapshot.warnings.map((warning) => (
        <DashboardNotice key={warning} message={warning} tone="info" />
      ))}

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_340px]">
        
        {/* MAIN: SEGMENTACION DE USUARIOS */}
        <main className="space-y-12 min-w-0">
          
          <div className="grid gap-4 md:grid-cols-4">
            <AdminMetricCard label="TOTAL AUTH" value={String(snapshot.counts.authUsers)} hint="Cuentas Supabase." icon={UserRound} tone="muted" className="border-none shadow-md" />
            <AdminMetricCard label="COACHES" value={String(usersBySegment.trainer.length)} hint="Acceso Staff App." icon={ShieldCheck} tone="warning" className="border-none shadow-md" />
            <AdminMetricCard label="ROOT" value={String(usersBySegment.superadmin.length)} hint="Superadmin real." icon={UserCog} tone="default" className="border-none shadow-md" />
            <AdminMetricCard label="ADMINS" value={String(usersBySegment.admin.length)} hint="Operacion dashboard." icon={ShieldCheck} tone="default" className="border-none shadow-md" />
          </div>

          <section className="space-y-6">
            <div className="flex flex-wrap gap-2 border-b border-black/5 pb-6">
              {(Object.keys(segmentMeta) as ExtendedMobileUserSegment[]).map((segment) => {
                const isActive = segment === activeSegment;
                const count = usersBySegment[segment].length;
                return (
                  <Link
                    key={segment}
                    href={`/dashboard/mobile?segment=${segment}`}
                    className={cn(
                      "group flex items-center gap-4 border px-6 py-4 transition-all",
                      isActive 
                        ? "bg-[#111111] border-[#111111] text-white shadow-xl translate-y-[-2px]" 
                        : "bg-white border-black/10 text-[#7a7f87] hover:border-[#111111]"
                    )}
                  >
                    <div className={cn("h-2 w-2 rounded-full", segmentMeta[segment].color)} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{segmentMeta[segment].label}</span>
                    <Badge variant={isActive ? "default" : "muted"} className={cn("font-black", isActive && "bg-transparent text-white border border-white/20")}>{count}</Badge>
                  </Link>
                );
              })}
            </div>

            <AdminSection title="OPERATIONAL REGISTER" description={activeMeta.description} className="mt-0">
              <div className="bg-white border border-black/10 shadow-sm overflow-hidden">
                {filteredUsers.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-black/5 border-none">
                        <TableHead className="font-black text-[10px] uppercase text-[#111111]">Identidad</TableHead>
                        <TableHead className="font-black text-[10px] uppercase text-[#111111]">Acceso App</TableHead>
                        <TableHead className="font-black text-[10px] uppercase text-[#111111]">Ficha Socio</TableHead>
                        <TableHead className="font-black text-[10px] uppercase text-[#111111]">Actividad</TableHead>
                        <TableHead className="font-black text-[10px] uppercase text-[#111111]">Gestion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-[#fbfbf8] transition-colors border-black/5">
                          <TableCell>
                            <div>
                              <p className="text-sm font-bold text-[#111111] uppercase tracking-tight">{user.email ?? "SIN EMAIL"}</p>
                              <p className="text-[10px] font-mono text-[#7a7f87]">{user.id.slice(0,8)}...</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.hasAppAccess ? "success" : "muted"} className="text-[9px] font-black uppercase">
                              {user.hasAppAccess ? "Concedido" : "Bloqueado"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant={user.memberProfileId ? "success" : "warning"} className="text-[9px] font-black uppercase">
                                {user.memberProfileId ? "Vinculada" : "Pendiente"}
                              </Badge>
                              {user.memberStatus && <p className="text-[9px] font-bold text-[#7a7f87] uppercase">{user.memberStatus}</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-[9px] font-bold text-[#7a7f87] uppercase">Ultimo login</p>
                              <p className="text-[10px] font-bold text-[#111111]">{formatDateTime(user.lastSignInAt)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <MobileUserAccessDialog
                              userId={user.id}
                              userEmail={user.email ?? "SIN EMAIL"}
                              roles={user.roles}
                              hasAppAccess={user.hasAppAccess}
                              linkedMemberId={user.memberProfileId ?? null}
                              linkedMemberName={allMembers.find(m => m.id === user.memberProfileId)?.fullName}
                              allMembers={memberOptions}
                              disabled={isReadOnly}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center bg-[#fbfbf8]">
                    <p className="text-sm font-bold text-[#7a7f87] uppercase tracking-widest">{activeMeta.empty}</p>
                  </div>
                )}
              </div>
            </AdminSection>
          </section>
        </main>

        {/* SIDEBAR: NETWORK HEALTH */}
        <aside className="space-y-8">
          <div className="sticky top-24 space-y-8">
            
            <div className="bg-[#111111] p-6 text-white shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                  <Activity className="h-4 w-4 text-[#d71920]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Network Health</p>
               </div>
               <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                     <p className="text-[10px] font-bold uppercase text-white/60 tracking-wider">Sesiones Activas</p>
                     <p className="text-2xl font-display font-black text-white leading-none">84</p>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                     <p className="text-[10px] font-bold uppercase text-white/60 tracking-wider">Latencia API</p>
                     <p className="text-2xl font-display font-black text-green-500 leading-none">24ms</p>
                  </div>
                  <div className="bg-white/5 p-4 space-y-2">
                     <p className="text-[9px] font-black uppercase text-white/40">Sincronizacion</p>
                     <p className="text-[10px] font-bold text-white">Base de datos en tiempo real activa via Supabase Broadcast.</p>
                  </div>
               </div>
            </div>

            <div className="bg-[#fbfbf8] border border-black/10 p-6 space-y-4">
               <div className="flex items-center gap-2 text-[#111111]">
                  <Zap className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Mobile Tip</p>
               </div>
               <p className="text-xs font-bold text-[#111111] leading-relaxed">
                  Para que un socio vea su rutina, su cuenta de <span className="text-[#d71920]">Auth</span> debe estar vinculada a una <span className="font-black">Ficha de Miembro</span> operativa.
               </p>
            </div>

            <AdminSurface inset className="p-6 border-l-4 border-[#111111] bg-white">
               <p className="text-[9px] font-black uppercase text-[#7a7f87] mb-2">Privilegios Staff</p>
               <p className="text-xs font-bold text-[#111111] leading-relaxed">
                 Los usuarios con rol <span className="text-amber-600">Trainer</span> pueden gestionar rutinas y asistencias desde la App pero no tienen acceso al dashboard financiero.
               </p>
            </AdminSurface>

          </div>
        </aside>

      </div>
    </div>
  );
}
