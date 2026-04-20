import { Suspense } from "react";

import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";

function UpdatePasswordFallback() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-none border border-black/8 bg-white p-6 text-sm leading-7 text-[#5f6368]">
        Preparando el formulario seguro para actualizar tu contrasena.
      </div>
    </section>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<UpdatePasswordFallback />}>
      <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <UpdatePasswordForm />
      </section>
    </Suspense>
  );
}
