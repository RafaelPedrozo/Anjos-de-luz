import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";
import { formatCurrency, formatDate } from "@/data/shared";

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const CATEGORY_COLORS: Record<string, string> = {
  Fornecedores: "#E60023",
  Salários: "#F97316",
  Aluguel: "#8B5CF6",
  Marketing: "#EC4899",
  Outros: "#6B7280",
};

/** Data calendário YYYY-MM-DD a partir de Date armazenada como UTC date-only. */
function dateKeyUtc(d: Date) {
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function todayKeyLocal(now = new Date()) {
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDaysKey(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return dateKeyUtc(new Date(Date.UTC(y!, m! - 1, d! + days)));
}

function daysBetweenKeys(from: string, to: string) {
  const [y1, m1, d1] = from.split("-").map(Number);
  const [y2, m2, d2] = to.split("-").map(Number);
  const a = Date.UTC(y1!, m1! - 1, d1!);
  const b = Date.UTC(y2!, m2! - 1, d2!);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function startOfTodayUtc(now = new Date()) {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function monthRange(year: number, monthIndex: number) {
  return {
    start: new Date(year, monthIndex, 1, 0, 0, 0, 0),
    end: new Date(year, monthIndex + 1, 0, 23, 59, 59, 999),
  };
}

function toNumber(value: { toNumber: () => number } | number) {
  return typeof value === "number" ? value : value.toNumber();
}

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return 0;
    return 100;
  }
  return ((current - previous) / previous) * 100;
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export async function GET() {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  try {
    const empresaId = auth.session.empresaId;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    const currentRange = monthRange(currentYear, currentMonth);
    const prevRange = monthRange(prevYear, prevMonth);
    const todayKey = todayKeyLocal(now);
    const in7DaysKey = addDaysKey(todayKey, 7);

    // Sincroniza pendentes vencidas → ATRASADO
    await prisma.contaPagar.updateMany({
      where: {
        empresaId,
        status: "PENDENTE",
        vencimento: { lt: startOfTodayUtc(now) },
      },
      data: { status: "ATRASADO" },
    });

    const [entradas, saidas, contas] = await Promise.all([
      prisma.entrada.findMany({ where: { empresaId } }),
      prisma.saida.findMany({ where: { empresaId } }),
      prisma.contaPagar.findMany({
        where: { empresaId, status: { in: ["PENDENTE", "ATRASADO"] } },
        orderBy: { vencimento: "asc" },
      }),
    ]);

    const entradasMes = entradas.filter(
      (e) => e.data >= currentRange.start && e.data <= currentRange.end && e.status === "RECEBIDO",
    );
    const saidasMes = saidas.filter(
      (s) => s.data >= currentRange.start && s.data <= currentRange.end && s.status === "PAGO",
    );
    const entradasPrev = entradas.filter(
      (e) => e.data >= prevRange.start && e.data <= prevRange.end && e.status === "RECEBIDO",
    );
    const saidasPrev = saidas.filter(
      (s) => s.data >= prevRange.start && s.data <= prevRange.end && s.status === "PAGO",
    );

    const totalEntradasMes = entradasMes.reduce((sum, e) => sum + toNumber(e.valor), 0);
    const totalSaidasMes = saidasMes.reduce((sum, s) => sum + toNumber(s.valor), 0);
    const totalEntradasPrev = entradasPrev.reduce((sum, e) => sum + toNumber(e.valor), 0);
    const totalSaidasPrev = saidasPrev.reduce((sum, s) => sum + toNumber(s.valor), 0);

    const saldoAtual = totalEntradasMes - totalSaidasMes;
    const saldoPrev = totalEntradasPrev - totalSaidasPrev;
    const saldoTrend = percentChange(saldoAtual, saldoPrev);
    const entradasTrend = percentChange(totalEntradasMes, totalEntradasPrev);
    const saidasTrend = percentChange(totalSaidasMes, totalSaidasPrev);

    // Vencendo hoje até +7 dias (comparação por data calendário, sem fuso)
    const contasVencendo = contas.filter((c) => {
      const key = dateKeyUtc(c.vencimento);
      return key >= todayKey && key <= in7DaysKey;
    });

    const summaryCards = [
      {
        id: "saldo",
        label: "Saldo Atual",
        value: formatCurrency(saldoAtual),
        trend: `${formatPercent(saldoTrend)} vs mês anterior`,
        trendDirection: saldoTrend >= 0 ? "up" : "down",
        badge: MONTH_LABELS[currentMonth],
        variant: "primary",
      },
      {
        id: "entradas",
        label: "Entradas",
        value: formatCurrency(totalEntradasMes),
        trend: formatPercent(entradasTrend),
        trendDirection: entradasTrend >= 0 ? "up" : "down",
        iconColor: "success",
        variant: "default",
      },
      {
        id: "saidas",
        label: "Saídas",
        value: formatCurrency(totalSaidasMes),
        trend: formatPercent(saidasTrend),
        trendDirection: saidasTrend <= 0 ? "up" : "down",
        iconColor: "warning",
        variant: "default",
      },
      {
        id: "contas",
        label: "Contas Vencendo",
        value: String(contasVencendo.length),
        subtext: "Próximos 7 dias",
        iconColor: "purple",
        variant: "default",
      },
    ];

    // Fluxo de caixa últimos 6 meses (entradas - saídas)
    const cashFlowData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const range = monthRange(d.getFullYear(), d.getMonth());
      const ent = entradas
        .filter((e) => e.data >= range.start && e.data <= range.end && e.status === "RECEBIDO")
        .reduce((sum, e) => sum + toNumber(e.valor), 0);
      const sai = saidas
        .filter((s) => s.data >= range.start && s.data <= range.end && s.status === "PAGO")
        .reduce((sum, s) => sum + toNumber(s.valor), 0);
      cashFlowData.push({
        month: MONTH_LABELS[d.getMonth()]!,
        value: Math.max(0, ent - sai),
        entradas: ent,
        saidas: sai,
      });
    }

    // Despesas por categoria (mês atual)
    const byCategory = new Map<string, number>();
    for (const s of saidasMes) {
      const key = s.categoria || "Outros";
      byCategory.set(key, (byCategory.get(key) ?? 0) + toNumber(s.valor));
    }
    const expenseCategories = Array.from(byCategory.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] ?? "#6B7280",
      }))
      .sort((a, b) => b.value - a.value);

    // Próximos vencimentos
    const upcomingBills = contasVencendo.slice(0, 5).map((c) => {
      const key = dateKeyUtc(c.vencimento);
      const days = daysBetweenKeys(todayKey, key);
      const dueIn =
        days === 0 ? "Vence hoje" : days === 1 ? "Vence em 1 dia" : `Vence em ${days} dias`;
      return {
        id: c.id,
        name: c.descricao,
        dueIn,
        amount: formatCurrency(toNumber(c.valor)),
        date: formatDate(key),
      };
    });

    // Últimas movimentações (entradas + saídas)
    const recentTransactions = [
      ...entradas.map((e) => ({
        id: `e-${e.id}`,
        description: e.descricao,
        category: e.categoria,
        amount: `+${formatCurrency(toNumber(e.valor))}`,
        date: formatDate(e.data.toISOString().split("T")[0]!),
        type: "income" as const,
        sortDate: e.data.getTime(),
      })),
      ...saidas.map((s) => ({
        id: `s-${s.id}`,
        description: s.descricao,
        category: s.categoria,
        amount: `-${formatCurrency(toNumber(s.valor))}`,
        date: formatDate(s.data.toISOString().split("T")[0]!),
        type: "expense" as const,
        sortDate: s.data.getTime(),
      })),
    ]
      .sort((a, b) => b.sortDate - a.sortDate)
      .slice(0, 5)
      .map(({ sortDate: _s, ...rest }) => rest);

    return NextResponse.json({
      summaryCards,
      cashFlowData,
      expenseCategories,
      upcomingBills,
      upcomingCount: contasVencendo.length,
      recentTransactions,
      recentCount: recentTransactions.length,
    });
  } catch {
    return jsonError("Erro ao carregar dashboard", 500);
  }
}
