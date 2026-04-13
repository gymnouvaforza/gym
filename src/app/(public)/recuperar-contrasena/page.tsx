import type { Metadata } from "next";
import { redirect } from "next/navigation";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { getCurrentMemberUser } from "@/lib/auth";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildNoIndexMetadata(
  "Recuperar contraseña",
  "Solicita un enlace para restablecer tu contraseña de acceso.",
);

export default async function ForgotPasswordPage() {
  const user = await getCurrentMemberUser();

  if (user) {
    redirect("/mi-cuenta");
  }

  return (
    <div className="section-shell flex min-h-screen items-center justify-center py-16">
      <ForgotPasswordForm />
    </div>
  );
}
