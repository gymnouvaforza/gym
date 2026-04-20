import { Suspense } from "react";

import AuthConfirmClient from "@/components/auth/AuthConfirmClient";

function AuthConfirmFallback() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl rounded-none border border-black/8 bg-white p-6 text-sm leading-7 text-[#5f6368]">
        Procesando enlace seguro. No cierres esta ventana.
      </div>
    </section>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<AuthConfirmFallback />}>
      <AuthConfirmClient />
    </Suspense>
  );
}
