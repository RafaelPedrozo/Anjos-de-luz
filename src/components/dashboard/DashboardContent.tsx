"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardData } from "@/data/dashboard";
import { SummaryCards } from "./SummaryCards";
import { CashFlowChart } from "./CashFlowChart";
import { ExpensesChart } from "./ExpensesChart";
import { UpcomingBills } from "./UpcomingBills";
import { RecentTransactions } from "./RecentTransactions";

const emptyData: DashboardData = {
  summaryCards: [],
  cashFlowData: [],
  expenseCategories: [],
  upcomingBills: [],
  upcomingCount: 0,
  recentTransactions: [],
  recentCount: 0,
};

export function DashboardContent() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        setError("Não foi possível carregar o dashboard");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      setError("Erro de conexão ao carregar o dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center">
        <p className="text-sm text-[var(--color-primary)]">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 text-sm font-medium text-[var(--color-text-primary)] underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {loading && data.summaryCards.length === 0 ? (
        <SummaryCards cards={[]} />
      ) : (
        <SummaryCards cards={data.summaryCards} />
      )}

      <div className="grid grid-cols-[1fr_380px] gap-5">
        <CashFlowChart data={data.cashFlowData} />
        <ExpensesChart categories={data.expenseCategories} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <UpcomingBills bills={data.upcomingBills} count={data.upcomingCount} />
        <RecentTransactions
          transactions={data.recentTransactions}
          count={data.recentCount}
        />
      </div>
    </div>
  );
}
