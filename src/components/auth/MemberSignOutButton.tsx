"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PendingButtonLabel } from "@/components/ui/loading-state";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function MemberSignOutButton() {
  return <MemberSignOutButtonWithRedirect />;
}

interface MemberSignOutButtonWithRedirectProps {
  redirectTo?: string;
}

export function MemberSignOutButtonWithRedirect({
  redirectTo = "/",
}: Readonly<MemberSignOutButtonWithRedirectProps>) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setIsPending(true);

    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      router.push(redirectTo);
      router.refresh();
      setIsPending(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleSignOut} disabled={isPending}>
      {!isPending ? <LogOut className="h-4 w-4" /> : null}
      <PendingButtonLabel pending={isPending} pendingLabel="Cerrando sesion">
        Cerrar sesion
      </PendingButtonLabel>
    </Button>
  );
}
