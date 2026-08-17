import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import type { StatCardConfig } from "@/components/shared";
import type { StatusVariant } from "@/components/shared";
import { formatCurrency } from "./shared";

export interface ContaPagar {
  id: string;
  description: string;
  supplier: string;
  value: number;
  dueDate: string;
  status: "pendente" | "pago" | "atrasado";
}

function isSameMonth(date: string, reference = new Date()) {
  const [y, m] = date.split("-").map(Number);
  return y === reference.getFullYear() && m === reference.getMonth() + 1;
}

function todayIso(reference = new Date()) {
  const y = reference.getFullYear();
  const m = String(reference.getMonth() + 1).padStart(2, "0");
  const d = String(reference.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Status efetivo: pendente com vencimento passado conta como atrasado. */
export function resolveContaStatus(
  item: Pick<ContaPagar, "dueDate" | "status">,
  reference = new Date(),
): ContaPagar["status"] {
  if (item.status === "pago") return "pago";
  if (item.dueDate < todayIso(reference)) return "atrasado";
  return item.status === "atrasado" ? "atrasado" : "pendente";
}

export function buildContasStats(items: ContaPagar[]): StatCardConfig[] {
  const now = new Date();
  const monthLabel = now.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const withStatus = items.map((i) => ({
    ...i,
    status: resolveContaStatus(i, now),
  }));

  const doMes = withStatus.filter((i) => isSameMonth(i.dueDate, now));
  const pendentes = withStatus.filter((i) => i.status === "pendente");
  const pagas = withStatus.filter((i) => i.status === "pago");
  const atrasadas = withStatus.filter((i) => i.status === "atrasado");

  const totalAPagar = [...pendentes, ...atrasadas].reduce(
    (sum, i) => sum + i.value,
    0,
  );
  const totalPagas = pagas.reduce((sum, i) => sum + i.value, 0);
  const totalAtrasadas = atrasadas.reduce((sum, i) => sum + i.value, 0);

  return [
    {
      id: "month",
      label: "Contas do Mês",
      value: String(doMes.length),
      icon: Calendar,
      iconColor: "purple",
      subtext: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
    },
    {
      id: "total",
      label: "Total a Pagar",
      value: formatCurrency(totalAPagar),
      icon: CreditCard,
      iconColor: "warning",
      subtext: `${pendentes.length + atrasadas.length} conta(s) em aberto`,
    },
    {
      id: "paid",
      label: "Pagas",
      value: String(pagas.length),
      icon: CheckCircle,
      iconColor: "success",
      subtext: `${formatCurrency(totalPagas)} quitadas`,
    },
    {
      id: "overdue",
      label: "Atrasadas",
      value: String(atrasadas.length),
      icon: AlertCircle,
      iconColor: "primary",
      subtext: `${formatCurrency(totalAtrasadas)} em atraso`,
    },
  ];
}

export function contaStatusVariant(status: ContaPagar["status"]): StatusVariant {
  return status;
}

export function statusToApi(
  status: ContaPagar["status"],
): "PENDENTE" | "PAGO" | "ATRASADO" {
  if (status === "pago") return "PAGO";
  if (status === "atrasado") return "ATRASADO";
  return "PENDENTE";
}
