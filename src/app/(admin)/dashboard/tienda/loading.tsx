import { RouteSkeleton } from "@/components/ui/loading-state";

export default function DashboardStoreLoading() {
  return (
    <RouteSkeleton
      variant="admin"
      title="Preparando tienda"
      description="Estamos cargando el catalogo operativo y la navegacion de tienda."
    />
  );
}
