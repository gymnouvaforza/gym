import RegistrationSuccessCard from "@/components/auth/RegistrationSuccessCard";
import { hasSupabasePublicEnv } from "@/lib/env";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MemberRegisterCompletePageProps {
  searchParams: Promise<{
    confirmed?: string;
    email?: string;
    error?: string;
    pending?: string;
    resent?: string;
  }>;
}

export default async function MemberRegisterCompletePage({
  searchParams,
}: Readonly<MemberRegisterCompletePageProps>) {
  const { confirmed, email, error, pending, resent } = await searchParams;
  const status =
    error ? "error" : confirmed === "1" ? "confirmed" : pending === "1" || email ? "pending" : "pending";

  return (
    <div className="section-shell flex min-h-screen items-center justify-center py-16">
      {hasSupabasePublicEnv() ? (
        <RegistrationSuccessCard email={email} resent={resent === "1"} status={status} />
      ) : (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Configura Supabase antes de habilitar el registro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-[#5f6368]">
            <p>
              Falta configurar <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
