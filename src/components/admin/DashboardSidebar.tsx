"use client";

import {
  Activity,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Database,
  FileText,
  Globe,
  LayoutGrid,
  Moon,
  QrCode,
  Palette,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sun,
  Tag,
  Users,
  Weight,
  Wrench,
  Zap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import { useBranding } from "@/features/admin/branding/components/BrandingProvider";
import {
  createDefaultModuleStateMap,
  type SystemModuleName,
  type SystemModuleStateMap,
} from "@/lib/module-flags";
import { cn } from "@/lib/utils";

type NavLinkChild = {
  href: string;
  label: string;
  icon: LucideIcon;
  activeMatch?: string | string[];
  module?: SystemModuleName;
  requiresSuperadmin?: boolean;
};

type NavLinkItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: NavLinkChild[];
  tag?: string;
  activeMatch?: string | string[];
  isHeader?: false;
  module?: SystemModuleName;
  requiresSuperadmin?: boolean;
};

type NavHeaderItem = {
  href: "#";
  isHeader: true;
  label: string;
};

type NavItem = NavLinkItem | NavHeaderItem;

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: Activity },
  { isHeader: true, label: "Atencion y ventas", href: "#" },
  {
    href: "/dashboard/leads",
    label: "Consultas",
    icon: Zap,
    module: "leads",
    children: [
      {
        href: "/dashboard/leads#filtros",
        label: "Filtros",
        icon: Database,
        module: "leads",
      },
      {
        href: "/dashboard/leads#bandeja",
        label: "Bandeja",
        icon: ClipboardList,
        module: "leads",
      },
    ],
  },
  {
    href: "/dashboard/miembros",
    label: "Socios",
    icon: ClipboardList,
    children: [
      { href: "/dashboard/miembros#listado", label: "Listado", icon: ClipboardList },
      { href: "/dashboard/miembros/nuevo", label: "Nuevo socio", icon: Users },
    ],
  },
  {
    href: "/dashboard/membresias",
    label: "Membresias",
    icon: QrCode,
    children: [
      { href: "/dashboard/membresias/pedidos", label: "Solicitudes", icon: ClipboardList },
      { href: "/dashboard/membresias/recepcion", label: "Escaneo QR", icon: QrCode },
    ],
  },
  {
    href: "/dashboard/tienda",
    label: "Tienda",
    icon: ShoppingBag,
    module: "tienda",
    children: [
      { href: "/dashboard/tienda", label: "Resumen", icon: ShoppingBag, module: "tienda" },
      {
        href: "/dashboard/tienda/productos",
        label: "Productos",
        icon: Tag,
        module: "tienda",
      },
      {
        href: "/dashboard/tienda/categorias",
        label: "Categorias",
        icon: LayoutGrid,
        module: "tienda",
      },
      {
        href: "/dashboard/tienda/pedidos",
        label: "Pedidos",
        icon: QrCode,
        module: "tienda",
      },
    ],
  },
  { isHeader: true, label: "App y entreno", href: "#" },
  {
    href: "/dashboard/mobile",
    label: "App movil",
    icon: Smartphone,
    module: "mobile",
    children: [
      {
        href: "/dashboard/mobile?segment=superadmin",
        label: "Superadmins",
        icon: ShieldCheck,
        module: "mobile",
      },
      {
        href: "/dashboard/mobile?segment=admin",
        label: "Admins",
        icon: ShieldCheck,
        module: "mobile",
      },
      {
        href: "/dashboard/mobile?segment=trainer",
        label: "Entrenadores",
        icon: Users,
        module: "mobile",
      },
      {
        href: "/dashboard/mobile?segment=user",
        label: "Usuarios",
        icon: Database,
        module: "mobile",
      },
      { href: "/dashboard/rutinas", label: "Rutinas", icon: Weight, module: "rutinas" },
    ],
  },
  { isHeader: true, label: "Web y contenido", href: "#" },
  {
    href: "/dashboard/web",
    label: "Web",
    icon: Globe,
    children: [
      { href: "/dashboard/web#secciones", label: "Secciones", icon: Globe },
      { href: "/dashboard/web/branding", label: "Identidad (Logo)", icon: Sparkles },
      { href: "/dashboard/settings/theme", label: "Estilo (Colores)", icon: Palette },
      { href: "/dashboard/web#exploracion", label: "Exploracion", icon: LayoutGrid },
    ],
  },
  {
    href: "/dashboard/marketing",
    label: "Campanas",
    icon: CalendarClock,
    module: "marketing",
    activeMatch: ["/dashboard/marketing", "/dashboard/marketing/planes"],
    children: [
      {
        href: "/dashboard/marketing",
        label: "Moderacion resenas",
        icon: ClipboardList,
        activeMatch: "/dashboard/marketing",
        module: "marketing",
      },
      {
        href: "/dashboard/marketing/planes",
        label: "Planes",
        icon: Tag,
        module: "marketing",
      },
    ],
  },
  {
    href: "/dashboard/cms",
    label: "Textos y legal",
    icon: FileText,
    module: "cms",
    children: [
      { href: "/dashboard/cms#documentos", label: "Documentos", icon: FileText, module: "cms" },
    ],
  },
  { isHeader: true, label: "Ajustes", href: "#" },
  {
    href: "/dashboard/info",
    label: "Datos del gym",
    icon: Users,
    activeMatch: ["/dashboard/info", "/dashboard/info/horarios", "/dashboard/info/entrenadores"],
    children: [
      { href: "/dashboard/info", label: "General", icon: Users, activeMatch: "/dashboard/info" },
      { href: "/dashboard/info/horarios", label: "Horarios", icon: CalendarClock },
      { href: "/dashboard/info/entrenadores", label: "Entrenadores", icon: Users },
    ],
  },
  {
    href: "/dashboard/advanced",
    label: "Ajustes avanzados",
    icon: Settings2,
    children: [
      { href: "/dashboard/advanced#configuracion", label: "Configuracion", icon: Settings2 },
    ],
  },
  {
    href: "/dashboard/developer",
    label: "Developer",
    icon: Wrench,
    requiresSuperadmin: true,
  },
];

