import { Mail, MapPin, Smartphone } from "lucide-react";
import Link from "next/link";

import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";
import type { SiteSettings } from "@/lib/supabase/database.types";

import LeadForm from "./LeadForm";

interface ContactSectionProps {
  settings: SiteSettings;
}

export default function ContactSection({ settings }: Readonly<ContactSectionProps>) {
  const address = settings.address ?? novaForzaHomeContent.contact.address;
  const phone = settings.contact_phone ?? novaForzaHomeContent.contact.whatsappDisplay;
  const phoneHref = phone.replace(/[^\d+]/g, "");
  const email = settings.contact_email ?? novaForzaHomeContent.contact.email;

  return (
    <section 
      id="contacto" 
      data-component="contact-section"
      className="section-anchor relative overflow-hidden bg-background py-24 md:py-32"
    >
      <div className="section-shell grid gap-16 lg:grid-cols-2">
        <div className="max-w-xl">
          <p className="section-kicker">Comienza hoy</p>
          <h2 className="section-title text-3xl sm:text-5xl lg:text-7xl italic">
            Ubicacion &{" "}
            <span className="text-accent underline decoration-accent/20 underline-offset-8">
              Contacto
            </span>
          </h2>

          <div className="mt-16 space-y-12">
            <div className="flex items-start gap-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-secondary text-accent rounded-[var(--radius-base)]">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">
                  Direccion
                </p>
                <p className="mt-3 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                  {address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-secondary text-accent rounded-[var(--radius-base)]">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">
                  {novaForzaHomeContent.contact.whatsappLabel}
                </p>
                <Link
                  href={`tel:${phoneHref}`}
                  className="mt-3 inline-block font-display text-2xl font-bold uppercase tracking-tight text-foreground transition-colors hover:text-accent"
                >
                  {phone}
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-secondary text-accent rounded-[var(--radius-base)]">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">
                  {novaForzaHomeContent.contact.emailLabel}
                </p>
                <Link
                  href={`mailto:${email}`}
                  className="mt-3 inline-block font-display text-2xl font-bold uppercase tracking-tight text-foreground transition-colors hover:text-accent"
                >
                  {email}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 -top-8 -z-10 h-64 w-64 bg-accent/5 blur-3xl" />
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
