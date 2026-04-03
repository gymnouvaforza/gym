"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, ShieldAlert, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { MemberSignOutButtonWithRedirect } from "@/components/auth/MemberSignOutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  memberAccountDeleteSchema,
  memberAccountPasswordSchema,
  memberAccountProfileSchema,
  type MemberAccountDeleteValues,
  type MemberAccountPasswordValues,
  type MemberAccountProfileValues,
} from "@/lib/validators/member-account";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface MemberAccountSettingsProps {
  initialAccount: {
    canManagePassword: boolean;
    email: string;
    fullName: string;
    phone: string | null;
    providerLabel: string;
  };
}

async function parseJson(response: Response) {
  return (await response.json().catch(() => ({}))) as {
    account?: MemberAccountSettingsProps["initialAccount"];
    error?: string;
    message?: string;
  };
}

export default function MemberAccountSettings({
  initialAccount,
}: Readonly<MemberAccountSettingsProps>) {
  const router = useRouter();
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [securityFeedback, setSecurityFeedback] = useState<string | null>(null);
  const [dangerFeedback, setDangerFeedback] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProfilePending, setIsProfilePending] = useState(false);
  const [isPasswordPending, setIsPasswordPending] = useState(false);
  const [isDeletePending, setIsDeletePending] = useState(false);

  const profileForm = useForm<MemberAccountProfileValues>({
    resolver: zodResolver(memberAccountProfileSchema),
    defaultValues: {
      email: initialAccount.email,
      fullName: initialAccount.fullName,
      phone: initialAccount.phone,
    },
  });

  const passwordForm = useForm<MemberAccountPasswordValues>({
    resolver: zodResolver(memberAccountPasswordSchema),
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
    },
  });

  const deleteForm = useForm<MemberAccountDeleteValues>({
    resolver: zodResolver(memberAccountDeleteSchema),
    defaultValues: {
      confirmationText: "",
      currentPassword: "",
    },
  });

  const passwordDisabledMessage = useMemo(() => {
    if (initialAccount.canManagePassword) {
      return null;
    }

    return `Tu acceso actual (${initialAccount.providerLabel}) no permite cambiar contrasena ni borrar la cuenta desde esta pantalla.`;
  }, [initialAccount.canManagePassword, initialAccount.providerLabel]);

  async function handleProfileSubmit(values: MemberAccountProfileValues) {
    setProfileFeedback(null);
    setIsProfilePending(true);

    try {
      const response = await fetch("/api/member-account/profile", {
        body: JSON.stringify(values),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      });
      const payload = await parseJson(response);

      if (!response.ok) {
        setProfileFeedback(payload.error ?? "No se pudo actualizar tu perfil.");
        return;
      }

      if (payload.account) {
        profileForm.reset({
          email: payload.account.email,
          fullName: payload.account.fullName,
          phone: payload.account.phone,
        });
      }

      setProfileFeedback("Perfil actualizado correctamente.");
      router.refresh();
    } finally {
      setIsProfilePending(false);
    }
  }

  async function handlePasswordSubmit(values: MemberAccountPasswordValues) {
    setSecurityFeedback(null);
    setIsPasswordPending(true);

    try {
      const response = await fetch("/api/member-account/password", {
        body: JSON.stringify(values),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      });
      const payload = await parseJson(response);

      if (!response.ok) {
        setSecurityFeedback(payload.error ?? "No se pudo cambiar la contrasena.");
        return;
      }

      passwordForm.reset();
      setSecurityFeedback(payload.message ?? "Contrasena actualizada correctamente.");
    } finally {
      setIsPasswordPending(false);
    }
  }

  async function handleDeleteSubmit(values: MemberAccountDeleteValues) {
    setDangerFeedback(null);
    setIsDeletePending(true);

    try {
      const response = await fetch("/api/member-account/delete", {
        body: JSON.stringify(values),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const payload = await parseJson(response);

      if (!response.ok) {
        setDangerFeedback(payload.error ?? "No se pudo eliminar la cuenta.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut().catch(() => undefined);
      router.push("/cuenta-eliminada");
      router.refresh();
    } finally {
      setIsDeletePending(false);
      setIsDeleteDialogOpen(false);
    }
  }

  return (
    <div className="divide-y divide-black/10 space-y-16">
      
      {/* SECCIÓN: PERFIL */}
      <section className="grid grid-cols-1 gap-x-16 gap-y-10 pt-10 first:pt-0 xl:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-[#111111] flex items-center justify-center">
                <UserRound className="h-5 w-5 text-[#d71920]" />
             </div>
             <h3 className="text-2xl font-display font-black uppercase tracking-tight italic">Perfil del Socio</h3>
          </div>
          <p className="text-sm leading-6 text-[#5f6368] max-w-sm">
            Edita tu email y tus datos básicos visibles. Este email será tu nuevo acceso principal al portal de Titan Gym.
          </p>
        </div>
        
        <div className="xl:col-span-2">
           <Card className="rounded-none border-black/10 shadow-xl overflow-hidden">
              <CardContent className="pt-10 p-10">
                 <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-8">
                       <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                          <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">Nombre Completo</FormLabel>
                                <FormControl>
                                  <Input className="h-14 rounded-none border-black/10 focus-visible:ring-[#111111]" {...field} />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase font-bold" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">Teléfono de Contacto</FormLabel>
                                <FormControl>
                                  <Input
                                    className="h-14 rounded-none border-black/10 focus-visible:ring-[#111111]"
                                    type="tel"
                                    autoComplete="tel"
                                    value={field.value ?? ""}
                                    onChange={(event) => field.onChange(event.target.value)}
                                  />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase font-bold" />
                              </FormItem>
                            )}
                          />
                       </div>
                       <FormField
                         control={profileForm.control}
                         name="email"
                         render={({ field }) => (
                           <FormItem className="space-y-3">
                             <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">Email de Acceso</FormLabel>
                             <FormControl>
                               <Input className="h-14 rounded-none border-black/10 focus-visible:ring-[#111111]" type="email" {...field} />
                             </FormControl>
                             <FormDescription className="text-[10px] font-medium italic text-[#7a7f87]">
                               Se enviará un correo de confirmación si cambias tu dirección de acceso.
                             </FormDescription>
                             <FormMessage className="text-[10px] uppercase font-bold" />
                           </FormItem>
                         )}
                       />
                       
                       <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-black/5 gap-6">
                          {profileFeedback ? (
                            <div className="flex items-center gap-2">
                               <div className="h-1.5 w-1.5 rounded-full bg-[#d71920] animate-pulse" />
                               <p className="text-[10px] font-black uppercase text-[#111111] tracking-widest">{profileFeedback}</p>
                            </div>
                          ) : <div />}
                          <Button 
                            type="submit" 
                            disabled={isProfilePending} 
                            className="h-14 px-12 rounded-none bg-[#111111] text-white font-black uppercase text-[11px] tracking-[0.2em] hover:bg-[#d71920] transition-all shadow-lg w-full sm:w-auto"
                          >
                            {isProfilePending && <Loader2 className="mr-3 h-4 w-4 animate-spin" />}
                            Actualizar Ficha
                          </Button>
                       </div>
                    </form>
                 </Form>
              </CardContent>
           </Card>
        </div>
      </section>

      {/* SECCIÓN: SEGURIDAD */}
      <section className="grid grid-cols-1 gap-x-16 gap-y-10 pt-16 xl:grid-cols-3">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-[#111111] flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-[#d71920]" />
               </div>
               <h3 className="text-2xl font-display font-black uppercase tracking-tight italic">Seguridad</h3>
            </div>
            <p className="text-sm leading-6 text-[#5f6368] max-w-sm">
               Gestiona tu contraseña y revisa el método de acceso. Actualmente autenticado mediante <span className="font-bold text-[#111111] underline decoration-[#d71920] underline-offset-4">{initialAccount.providerLabel}</span>.
            </p>
            <div className="pt-2">
               {initialAccount.canManagePassword && (
                 <Badge variant="success" className="bg-green-500/10 text-green-600 border-none font-black uppercase text-[9px] px-3 h-6">Password Managed</Badge>
               )}
            </div>
         </div>

         <div className="xl:col-span-2">
            <Card className="rounded-none border-black/10 shadow-xl overflow-hidden">
               <CardContent className="pt-10 p-10">
                  {passwordDisabledMessage ? (
                     <div className="bg-[#fbfbf8] p-10 border border-black/5 flex flex-col items-center text-center gap-8">
                        <div className="h-16 w-16 bg-black/5 flex items-center justify-center rounded-full">
                           <Lock className="h-8 w-8 text-black/20" />
                        </div>
                        <div className="space-y-2">
                           <p className="text-sm font-bold text-[#111111] uppercase tracking-tight italic">{passwordDisabledMessage}</p>
                           <p className="text-xs text-[#7a7f87]">Usa el portal de tu proveedor para realizar estos ajustes.</p>
                        </div>
                        <MemberSignOutButtonWithRedirect redirectTo="/" />
                     </div>
                  ) : (
                     <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-8">
                           <FormField
                             control={passwordForm.control}
                             name="currentPassword"
                             render={({ field }) => (
                               <FormItem className="space-y-3">
                                 <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">Contraseña Actual</FormLabel>
                                 <FormControl>
                                   <Input className="h-14 rounded-none border-black/10 focus-visible:ring-[#111111]" type="password" {...field} />
                                 </FormControl>
                                 <FormMessage className="text-[10px] uppercase font-bold" />
                               </FormItem>
                             )}
                           />
                           <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                              <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem className="space-y-3">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">Nueva Contraseña</FormLabel>
                                    <FormControl>
                                      <Input className="h-14 rounded-none border-black/10 focus-visible:ring-[#111111]" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                  <FormItem className="space-y-3">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">Repetir Nueva Contraseña</FormLabel>
                                    <FormControl>
                                      <Input className="h-14 rounded-none border-black/10 focus-visible:ring-[#111111]" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                  </FormItem>
                                )}
                              />
                           </div>
                           <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-black/5 gap-6">
                              {securityFeedback ? (
                                <div className="flex items-center gap-2">
                                   <div className="h-1.5 w-1.5 rounded-full bg-[#d71920] animate-pulse" />
                                   <p className="text-[10px] font-black uppercase text-[#111111] tracking-widest">{securityFeedback}</p>
                                </div>
                              ) : <div />}
                              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                                 <Button 
                                    type="submit" 
                                    disabled={isPasswordPending} 
                                    className="h-14 px-12 rounded-none bg-[#111111] text-white font-black uppercase text-[11px] tracking-[0.2em] hover:bg-[#d71920] transition-all shadow-lg flex-1 sm:flex-none"
                                 >
                                    {isPasswordPending && <Loader2 className="mr-3 h-4 w-4 animate-spin" />}
                                    Cambiar Clave
                                 </Button>
                                 <MemberSignOutButtonWithRedirect redirectTo="/" />
                              </div>
                           </div>
                        </form>
                     </Form>
                  )}
               </CardContent>
            </Card>
         </div>
      </section>

      {/* SECCIÓN: PELIGRO */}
      <section className="grid grid-cols-1 gap-x-16 gap-y-10 pt-16 xl:grid-cols-3">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-red-600 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-white" />
               </div>
               <h3 className="text-2xl font-display font-black uppercase tracking-tight italic text-red-600">Baja del Sistema</h3>
            </div>
            <p className="text-sm leading-6 text-red-600/60 max-w-sm">
               La eliminación de la cuenta es irreversible. Se perderá el acceso inmediato y se desvincularán tus datos del portal privado.
            </p>
         </div>

         <div className="xl:col-span-2">
            <Card className="rounded-none border-red-200 bg-red-50/30 shadow-sm overflow-hidden">
               <CardContent className="p-10 flex flex-col sm:flex-row items-center justify-between gap-10">
                  <div className="space-y-2">
                     <p className="text-lg font-black text-red-900 uppercase tracking-tighter italic leading-none">¿Deseas darte de baja definitivamente?</p>
                     <p className="text-[11px] font-bold text-red-700/60 uppercase tracking-widest">Esta operación no puede deshacerse de ninguna forma.</p>
                  </div>
                  
                  {dangerFeedback ? <p className="text-xs font-black uppercase text-red-700">{dangerFeedback}</p> : null}
                  
                  {passwordDisabledMessage ? (
                     <div className="bg-white border border-red-200 px-6 py-3">
                        <p className="text-[10px] font-black uppercase text-red-700 tracking-widest leading-none">{passwordDisabledMessage}</p>
                     </div>
                  ) : (
                     <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            type="button" 
                            variant="destructive" 
                            className="h-14 px-12 rounded-none font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-red-700 transition-all"
                          >
                            Eliminar Cuenta
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-none border-black/10">
                          <DialogHeader>
                            <DialogTitle className="font-display text-2xl font-black uppercase italic tracking-tight">Confirmar Baja</DialogTitle>
                            <DialogDescription className="text-sm leading-6">
                              Confirma con tu contraseña actual y escribe la palabra de seguridad <strong className="text-red-600">ELIMINAR</strong> para proceder.
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...deleteForm}>
                            <form onSubmit={deleteForm.handleSubmit(handleDeleteSubmit)} className="space-y-6 pt-4">
                              <FormField
                                control={deleteForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                  <FormItem className="space-y-3">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">Contraseña Actual</FormLabel>
                                    <FormControl>
                                      <Input className="h-12 rounded-none border-black/10 focus-visible:ring-[#111111]" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={deleteForm.control}
                                name="confirmationText"
                                render={({ field }) => (
                                  <FormItem className="space-y-3">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">Palabra de Seguridad</FormLabel>
                                    <FormControl>
                                      <Input className="h-12 rounded-none border-black/10 focus-visible:ring-[#111111]" type="text" placeholder="ELIMINAR" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                  </FormItem>
                                )}
                              />
                              <DialogFooter className="gap-4 pt-6 flex-col sm:flex-row">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-12 rounded-none font-black uppercase text-[10px] tracking-widest flex-1 sm:flex-none"
                                  onClick={() => setIsDeleteDialogOpen(false)}
                                  disabled={isDeletePending}
                                >
                                  Abortar
                                </Button>
                                <Button 
                                  type="submit" 
                                  variant="destructive" 
                                  className="h-12 rounded-none font-black uppercase text-[10px] tracking-widest flex-1 sm:flex-none"
                                  disabled={isDeletePending}
                                >
                                  {isDeletePending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                  Confirmar Baja
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                     </Dialog>
                  )}
               </CardContent>
            </Card>
         </div>
      </section>

    </div>
  );
}
