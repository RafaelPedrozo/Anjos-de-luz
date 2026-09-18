import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";
import { formatCurrency, formatDate } from "@/data/shared";
import { dateOnly, toNumber } from "@/lib/api/serialize";

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function monthRange(year: number, monthIndex: number) {
  return {
    start: new Date(year, monthIndex, 1, 0, 0, 0, 0),
    end: new Date(year, monthIndex + 1, 0, 23, 59, 59, 999),
  };
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
    const currentRange = monthRange(currentYear, currentMonth);
    const prevRange = monthRange(prevMonthDate.getFullYear(), prevMonthDate.getMonth());

    const [animais, resgates, adocoes, doacoes] = await Promise.all([
      prisma.animal.findMany({ where: { empresaId } }),
      prisma.resgate.findMany({
        where: { empresaId },
        include: { animal: { select: { nome: true } } },
      }),
      prisma.adocao.findMany({
        where: { empresaId },
        include: { animal: { select: { nome: true } } },
      }),
      prisma.doacao.findMany({ where: { empresaId } }),
    ]);

    const doacoesMes = doacoes.filter((d) => d.data >= currentRange.start && d.data <= currentRange.end);
    const doacoesPrev = doacoes.filter((d) => d.data >= prevRange.start && d.data <= prevRange.end);
    const custosMes = resgates.filter((r) => r.data >= currentRange.start && r.data <= currentRange.end);
    const custosPrev = resgates.filter((r) => r.data >= prevRange.start && r.data <= prevRange.end);
    const adocoesMes = adocoes.filter((a) => a.data >= currentRange.start && a.data <= currentRange.end);
    const adocoesPrev = adocoes.filter((a) => a.data >= prevRange.start && a.data <= prevRange.end);

    const totalDoacoesMes = doacoesMes.reduce((sum, d) => sum + toNumber(d.valor), 0);
    const totalDoacoesPrev = doacoesPrev.reduce((sum, d) => sum + toNumber(d.valor), 0);
    const totalCustosMes = custosMes.reduce((sum, r) => sum + toNumber(r.custos), 0);
    const totalCustosPrev = custosPrev.reduce((sum, r) => sum + toNumber(r.custos), 0);

    const disponiveis = animais.filter((a) => a.status === "DISPONIVEL").length;
    const emTratamento = animais.filter((a) => a.status === "TRATAMENTO");

    const doacoesTrend = percentChange(totalDoacoesMes, totalDoacoesPrev);
    const adocoesTrend = percentChange(adocoesMes.length, adocoesPrev.length);

    const summaryCards = [
      {
        id: "doacoes",
        label: "Doações no mês",
        value: formatCurrency(totalDoacoesMes),
        trend: `${formatPercent(doacoesTrend)} vs mês anterior`,
        trendDirection: doacoesTrend >= 0 ? "up" : "down",
        badge: MONTH_LABELS[currentMonth],
        variant: "primary",
      },
      {
        id: "animais",
        label: "Animais no abrigo",
        value: String(animais.length),
        trend: `${disponiveis} disponíveis`,
        trendDirection: "up",
        iconColor: "success",
        variant: "default",
      },
      {
        id: "adocoes",
        label: "Adoções no mês",
        value: String(adocoesMes.length),
        trend: formatPercent(adocoesTrend),
        trendDirection: adocoesTrend >= 0 ? "up" : "down",
        iconColor: "warning",
        variant: "default",
      },
      {
        id: "tratamento",
        label: "Em tratamento",
        value: String(emTratamento.length),
        subtext: "Acompanhamento veterinário",
        iconColor: "purple",
        variant: "default",
      },
    ];

    const cashFlowData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const range = monthRange(d.getFullYear(), d.getMonth());
      const ent = doacoes
        .filter((item) => item.data >= range.start && item.data <= range.end)
        .reduce((sum, item) => sum + toNumber(item.valor), 0);
      const sai = resgates
        .filter((item) => item.data >= range.start && item.data <= range.end)
        .reduce((sum, item) => sum + toNumber(item.custos), 0);
      cashFlowData.push({
        month: MONTH_LABELS[d.getMonth()]!,
        value: Math.max(0, ent),
        entradas: ent,
        saidas: sai,
      });
    }

    const byTipo = new Map<string, number>();
    for (const d of doacoesMes) {
      const key = d.tipo === "PIX" ? "PIX" : "Cartão";
      byTipo.set(key, (byTipo.get(key) ?? 0) + toNumber(d.valor));
    }
    const expenseCategories = Array.from(byTipo.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: name === "PIX" ? "#F4A261" : "#2F453A",
      }))
      .sort((a, b) => b.value - a.value);

    const upcomingBills = emTratamento.slice(0, 5).map((animal) => ({
      id: animal.id,
      name: animal.nome,
      dueIn: animal.especie,
      amount: "Tratamento",
      date: formatDate(dateOnly(animal.dataResgate)),
    }));

    const recentTransactions = [
      ...doacoes.map((d) => ({
        id: `d-${d.id}`,
        description: d.doador,
        category: d.tipo === "PIX" ? "Doação PIX" : "Doação Cartão",
        amount: `+${formatCurrency(toNumber(d.valor))}`,
        date: formatDate(dateOnly(d.data)),
        type: "income" as const,
        sortDate: d.data.getTime(),
      })),
      ...adocoes.map((a) => ({
        id: `a-${a.id}`,
        description: a.animal.nome,
        category: `Adoção · ${a.adotanteNome}`,
        amount: "Adotado",
        date: formatDate(dateOnly(a.data)),
        type: "expense" as const,
        sortDate: a.data.getTime(),
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
      upcomingCount: emTratamento.length,
      recentTransactions,
      recentCount: recentTransactions.length,
      totais: {
        doacoesMes: totalDoacoesMes,
        custosResgateMes: totalCustosMes,
        custosResgatePrev: totalCustosPrev,
      },
    });
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    return jsonError("Erro ao carregar dashboard", 500);
  }
}
