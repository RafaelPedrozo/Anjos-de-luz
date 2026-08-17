import {
  Calendar,
  Clock,
  TrendingDown,
  Wallet,
} from "lucide-react";
import type { StatCardConfig } from "@/components/shared";
import { formatCurrency } from "./shared";

export interface Saida {
  id: string;
  date: string;
  description: string;
  category: string;
  supplier: string;
  paymentMethod: string;
  value: number;
  status: "pago" | "pendente";
}

function todayIso() {
  return new Date().toISOString().split("T")[0]!;
}

function isSameMonth(date: string, reference = new Date()) {
  const [y, m] = date.split("-").map(Number);
  return y === reference.getFullYear() && m === reference.getMonth() + 1;
}

function daysInCurrentMonth(reference = new Date()) {
  return new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate();
}

export function buildSaidasStats(items: Saida[]): StatCardConfig[] {
  const today = todayIso();
  const now = new Date();

  const doMes = items.filter((i) => isSameMonth(i.date, now));
  const pagasMes = doMes.filter((i) => i.status === "pago");
  const totalMes = pagasMes.reduce((sum, i) => sum + i.value, 0);

  const deHoje = items.filter((i) => i.date === today && i.status === "pago");
  const totalHoje = deHoje.reduce((sum, i) => sum + i.value, 0);

  const pendentes = items.filter((i) => i.status === "pendente");
  const totalPendentes = pendentes.reduce((sum, i) => sum + i.value, 0);

  const diasMes = daysInCurrentMonth(now);
  const diaAtual = now.getDate();
  const mediaDiaria = diaAtual > 0 ? totalMes / diaAtual : 0;

  return [
    {
      id: "month",
      label: "Total Gasto no Mês",
      value: formatCurrency(totalMes),
      icon: Wallet,
      iconColor: "warning",
      subtext: `${pagasMes.length} despesa(s) neste mês`,
    },
    {
      id: "today",
      label: "Total Gasto Hoje",
      value: formatCurrency(totalHoje),
      icon: TrendingDown,
      iconColor: "primary",
      subtext: `${deHoje.length} despesa(s) registrada(s)`,
    },
    {
      id: "pending",
      label: "Despesas Pendentes",
      value: String(pendentes.length),
      icon: Clock,
      iconColor: "warning",
      subtext: `${formatCurrency(totalPendentes)} a pagar`,
    },
    {
      id: "avg",
      label: "Média Diária",
      value: formatCurrency(mediaDiaria),
      icon: Calendar,
      iconColor: "purple",
      subtext: `Baseado nos ${diaAtual} dia(s) do mês (${diasMes} no total)`,
    },
  ];
}
