import type { ContaPagar, ConfigNotificacao, TipoLembreteEmail } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendVencimentoEmail } from "@/lib/mail";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysUntil(dueDate: Date, from = new Date()) {
  const ms = startOfDay(dueDate).getTime() - startOfDay(from).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

function buildEmailContent(
  conta: ContaPagar & { valor: { toNumber: () => number } },
  tipo: TipoLembreteEmail,
  diasRestantes: number,
) {
  const valor = formatCurrency(conta.valor.toNumber());
  const data = formatDate(conta.vencimento);

  if (tipo === "ANTES_VENCIMENTO") {
    return {
      assunto: `ViaConeta — Boleto vence em ${diasRestantes} dia(s): ${conta.descricao}`,
      corpo: `O boleto "${conta.descricao}" do fornecedor ${conta.fornecedor} vence em ${diasRestantes} dia(s), em ${data}. Valor: ${valor}.`,
    };
  }
  if (tipo === "DIA_VENCIMENTO") {
    return {
      assunto: `ViaConeta — Boleto vence HOJE: ${conta.descricao}`,
      corpo: `O boleto "${conta.descricao}" do fornecedor ${conta.fornecedor} vence hoje (${data}). Valor: ${valor}.`,
    };
  }
  return {
    assunto: `ViaConeta — Boleto ATRASADO: ${conta.descricao}`,
    corpo: `O boleto "${conta.descricao}" do fornecedor ${conta.fornecedor} está atrasado desde ${data}. Valor: ${valor}.`,
  };
}

function resolveReminderType(
  conta: ContaPagar,
  config: ConfigNotificacao,
  dias: number,
): TipoLembreteEmail | null {
  if (dias === config.emailDiasAntes && dias > 0) {
    return "ANTES_VENCIMENTO";
  }
  if (dias === 0 && config.emailNoDiaVencimento) {
    return "DIA_VENCIMENTO";
  }
  if (dias < 0 && config.emailAtrasados) {
    return "ATRASADO";
  }
  return null;
}

export interface ReminderJobResult {
  empresaId: string;
  enviados: number;
  ignorados: number;
  erros: string[];
}

async function resolveEmailDestino(empresaId: string, config: ConfigNotificacao) {
  if (config.emailDestino) {
    return config.emailDestino;
  }
  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
  return empresa?.email ?? null;
}

export async function processarLembretesEmpresa(
  empresaId: string,
): Promise<ReminderJobResult> {
  const result: ReminderJobResult = {
    empresaId,
    enviados: 0,
    ignorados: 0,
    erros: [],
  };

  const config = await prisma.configNotificacao.findUnique({
    where: { empresaId },
  });

  if (!config?.emailVencimentosAtivo) {
    return result;
  }

  const emailDestino = await resolveEmailDestino(empresaId, config);
  if (!emailDestino) {
    result.erros.push("E-mail de destino não configurado");
    return result;
  }

  const hoje = new Date();

  await prisma.contaPagar.updateMany({
    where: {
      empresaId,
      status: "PENDENTE",
      vencimento: { lt: startOfDay(hoje) },
    },
    data: { status: "ATRASADO" },
  });

  const contas = await prisma.contaPagar.findMany({
    where: {
      empresaId,
      status: { in: ["PENDENTE", "ATRASADO"] },
    },
  });

  for (const conta of contas) {
    const dias = daysUntil(conta.vencimento, hoje);
    const tipo = resolveReminderType(conta, config, dias);

    if (!tipo) {
      result.ignorados++;
      continue;
    }

    const jaEnviado = await prisma.lembreteEmail.findUnique({
      where: {
        contaPagarId_tipo: { contaPagarId: conta.id, tipo },
      },
    });

    if (jaEnviado) {
      result.ignorados++;
      continue;
    }

    const { assunto, corpo } = buildEmailContent(conta, tipo, dias);

    try {
      const mail = await sendVencimentoEmail(emailDestino, assunto, corpo, {
        descricao: conta.descricao,
        fornecedor: conta.fornecedor,
        valor: formatCurrency(conta.valor.toNumber()),
        vencimento: formatDate(conta.vencimento),
      });

      await prisma.lembreteEmail.create({
        data: {
          contaPagarId: conta.id,
          empresaId,
          tipo,
          email: emailDestino,
          assunto,
          sucesso: mail.sent || mail.devMode,
        },
      });

      result.enviados++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar e-mail";
      result.erros.push(`${conta.descricao}: ${msg}`);
    }
  }

  return result;
}

export async function processarLembretesTodasEmpresas() {
  const configs = await prisma.configNotificacao.findMany({
    where: { emailVencimentosAtivo: true },
  });

  const results: ReminderJobResult[] = [];

  for (const config of configs) {
    results.push(await processarLembretesEmpresa(config.empresaId));
  }

  return results;
}
