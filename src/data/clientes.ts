import { UserCheck, UserPlus, Users, UserX } from "lucide-react";
import type { StatCardConfig } from "@/components/shared";

export interface Cliente {
  id: string;
  name: string;
  phone: string;
  email: string;
  document: string;
  address: string;
  status: "ativo" | "inativo";
  createdAt: string;
}

function isSameMonth(date: string, reference = new Date()) {
  const [y, m] = date.split("-").map(Number);
  return y === reference.getFullYear() && m === reference.getMonth() + 1;
}

export function buildClientesStats(items: Cliente[]): StatCardConfig[] {
  const now = new Date();
  const total = items.length;
  const ativos = items.filter((i) => i.status === "ativo");
  const inativos = items.filter((i) => i.status === "inativo");
  const novosMes = items.filter((i) => isSameMonth(i.createdAt, now));

  const pctAtivos = total > 0 ? Math.round((ativos.length / total) * 100) : 0;
  const pctInativos = total > 0 ? Math.round((inativos.length / total) * 100) : 0;

  return [
    {
      id: "total",
      label: "Total Clientes",
      value: String(total),
      icon: Users,
      iconColor: "purple",
      subtext: "Cadastrados no sistema",
    },
    {
      id: "new",
      label: "Novos Clientes",
      value: String(novosMes.length),
      icon: UserPlus,
      iconColor: "success",
      subtext: "Neste mês",
    },
    {
      id: "active",
      label: "Clientes Ativos",
      value: String(ativos.length),
      icon: UserCheck,
      iconColor: "success",
      subtext: `${pctAtivos}% do total`,
    },
    {
      id: "inactive",
      label: "Clientes Inativos",
      value: String(inativos.length),
      icon: UserX,
      iconColor: "primary",
      subtext: `${pctInativos}% do total`,
    },
  ];
}

export function statusToApi(status: Cliente["status"]): "ATIVO" | "INATIVO" {
  return status === "inativo" ? "INATIVO" : "ATIVO";
}