function parseNavigationTarget(value: string) {
  const [pathWithQuery, hash] = value.split("#");
  const [path, query] = pathWithQuery.split("?");

  return {
    path: path || value,
    query: query ? `?${query}` : "",
    hash: hash ? `#${hash}` : "",
  };
}

function isItemActive(
  pathname: string,
  currentQuery: string,
  currentHash: string,
  href: string,
  activeMatch?: string | string[],
) {
  const candidates = Array.isArray(activeMatch)
    ? activeMatch
    : activeMatch
      ? [activeMatch]
      : [href];

  const useExact = Boolean(activeMatch);

  return candidates.some((candidate) => {
    const normalized = parseNavigationTarget(candidate);

    if (normalized.query && normalized.hash) {
      return (
        pathname === normalized.path &&
        currentQuery === normalized.query &&
        currentHash === normalized.hash
      );
    }

    if (normalized.query) {
      return pathname === normalized.path && currentQuery === normalized.query;
    }

    if (normalized.hash) {
      return pathname === normalized.path && currentHash === normalized.hash;
    }

    if (useExact || normalized.path === "/dashboard") {
      return pathname === normalized.path;
    }

    return pathname.startsWith(normalized.path);
  });
}

function canViewModule(
  module: SystemModuleName | undefined,
  activeModules: SystemModuleStateMap,
) {
  return !module || activeModules[module];
}

function canViewEntry(
  item: Pick<NavLinkItem | NavLinkChild, "module" | "requiresSuperadmin">,
  activeModules: SystemModuleStateMap,
  isSuperadmin: boolean,
) {
  return (!item.requiresSuperadmin || isSuperadmin) &&
    canViewModule(item.module, activeModules);
}

function getVisibleNavigationItems(
  activeModules: SystemModuleStateMap,
  isSuperadmin: boolean,
) {
  const visibleItems: NavItem[] = [];
  let pendingHeader: NavHeaderItem | null = null;

  for (const item of NAV_ITEMS) {
    if (item.isHeader) {
      pendingHeader = item;
      continue;
    }

    if (!canViewEntry(item, activeModules, isSuperadmin)) {
      continue;
    }

    const visibleChildren = item.children?.filter((child) =>
      canViewEntry(child, activeModules, isSuperadmin),
    );

    if (pendingHeader) {
      visibleItems.push(pendingHeader);
      pendingHeader = null;
    }

    visibleItems.push({
      ...item,
      children: visibleChildren,
    });
  }

  return visibleItems;
}

const THEME_STORAGE_KEY = "nuova-forza-theme";
const themeListeners = new Set<() => void>();

function getThemeSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark";
}

function getThemeServerSnapshot() {
  return false;
}

function getHashSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.hash;
}

function getHashServerSnapshot() {
  return "";
}

function subscribeToHashChange(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("hashchange", onStoreChange);

  return () => {
    window.removeEventListener("hashchange", onStoreChange);
  };
}

function notifyThemeListeners() {
  themeListeners.forEach((listener) => listener());
}

