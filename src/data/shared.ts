export const periodOptions = [
  { value: "all", label: "Todos os períodos" },
  { value: "today", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
  { value: "quarter", label: "Este trimestre" },
  { value: "year", label: "Este ano" },
];

export const monthOptions = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export const yearOptions = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];

export const paymentMethods = [
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
  { value: "cartao", label: "Cartão" },
  { value: "transferencia", label: "Transferência" },
  { value: "dinheiro", label: "Dinheiro" },
];

export const incomeCategories = [
  { value: "all", label: "Todas as categorias" },
  { value: "vendas", label: "Vendas" },
  { value: "servicos", label: "Serviços" },
  { value: "consultoria", label: "Consultoria" },
  { value: "outros", label: "Outros" },
];

export const expenseCategories = [
  { value: "all", label: "Todas as categorias" },
  { value: "fornecedores", label: "Fornecedores" },
  { value: "salarios", label: "Salários" },
  { value: "aluguel", label: "Aluguel" },
  { value: "marketing", label: "Marketing" },
  { value: "outros", label: "Outros" },
];

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(date: string) {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}
