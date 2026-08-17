import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { PeriodProvider } from "./PeriodContext";

interface MainLayoutProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
}

export function MainLayout({
  children,
  title,
  subtitle,
}: MainLayoutProps) {
  return (
    <PeriodProvider>
      <div className="min-h-screen bg-[var(--color-background)]">
        <Sidebar />

        <div className="ml-[var(--spacing-sidebar)] flex min-h-screen flex-col">
          <Header title={title} subtitle={subtitle} />

          <main className="flex-1 px-[var(--spacing-content)] pb-[var(--spacing-content)]">
            {children ?? (
              <div className="flex h-64 items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
                Conteúdo das páginas será adicionado aqui
              </div>
            )}
          </main>
        </div>
      </div>
    </PeriodProvider>
  );
}
