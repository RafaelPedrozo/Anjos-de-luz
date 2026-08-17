import type { LucideIcon } from "lucide-react";
import { MoreVertical, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export type StatIconColor = "success" | "warning" | "purple" | "primary" | "pink";

export interface StatCardConfig {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor: StatIconColor;
  subtext?: string;
  trend?: string;
  trendDirection?: "up" | "down";
}

const iconStyles: Record<StatIconColor, string> = {
  success: "bg-[var(--color-success)]/15 text-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  purple: "bg-[var(--color-purple)]/15 text-[var(--color-purple)]",
  primary: "bg-[var(--color-primary)]/15 text-[var(--color-primary)]",
  pink: "bg-[var(--color-pink)]/15 text-[var(--color-pink)]",
};

interface StatCardsProps {
  cards: StatCardConfig[];
}

export function StatCards({ cards }: StatCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const trendColor =
          card.trendDirection === "up"
            ? "text-[var(--color-success)]"
            : "text-[var(--color-warning)]";

        return (
          <Card key={card.id} className="flex min-h-[168px] flex-col justify-between p-6">
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[10px]",
                  iconStyles[card.iconColor],
                )}
              >
                <Icon size={20} strokeWidth={2} />
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Mais opções"
              >
                <MoreVertical size={16} strokeWidth={1.75} />
              </button>
            </div>

            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">{card.label}</p>
              <p className="mt-1 text-[28px] font-bold leading-tight text-white">{card.value}</p>
              {card.trend && (
                <p className={cn("mt-2 flex items-center gap-1 text-xs font-medium", trendColor)}>
                  {card.trendDirection === "up" ? (
                    <TrendingUp size={14} strokeWidth={2} />
                  ) : (
                    <TrendingDown size={14} strokeWidth={2} />
                  )}
                  {card.trend}
                </p>
              )}
              {card.subtext && (
                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{card.subtext}</p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
