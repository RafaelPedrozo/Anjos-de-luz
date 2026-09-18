import type { CashFlowPoint, ExpenseCategory } from "@/data/dashboard";

export interface RelatorioExportData {
  geradoEm: string;
  mesLabel: string;
  ano: string;
  cashFlow: CashFlowPoint[];
  categorias: ExpenseCategory[];
  entradasMes: number;
  saidasMes: number;
  saldoMes: number;
}

function escapeCsv(value: string | number) {
  const text = String(value);
  if (text.includes(";") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildRelatorioCsv(data: RelatorioExportData) {
  const lines: string[] = [];

  lines.push("Anjos de Luz - Relatório da ONG");
  lines.push(`Gerado em;${data.geradoEm}`);
  lines.push(`Período;${data.mesLabel}/${data.ano}`);
  lines.push("");

  lines.push("Resumo do mês");
  lines.push("Indicador;Valor");
  lines.push(`Doações;${data.entradasMes}`);
  lines.push(`Custos de resgate;${data.saidasMes}`);
  lines.push(`Saldo;${data.saldoMes}`);
  lines.push("");

  lines.push("Doações (últimos 6 meses)");
  lines.push("Mês;Doações;Custos de resgate;Valor");
  for (const row of data.cashFlow) {
    lines.push(
      [
        escapeCsv(row.month),
        escapeCsv(row.entradas ?? 0),
        escapeCsv(row.saidas ?? 0),
        escapeCsv(row.value),
      ].join(";"),
    );
  }
  lines.push("");

  lines.push("Doações por tipo");
  lines.push("Categoria;Valor");
  for (const cat of data.categorias) {
    lines.push([escapeCsv(cat.name), escapeCsv(cat.value)].join(";"));
  }

  return "\uFEFF" + lines.join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
