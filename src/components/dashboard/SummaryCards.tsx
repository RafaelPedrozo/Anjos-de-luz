import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  isTrendSummaryCard,
  isCountSummaryCard,
  type SummaryCard,
} from "@/data/dashboard";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

const iconStyles = {
  success: "bg-[var(--color-success)]/15 text-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  purple: "bg-[var(--color-purple)]/15 text-[var(--color-purple)]",
} as const;

function SummaryCardMenu() {
  return (
    <button
      type="button"
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-white"
      aria-label="Mais opções"
    >
      <MoreVertical size={16} strokeWidth={1.75} />
    </button>
  );
}

interface SummaryCardsProps {
  cards: SummaryCard[];
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  if (cards.length === 0) {
    return (
      <div className="grid grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="min-h-[168px] animate-pulse bg-[var(--color-card)]">
            <div className="h-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-5">
      {cards.map((card) => {
        if (card.variant === "primary") {
          return (
            <Card
              key={card.id}
              variant="primary"
              className="relative flex min-h-[168px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#E60023] to-[#CC001F] p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <DollarSign size={20} strokeWidth={2} className="text-white" />
                </div>
                <span className="rounded-[var(--radius-tag)] bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                  {card.badge}
                </span>
              </div>

              <div>
                <p className="text-sm text-white/80">{card.label}</p>
                <p className="mt-1 text-[28px] font-bold leading-tight text-white">
                  {card.value}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs text-white/90">
                  {card.trendDirection === "up" ? (
                    <ArrowUpRight size={14} strokeWidth={2} />
                  ) : (
                    <ArrowDownRight size={14} strokeWidth={2} />
                  )}
                  {card.trend}
                </p>
              </div>
            </Card>
          );
        }

        if (isTrendSummaryCard(card)) {
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
                  {card.iconColor === "success" ? (
                    <TrendingUp size={20} strokeWidth={2} />
                  ) : (
                    <TrendingDown size={20} strokeWidth={2} />
                  )}
                </div>
                <SummaryCardMenu />
              </div>

              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{card.label}</p>
                <p className="mt-1 text-[28px] font-bold leading-tight text-white">
                  {card.value}
                </p>
                <p className={cn("mt-2 flex items-center gap-1 text-xs font-medium", trendColor)}>
                  {card.trendDirection === "up" ? (
                    <TrendingUp size={14} strokeWidth={2} />
                  ) : (
                    <TrendingDown size={14} strokeWidth={2} />
                  )}
                  {card.trend}
                </p>
              </div>
            </Card>
          );
        }

        if (isCountSummaryCard(card)) {
          return (
            <Card key={card.id} className="flex min-h-[168px] flex-col justify-between p-6">
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-[10px]",
                    iconStyles[card.iconColor],
                  )}
                >
                  <Wallet size={20} strokeWidth={2} />
                </div>
                <SummaryCardMenu />
              </div>

              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{card.label}</p>
                <p className="mt-1 text-[28px] font-bold leading-tight text-white">
                  {card.value}
                </p>
                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  {card.subtext}
                </p>
              </div>
            </Card>
          );
        }

        return null;
      })}
    </div>
  );
}
