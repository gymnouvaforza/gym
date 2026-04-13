import type { Metadata } from "next";
import { redirect } from "next/navigation";

import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import { getCurrentMemberUser } from "@/lib/auth";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildNoIndexMetadata(
  "Nueva contraseña",
  "Elige una nueva contraseña para tu cuenta.",
);

export default async function UpdatePasswordPage() {
  const user = await getCurrentMemberUser();

  if (!user) {
    redirect("/acceso");
  }

  return (
    <div className="section-shell flex min-h-screen items-center justify-center py-16">
      <UpdatePasswordForm />
    </div>
  );
}
