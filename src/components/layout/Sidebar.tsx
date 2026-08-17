"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  DollarSign,
  LogOut,
} from "lucide-react";
import { navigationItems } from "@/lib/design-system";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import type { LucideIcon } from "lucide-react";
import type { NavItemId } from "@/lib/design-system";
import { useState } from "react";

const navIcons: Record<NavItemId, LucideIcon> = {
  dashboard: LayoutDashboard,
  entradas: ArrowDownLeft,
  saidas: ArrowUpRight,
  "contas-a-pagar": CreditCard,
  relatorios: BarChart3,
  clientes: Users,
  configuracoes: Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex w-[var(--spacing-sidebar)] flex-col bg-[var(--color-surface)]"
      aria-label="Navegação principal"
    >
      <div className="flex items-center gap-3 px-6 pt-8 pb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]">
          <DollarSign size={20} strokeWidth={2.5} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-bold leading-tight text-white">ViaConeta</p>
          <p className="truncate text-xs text-[var(--color-text-muted)]">Gestão Financeira</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-1">
          {navigationItems.map((item) => {
            const Icon = navIcons[item.id];
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[var(--color-sidebar-active)] pl-7 pr-4 text-white shadow-[var(--shadow-sidebar-active)] rounded-r-[var(--radius-sidebar-item)]"
                      : "rounded-[var(--radius-sidebar-item)] px-4 text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.75} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative border-t border-[var(--color-border)] p-4">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex w-full items-center gap-3 rounded-[var(--radius-button)] px-2 py-2 transition-colors duration-150 hover:bg-white/5"
          aria-label="Menu do usuário"
        >
          <Avatar initials={user?.initials ?? "??"} size="md" />
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium text-white">{user?.nome ?? "..."}</p>
            <p className="truncate text-xs text-[var(--color-text-secondary)]">
              {user?.perfilLabel ?? ""}
            </p>
          </div>
          <ChevronDown size={16} className="shrink-0 text-[var(--color-text-secondary)]" />
        </button>

        {menuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-[var(--shadow-card)]">
            <button
              type="button"
              onClick={() => logout()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
