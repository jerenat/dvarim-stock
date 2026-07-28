import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  Boxes,
  ArrowLeftRight,
  ShoppingCart,
  History,
  BarChart3,
  Settings,
  Warehouse,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

import Logo from "@/assets/logo.svg";

import { APP_NAME } from "@/utils/constants";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/productos", label: "Productos", icon: Package },
  { to: "/categorias", label: "Categorías", icon: Tags },
  { to: "/usuarios", label: "Usuarios", icon: Users },
  { to: "/stock", label: "Stock", icon: Boxes },
  { to: "/transferencias", label: "Transferencias", icon: ArrowLeftRight },
  { to: "/ventas", label: "Ventas", icon: ShoppingCart },
  { to: "/movimientos", label: "Movimientos", icon: History },
  { to: "/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar({ open, onClose }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200",
          "lg:translate-x-0 lg:static lg:z-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <img src={Logo} alt="DVARIM" className="h-8 w-8" />
            </div>
            <span className="text-base tracking-tight">{APP_NAME.title}</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden rounded-md p-1.5 hover:bg-sidebar-accent"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active =
              pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
