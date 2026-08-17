export type PrimarySummaryCard = {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
  badge: string;
  variant: "primary";
};

export type TrendSummaryCard = {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
  iconColor: "success" | "warning";
  variant: "default";
};

export type CountSummaryCard = {
  id: string;
  label: string;
  value: string;
  subtext: string;
  iconColor: "purple";
  variant: "default";
};

export type SummaryCard = PrimarySummaryCard | TrendSummaryCard | CountSummaryCard;

export type CashFlowPoint = {
  month: string;
  value: number;
  entradas?: number;
  saidas?: number;
};

export type ExpenseCategory = {
  name: string;
  value: number;
  color: string;
};

export type UpcomingBill = {
  id: string;
  name: string;
  dueIn: string;
  amount: string;
  date: string;
};

export type RecentTransaction = {
  id: string;
  description: string;
  category: string;
  amount: string;
  date: string;
  type: "income" | "expense";
};

export type DashboardData = {
  summaryCards: SummaryCard[];
  cashFlowData: CashFlowPoint[];
  expenseCategories: ExpenseCategory[];
  upcomingBills: UpcomingBill[];
  upcomingCount: number;
  recentTransactions: RecentTransaction[];
  recentCount: number;
};

export function isTrendSummaryCard(card: SummaryCard): card is TrendSummaryCard {
  return card.variant === "default" && "trend" in card;
}

export function isCountSummaryCard(card: SummaryCard): card is CountSummaryCard {
  return card.variant === "default" && "subtext" in card;
}
