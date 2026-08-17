import Link from "next/link";
import { CreditCard } from "lucide-react";
import type { UpcomingBill } from "@/data/dashboard";
import { Card } from "@/components/ui";

interface UpcomingBillsProps {
  bills: UpcomingBill[];
  count: number;
}

export function UpcomingBills({ bills, count }: UpcomingBillsProps) {
  return (
    <Card className="flex flex-col p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Próximos Vencimentos</h2>
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            {count} conta(s) nos próximos dias
          </p>
        </div>
        <Link
          href="/contas-a-pagar"
          className="text-sm font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)]"
        >
          Ver todas
        </Link>
      </div>

      {bills.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
          Nenhuma conta vencendo nos próximos 7 dias
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {bills.map((bill) => (
            <li
              key={bill.id}
              className="flex items-center gap-3.5 rounded-[10px] bg-[var(--color-list-item)] px-4 py-3.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                <CreditCard size={16} strokeWidth={2} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{bill.name}</p>
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                  {bill.dueIn}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-white">{bill.amount}</p>
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                  {bill.date}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
