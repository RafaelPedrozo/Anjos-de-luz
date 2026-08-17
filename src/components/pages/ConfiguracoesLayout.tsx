"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

const sections = [
  { id: "empresa", label: "Dados da empresa", href: "/configuracoes" },
  { id: "usuarios", label: "Usuários", href: "/configuracoes/usuarios", adminOnly: true },
  { id: "seguranca", label: "Segurança", href: "/configuracoes/seguranca" },
  { id: "aparencia", label: "Aparência", href: "/configuracoes/aparencia" },
  { id: "notificacoes", label: "Notificações", href: "/configuracoes/notificacoes" },
];

interface ConfiguracoesLayoutProps {
  children: React.ReactNode;
}

export function ConfiguracoesLayout({ children }: ConfiguracoesLayoutProps) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const visibleSections = sections.filter((s) => !s.adminOnly || isAdmin);

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-wrap gap-2 p-3">
        {visibleSections.map((section) => {
          const isActive = pathname === section.href;
          return (
            <Link
              key={section.id}
              href={section.href}
              className={cn(
                "rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white",
              )}
            >
              {section.label}
            </Link>
          );
        })}
      </Card>
      {children}
    </div>
  );
}
