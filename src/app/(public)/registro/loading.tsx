import { RouteSkeleton } from "@/components/ui/loading-state";

export default function MemberRegisterLoading() {
  return (
    <RouteSkeleton
      variant="auth"
      title="Preparando registro"
      description="Estamos cargando el formulario para crear tu acceso privado."
    />
  );
}
