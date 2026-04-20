"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PendingButtonLabel } from "@/components/ui/loading-state";
import { clearFirebaseBrowserSession } from "@/lib/firebase/browser-session";
import { getFirebaseBrowserAuth } from "@/lib/firebase/client";

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
      const auth = await getFirebaseBrowserAuth();
      await auth?.signOut();
    } finally {
      await clearFirebaseBrowserSession();
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
