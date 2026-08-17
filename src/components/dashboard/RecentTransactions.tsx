import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { RecentTransaction } from "@/data/dashboard";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
  count: number;
}

export function RecentTransactions({ transactions, count }: RecentTransactionsProps) {
  return (
    <Card className="flex flex-col p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Últimas Movimentações</h2>
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            {count} transação(ões) recente(s)
          </p>
        </div>
        <Link
          href="/entradas"
          className="text-sm font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)]"
        >
          Ver todas
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
          Nenhuma movimentação registrada
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {transactions.map((tx) => {
            const isIncome = tx.type === "income";

            return (
              <li
                key={tx.id}
                className="flex items-center gap-3.5 rounded-[10px] bg-[var(--color-list-item)] px-4 py-3.5"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]",
                    isIncome
                      ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                      : "bg-[var(--color-primary)]/15 text-[var(--color-primary)]",
                  )}
                >
                  {isIncome ? (
                    <ArrowUpRight size={16} strokeWidth={2} />
                  ) : (
                    <ArrowDownLeft size={16} strokeWidth={2} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{tx.description}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    {tx.category}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isIncome ? "text-[var(--color-success)]" : "text-[var(--color-primary)]",
                    )}
                  >
                    {tx.amount}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    {tx.date}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
