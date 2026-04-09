"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PendingButtonLabel } from "@/components/ui/loading-state";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setIsPending(true);

    await fetch("/api/dev-logout", { method: "POST" }).catch(() => null);

    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // Local admin flow does not always have a browser client available.
    }

    router.push("/login");
    router.refresh();
    setIsPending(false);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={isPending}
      className="px-2 sm:px-3"
    >
      {!isPending ? <LogOut className="h-4 w-4" /> : null}
      <span className="hidden sm:inline">
        <PendingButtonLabel pending={isPending} pendingLabel="Cerrando sesion">
          Salir
        </PendingButtonLabel>
      </span>
    </Button>
  );
}
