import {
  Zap,
  UserPlus,
  Users,
  Dumbbell,
  Clock,
  CreditCard,
  Package,
  ShoppingBag,
  Globe,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";

const QUICK_ACTIONS = [
  {
    title: "Revisar leads",
    href: "/dashboard/leads",
    icon: Zap,
    color: "bg-amber-500",
  },
  {
    title: "Crear miembro",
    href: "/dashboard/miembros/nuevo",
    icon: UserPlus,
    color: "bg-blue-600",
  },
  {
    title: "Miembros activos",
    href: "/dashboard/miembros",
    icon: Users,
    color: "bg-indigo-600",
  },
  {
    title: "Gestionar rutinas",
    href: "/dashboard/rutinas",
    icon: Dumbbell,
    color: "bg-emerald-600",
  },
  {
    title: "Editar horarios",
    href: "/dashboard/info/horarios",
    icon: Clock,
    color: "bg-slate-600",
  },
  {
    title: "Editar planes",
    href: "/dashboard/membresias",
    icon: CreditCard,
    color: "bg-purple-600",
  },
  {
    title: "Gestionar productos",
    href: "/dashboard/tienda/productos",
    icon: Package,
    color: "bg-orange-600",
  },
  {
    title: "Ver pedidos",
    href: "/dashboard/tienda/pedidos",
    icon: ShoppingBag,
    color: "bg-pink-600",
  },
  {
    title: "Editar web",
    href: "/dashboard/cms",
    icon: Globe,
    color: "bg-cyan-600",
  },
];

export default function DashboardQuickAccess() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center bg-[#111111] rounded-md text-white shadow-sm">
          <LayoutGrid className="h-5 w-5" />
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-[#111111] uppercase">
          Accesos rápidos
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative flex flex-col items-center justify-center gap-3 p-6 bg-white border border-black/5 rounded-xl shadow-sm transition-all hover:shadow-md hover:border-black/10 hover:-translate-y-1"
          >
            <div className={`flex h-12 w-12 items-center justify-center ${action.color} rounded-lg text-white shadow-inner transition-transform group-hover:scale-110`}>
              <action.icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#111111] text-center">
              {action.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
