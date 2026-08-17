import {
  Calendar,
  Clock,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { StatCardConfig } from "@/components/shared";
import { formatCurrency } from "./shared";

export interface Entrada {
  id: string;
  date: string;
  description: string;
  category: string;
  client: string;
  paymentMethod: string;
  value: number;
  status: "recebido" | "pendente";
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

export function buildEntradasStats(items: Entrada[]): StatCardConfig[] {
  const today = todayIso();
  const now = new Date();

  const doMes = items.filter((i) => isSameMonth(i.date, now));
  const recebidasMes = doMes.filter((i) => i.status === "recebido");
  const totalMes = recebidasMes.reduce((sum, i) => sum + i.value, 0);

  const deHoje = items.filter((i) => i.date === today && i.status === "recebido");
  const totalHoje = deHoje.reduce((sum, i) => sum + i.value, 0);

  const pendentes = items.filter((i) => i.status === "pendente");
  const totalPendentes = pendentes.reduce((sum, i) => sum + i.value, 0);

  const diasMes = daysInCurrentMonth(now);
  const diaAtual = now.getDate();
  const mediaDiaria = diaAtual > 0 ? totalMes / diaAtual : 0;

  return [
    {
      id: "month",
      label: "Total Recebido no Mês",
      value: formatCurrency(totalMes),
      icon: Wallet,
      iconColor: "success",
      subtext: `${recebidasMes.length} entrada(s) neste mês`,
    },
    {
      id: "today",
      label: "Total Recebido Hoje",
      value: formatCurrency(totalHoje),
      icon: TrendingUp,
      iconColor: "success",
      subtext: `${deHoje.length} entrada(s) registrada(s)`,
    },
    {
      id: "pending",
      label: "Entradas Pendentes",
      value: String(pendentes.length),
      icon: Clock,
      iconColor: "warning",
      subtext: `${formatCurrency(totalPendentes)} a receber`,
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
