"use client";

import { useState, useTransition } from "react";
import { 
  ShieldCheck, 
  UserPlus, 
  UserMinus, 
  Settings2, 
  Link as LinkIcon, 
  Link2Off,
  UserCog,
  Smartphone,
  Lock,
  Search,
  Check,
  Activity,
  UserRoundPlus,
  ArrowRight
} from "lucide-react";

import { 
  promoteDashboardUserToTrainer, 
  demoteDashboardUserFromTrainer,
  linkUserToMemberAction,
  toggleAppAccessAction,
  quickCreateMemberAndLinkAction
} from "@/app/(admin)/dashboard/mobile/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MemberOption {
  id: string;
  fullName: string;
  email: string;
  memberNumber: string;
}

interface MobileUserAccessDialogProps {
  userId: string;
  userEmail: string;
  roles: string[];
  hasAppAccess: boolean;
  linkedMemberId: string | null;
  linkedMemberName?: string | null;
  allMembers: MemberOption[];
  disabled?: boolean;
}

export default function MobileUserAccessDialog({
  userId,
  userEmail,
  roles,
  hasAppAccess,
  linkedMemberId,
  linkedMemberName,
  allMembers,
  disabled,
}: MobileUserAccessDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  
  // Form para alta rapida
  const [quickName, setQuickName] = useState("");

  const isTrainer = roles.includes("trainer");
  const isAdmin = roles.includes("admin") || roles.includes("superadmin");
  
  const filteredMembers = allMembers.filter(m => 
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.memberNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const handlePromote = () => {
    startTransition(async () => {
      await promoteDashboardUserToTrainer(userId);
    });
  };

  const handleDemote = () => {
    startTransition(async () => {
      await demoteDashboardUserFromTrainer(userId);
    });
  };

  const handleLink = (memberId: string | null) => {
    startTransition(async () => {
      await linkUserToMemberAction(userId, memberId);
      setOpen(false);
    });
  };

  const handleToggleAccess = () => {
    startTransition(async () => {
      await toggleAppAccessAction(userId, !hasAppAccess);
    });
  };

  const handleQuickCreate = () => {
    if (!quickName.trim()) return;
    startTransition(async () => {
      await quickCreateMemberAndLinkAction(userId, quickName, userEmail);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) setShowQuickCreate(false); }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={disabled || isAdmin}
          className="h-8 border-black/10 bg-white text-[9px] font-black uppercase tracking-widest hover:bg-[#111111] hover:text-white transition-all rounded-none"
        >
          <Settings2 className="mr-2 h-3 w-3" />
          Ajustes Acceso
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-none border-none p-0 shadow-2xl overflow-hidden bg-[#fbfbf8]">
        {/* HEADER INDUSTRIAL */}
        <div className="bg-[#111111] p-8 text-white">
           <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 bg-white flex items-center justify-center">
                 <Lock className="h-6 w-6 text-[#d71920]" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Security Protocol</p>
                 <DialogTitle className="text-2xl font-display font-black uppercase tracking-tighter text-white">
                    Access Control Config
                 </DialogTitle>
              </div>
           </div>
           <div className="p-4 bg-white/5 border border-white/10">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Identidad Digital</p>
              <p className="text-sm font-bold text-white mt-1">{userEmail}</p>
           </div>
        </div>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
           
           {/* SECCION 0: ACCESO GLOBAL APP */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                 <Activity className="h-4 w-4 text-[#d71920]" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#111111]">Estado de Conexión App</p>
              </div>
              
              <div className={cn(
                "flex flex-col md:flex-row items-center justify-between gap-6 p-6 border shadow-sm transition-colors",
                hasAppAccess ? "bg-white border-black/5" : "bg-red-50 border-red-100"
              )}>
                 <div className="flex-1 space-y-1">
                    <p className="text-sm font-black uppercase text-[#111111]">Permiso de Login</p>
                    <p className="text-xs text-[#7a7f87] leading-relaxed">
                       {hasAppAccess 
                         ? "El usuario tiene acceso por defecto. Puede entrar en la App si tiene cuenta vinculada." 
                         : "Acceso denegado manualmente. El usuario no podra iniciar sesion aunque tenga ficha."}
                    </p>
                 </div>
                 <Button 
                    variant={hasAppAccess ? "outline" : "default"} 
                    onClick={handleToggleAccess}
                    disabled={isPending}
                    className={cn(
                      "font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-none",
                      hasAppAccess 
                        ? "border-[#d71920] text-[#d71920] hover:bg-[#d71920] hover:text-white" 
                        : "bg-[#111111] text-white hover:bg-green-600"
                    )}
                 >
                    {hasAppAccess ? "Bloquear Acceso" : "Habilitar Acceso"}
                 </Button>
              </div>
           </div>

           {/* SECCION 1: ROLES STAFF */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                 <UserCog className="h-4 w-4 text-[#d71920]" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#111111]">Privilegios Staff</p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-black/5 p-6 shadow-sm">
                 <div className="flex-1 space-y-1">
                    <p className="text-sm font-black uppercase text-[#111111]">Rol Entrenador (Trainer)</p>
                    <p className="text-xs text-[#7a7f87] leading-relaxed">
                       Permite al usuario loguearse en la App Staff para gestionar rutinas y asistencias.
                    </p>
                 </div>
                 {isTrainer ? (
                    <Button 
                      variant="outline" 
                      onClick={handleDemote} 
                      disabled={isPending}
                      className="border-amber-500/20 text-amber-600 hover:bg-amber-500 hover:text-white font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-none"
                    >
                       <UserMinus className="mr-2 h-4 w-4" /> Revocar Role
                    </Button>
                 ) : (
                    <Button 
                      onClick={handlePromote} 
                      disabled={isPending}
                      className="bg-[#111111] text-white hover:bg-[#d71920] font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-none"
                    >
                       <UserPlus className="mr-2 h-4 w-4" /> Promover a Trainer
                    </Button>
                 )}
              </div>
           </div>

           {/* SECCION 2: VINCULACION MIEMBRO */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                 <Smartphone className="h-4 w-4 text-[#d71920]" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#111111]">Vinculo Mobile Socio</p>
              </div>

              {linkedMemberId ? (
                 <div className="bg-white border border-black/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                       <div className="h-10 w-10 bg-green-500/10 flex items-center justify-center">
                          <LinkIcon className="h-5 w-5 text-green-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-[#7a7f87]">Vinculado con:</p>
                          <p className="text-sm font-black uppercase text-[#111111]">{linkedMemberName || "Ficha Miembro"}</p>
                       </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleLink(null)}
                      disabled={isPending}
                      className="text-[#d71920] hover:bg-[#d71920]/5 font-black uppercase text-[10px] tracking-widest rounded-none"
                    >
                       <Link2Off className="mr-2 h-4 w-4" /> Desvincular
                    </Button>
                 </div>
              ) : (
                 <div className="bg-[#fbfbf8] border border-black/10 p-6 space-y-6">
                    {!showQuickCreate ? (
                      <>
                        <div className="space-y-2">
                           <p className="text-xs font-bold text-[#111111] uppercase tracking-tight">Vincular ficha existente</p>
                           <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" />
                              <input 
                                type="text" 
                                placeholder="Buscar por nombre, email o ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-12 border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-[#d71920]/20"
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           {searchTerm.length > 0 && filteredMembers.map(member => (
                              <button 
                                key={member.id}
                                onClick={() => handleLink(member.id)}
                                disabled={isPending}
                                className="w-full flex items-center justify-between p-4 bg-white border border-black/5 hover:border-[#111111] transition-all group"
                              >
                                 <div className="text-left">
                                    <p className="text-xs font-black uppercase text-[#111111]">{member.fullName}</p>
                                    <p className="text-[10px] text-[#7a7f87] uppercase tracking-tighter">{member.memberNumber} · {member.email}</p>
                                 </div>
                                 <Check className="h-4 w-4 text-[#d71920] opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                           ))}
                           {searchTerm.length > 0 && filteredMembers.length === 0 && (
                              <p className="text-center py-4 text-[10px] font-bold text-[#7a7f87] uppercase">No se encontraron miembros.</p>
                           )}
                        </div>

                        <div className="pt-4 border-t border-black/5">
                           <Button 
                             variant="outline" 
                             onClick={() => setShowQuickCreate(true)}
                             className="w-full h-12 border-dashed border-black/20 text-[#111111] font-black uppercase text-[10px] tracking-widest hover:bg-[#111111] hover:text-white transition-all rounded-none"
                           >
                              <UserRoundPlus className="mr-2 h-4 w-4" /> Crear Nueva Ficha para este usuario
                           </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-6 animate-in slide-in-from-bottom-2">
                         <div className="flex items-center gap-3 text-[#d71920]">
                            <UserRoundPlus className="h-5 w-5" />
                            <p className="text-xs font-black uppercase tracking-widest">Alta Rapida de Socio</p>
                         </div>
                         <div className="space-y-4">
                            <div className="space-y-2">
                               <p className="text-[9px] font-black uppercase text-[#7a7f87]">Nombre Completo del Miembro</p>
                               <input 
                                 type="text" 
                                 placeholder="Ej. Juan Perez"
                                 value={quickName}
                                 onChange={(e) => setQuickName(e.target.value)}
                                 className="w-full h-12 border border-black/10 bg-white px-4 text-sm font-bold outline-none focus:ring-1 focus:ring-[#d71920]/20"
                               />
                            </div>
                            <div className="p-4 bg-black/5 space-y-1">
                               <p className="text-[9px] font-black uppercase text-[#7a7f87]">Email del Socio (Auth)</p>
                               <p className="text-xs font-bold text-[#111111]">{userEmail}</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              onClick={() => setShowQuickCreate(false)}
                              className="flex-1 h-12 font-black uppercase text-[10px] tracking-widest"
                            >
                               Cancelar
                            </Button>
                            <Button 
                              onClick={handleQuickCreate}
                              disabled={isPending || !quickName.trim()}
                              className="flex-1 h-12 bg-[#111111] text-white font-black uppercase text-[10px] tracking-widest hover:bg-[#d71920]"
                            >
                               Crear y Vincular <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                         </div>
                      </div>
                    )}
                 </div>
              )}
           </div>
        </div>

        {/* FOOTER INDICATOR */}
        <div className="bg-[#111111]/5 p-4 border-t border-black/5 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-green-600" />
              <p className="text-[8px] font-black uppercase tracking-widest text-[#7a7f87]">Security Policy Enforced</p>
           </div>
           {isPending && <p className="text-[8px] font-black uppercase text-[#d71920] animate-pulse">Sincronizando Kernel...</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
