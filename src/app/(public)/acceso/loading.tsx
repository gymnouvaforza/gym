import { RouteSkeleton } from "@/components/ui/loading-state";

export default function MemberAccessLoading() {
  return (
    <RouteSkeleton
      variant="auth"
      title="Validando acceso"
      description="Estamos preparando el acceso a tu cuenta y comprobando la sesion."
    />
  );
}
