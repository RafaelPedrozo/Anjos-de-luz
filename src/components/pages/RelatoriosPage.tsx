"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { FilterButton } from "@/components/shared";
import { Button } from "@/components/ui/form";
import { Card } from "@/components/ui";
import type { CashFlowPoint, ExpenseCategory } from "@/data/dashboard";
import { formatCurrency, monthOptions, yearOptions } from "@/data/shared";
import {
  buildRelatorioCsv,
  downloadCsv,
  type RelatorioExportData,
} from "@/lib/export/relatorios";
import { usePeriod } from "@/components/layout";

export function RelatoriosPage() {
  const { month, year, setPeriod } = usePeriod();
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [cashFlowData, setCashFlowData] = useState<CashFlowPoint[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setCashFlowData(data.cashFlowData ?? []);
        setExpenseCategories(data.expenseCategories ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mesLabel = monthOptions.find((m) => m.value === month)?.label ?? month;

  const exportData = useMemo<RelatorioExportData>(() => {
    const current = cashFlowData[cashFlowData.length - 1];
    const entradasMes = current?.entradas ?? 0;
    const saidasMes = current?.saidas ?? 0;

    return {
      geradoEm: new Date().toLocaleString("pt-BR"),
      mesLabel,
      ano: year,
      cashFlow: cashFlowData,
      categorias: expenseCategories,
      entradasMes,
      saidasMes,
      saldoMes: entradasMes - saidasMes,
    };
  }, [cashFlowData, expenseCategories, mesLabel, year]);

  const entradasSaidasComparativo = useMemo(() => {
    return [
      { label: "Doações", value: exportData.entradasMes, color: "#2F453A" },
      { label: "Custos de resgate", value: exportData.saidasMes, color: "#F4A261" },
    ];
  }, [exportData.entradasMes, exportData.saidasMes]);

  const maxComparativo = Math.max(
    ...entradasSaidasComparativo.map((i) => i.value),
    1,
  );

  const maxEvolucao = Math.max(
    ...cashFlowData.flatMap((m) => [m.entradas ?? 0, m.saidas ?? 0]),
    1,
  );

  function handleExportCsv() {
    setExporting(true);
    try {
      const csv = buildRelatorioCsv(exportData);
      downloadCsv(`anjos-de-luz-relatorio-${year}-${month}.csv`, csv);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={month}
          onChange={(e) => setPeriod(e.target.value, year)}
          className="rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-list-item)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none"
        >
          {monthOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--color-card)]">
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setPeriod(month, e.target.value)}
          className="rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-list-item)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none"
        >
          {yearOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--color-card)]">
              {opt.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
          className="rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-list-item)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none"
        />
        <input
          type="date"
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          className="rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-list-item)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none"
        />
        <FilterButton label="Período personalizado" />
        <div className="ml-auto">
          <Button
            variant="secondary"
            onClick={handleExportCsv}
            disabled={loading || exporting}
          >
            <FileSpreadsheet size={16} />
            {exporting ? "Gerando..." : "CSV"}
          </Button>
        </div>
      </div>

      {loading && cashFlowData.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
          Carregando relatórios...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_380px] gap-5">
            <CashFlowChart data={cashFlowData} />
            <ExpensesChart categories={expenseCategories} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Doações x Resgates</h2>
              <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                Comparativo do mês atual
              </p>
              <div className="mt-6 flex flex-col gap-4">
                {entradasSaidasComparativo.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">{item.label}</span>
                      <span className="font-semibold" style={{ color: item.color }}>
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--color-hover)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(item.value / maxComparativo) * 100}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Evolução Mensal</h2>
              <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">Últimos 6 meses</p>
              <div className="mt-6 flex h-[180px] items-end justify-between gap-2">
                {cashFlowData.map((m) => (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="flex w-full items-end justify-center gap-0.5"
                      style={{ height: 140 }}
                    >
                      <div
                        className="w-[40%] rounded-t bg-[var(--color-success)]"
                        style={{
                          height: `${((m.entradas ?? 0) / maxEvolucao) * 100}%`,
                        }}
                      />
                      <div
                        className="w-[40%] rounded-t bg-[var(--color-primary)]"
                        style={{
                          height: `${((m.saidas ?? 0) / maxEvolucao) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-[var(--color-text-secondary)]">{m.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                  Doações
                </span>
                <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                  Custos
                </span>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Doações por tipo</h2>
            <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
              PIX e cartão no mês
            </p>
            {expenseCategories.length === 0 ? (
              <p className="mt-6 text-sm text-[var(--color-text-secondary)]">
                Nenhuma doação neste mês
              </p>
            ) : (
              <ul className="mt-6 flex flex-col gap-3">
                {expenseCategories.map((item, index) => (
                  <li
                    key={item.name}
                    className="flex items-center gap-4 rounded-[10px] bg-[var(--color-list-item)] px-4 py-3.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-hover)] text-xs font-bold text-[var(--color-text-primary)]">
                      {index + 1}
                    </span>
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-text-primary)]">{item.name}</span>
                    <span className="shrink-0 text-sm font-semibold text-[var(--color-text-primary)]">
                      {formatCurrency(item.value)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
