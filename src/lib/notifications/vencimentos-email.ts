export interface ReminderJobResult {
  empresaId: string;
  enviados: number;
  ignorados: number;
  erros: string[];
}

export async function processarLembretesEmpresa(empresaId: string): Promise<ReminderJobResult> {
  return { empresaId, enviados: 0, ignorados: 0, erros: [] };
}

export async function processarLembretesTodasEmpresas(): Promise<ReminderJobResult[]> {
  return [];
}