function subscribeToThemePreference(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  themeListeners.add(onStoreChange);

  const handleChange = (event: StorageEvent) => {
    if (event.key === null || event.key === THEME_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleChange);

  return () => {
    themeListeners.delete(onStoreChange);
    window.removeEventListener("storage", handleChange);
  };
}

interface DashboardSidebarProps {
  activeModules?: SystemModuleStateMap;
  isSuperadmin?: boolean;
}

export default function DashboardSidebar({
  activeModules = createDefaultModuleStateMap(),
  isSuperadmin = false,
}: Readonly<DashboardSidebarProps>) {
  const { gymName, logoUrl, primaryColor } = useBranding();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const currentHash = useSyncExternalStore(
    subscribeToHashChange,
    getHashSnapshot,
    getHashServerSnapshot,
  );
  const isDarkMode = useSyncExternalStore(
    subscribeToThemePreference,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    window.localStorage.setItem(THEME_STORAGE_KEY, newMode ? "dark" : "light");
    notifyThemeListeners();
  };

  const visibleLinks = getVisibleNavigationItems(activeModules, isSuperadmin);

  return (
    <div className="flex h-full flex-col bg-[#111111] text-white">
      <div className="p-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 rounded-sm bg-white p-1.5">
            <Image
              src={logoUrl ?? "/images/logo/logo-trans.webp"}
              alt={`${gymName} Logo`}
              fill
              className="object-contain"
              sizes="40px"
            />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold uppercase tracking-tight leading-none">
              {gymName}
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
              Backoffice Gym
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto hide-scrollbar px-3 pb-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <nav className="space-y-[2px]">
          {visibleLinks.map((link, idx) => {
            if (link.isHeader) {
              return (
                <p
                  key={`${link.label}-${idx}`}
                  className="mb-2 mt-6 px-3 text-xs font-bold uppercase tracking-wider text-white/40"
                >
                  {link.label}
                </p>
              );
            }

            const Icon = link.icon;
            const hasChildren = Boolean(link.children?.length);
            const isSelfActive = isItemActive(
              pathname,
              currentQuery,
              currentHash,
              link.href,
              link.activeMatch,
            );
            const isChildActive = link.children?.some((child) =>
              isItemActive(pathname, currentQuery, currentHash, child.href, child.activeMatch),
            );
            const isActive = isSelfActive || isChildActive;
            const showSubmenu = isActive;

            return (
              <div key={link.href + idx} className="space-y-[2px]">
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2.5 rounded-md transition-all",
                    isActive
                      ? "bg-white/10 text-white font-medium"
                      : "bg-transparent text-white/60 hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive ? "" : "group-hover:text-white",
                      )}
                      style={isActive ? { color: primaryColor } : {}}
                    />
                    <span className="text-sm font-medium tracking-wide">{link.label}</span>
                  </div>
                  {link.tag && !isActive ? (
                    <div className="flex items-center gap-1.5 rounded-sm bg-white/10 px-2 py-0.5">
                      <div 
                        className="h-1.5 w-1.5 rounded-full animate-pulse" 
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span className="text-[10px] font-bold text-white tracking-tight uppercase">
                        {link.tag}
                      </span>
                    </div>
                  ) : null}
                  {hasChildren ? (
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 transition-transform text-white/40 group-hover:text-white/80",
                        showSubmenu && "rotate-90 text-white/80",
                      )}
                    />
                  ) : null}
                </Link>

                {hasChildren && showSubmenu ? (
                  <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    {link.children?.map((child) => {
                      const isSubActive = isItemActive(
                        pathname,
                        currentQuery,
                        currentHash,
                        child.href,
                        child.activeMatch,
                      );
                      const SubIcon = child.icon;

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          aria-current={isSubActive ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium tracking-wide transition-all",
                            isSubActive
                              ? "bg-white/10 text-white font-semibold"
                              : "text-white/50 hover:bg-white/[0.02] hover:text-white",
                          )}
                        >
                          <SubIcon
                            className="h-3.5 w-3.5"
                            style={isSubActive ? { color: primaryColor } : { color: "rgba(255,255,255,0.3)" }}
                          />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 p-4 bg-black/20">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-md bg-white/5 border border-white/10 px-4 py-2.5 transition-all hover:bg-white/10 group"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <>
                <Sun className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium tracking-wide text-white">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-white/60 group-hover:text-white" />
                <span className="text-xs font-medium tracking-wide text-white">Dark Mode</span>
              </>
            )}
          </div>
          <div className="h-4 w-px bg-white/10" />
          <LayoutGrid className="h-3.5 w-3.5 text-white/30" />
        </button>

        <div className="mt-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
              System Online
            </p>
          </div>
          <p className="text-[10px] font-medium text-white/30">V2.0.4</p>
        </div>
      </div>
    </div>
  );
}
