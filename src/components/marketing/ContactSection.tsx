import Link from "next/link";
import { Mail, MapPin, MessageSquareMore, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";
import type { SiteSettings } from "@/lib/supabase/database.types";

export default function ContactSection({ settings }: { settings: SiteSettings }) {
  return (
    <section id="contacto" className="section-anchor bg-[#f5f5f0] py-24 md:py-32">
      <div className="section-shell grid gap-16 lg:grid-cols-2 lg:items-center">
        <div className="max-w-xl">
          <p className="section-kicker">Comienza hoy</p>
          <h2 className="section-title italic">
            Ubicación & <span className="text-accent underline decoration-accent/20 underline-offset-8">Contacto</span>
          </h2>

          <div className="mt-16 space-y-12">
            <div className="flex items-start gap-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-black text-accent">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Dirección</p>
                <p className="mt-3 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                  {novaForzaHomeContent.contact.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-black text-accent">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">
                  {novaForzaHomeContent.contact.whatsappLabel}
                </p>
                <p className="mt-3 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                  {novaForzaHomeContent.contact.whatsappDisplay}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-black text-accent">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">
                  {novaForzaHomeContent.contact.emailLabel}
                </p>
                <p className="mt-3 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                  {novaForzaHomeContent.contact.email}
                </p>
              </div>
            </div>
          </div>

          <Button
            asChild
            className="btn-athletic btn-primary mt-16 h-20 w-full text-lg sm:w-auto sm:px-12"
          >
            <Link href={settings.whatsapp_url ?? "#contacto"}>
              <MessageSquareMore className="mr-4 h-6 w-6" />
              Habla con un asesor
            </Link>
          </Button>
        </div>

        <div className="relative aspect-square w-full overflow-hidden bg-[#111111] shadow-2xl">
          <div className="absolute inset-0 athletic-grid opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(215,25,32,0.2),transparent_70%)]" />
          
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 animate-ping bg-accent/30" />
              <div className="relative flex h-20 w-20 items-center justify-center bg-accent text-white shadow-[0_0_50px_rgba(215,25,32,0.6)]">
                <MapPin className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 left-10 border-l-4 border-accent bg-white p-10 shadow-2xl max-w-[320px]">
            <p className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">Nova Forza</p>
            <p className="mt-4 text-[15px] font-medium leading-relaxed text-muted">
              {novaForzaHomeContent.contact.address}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
