import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";

const schema = z.object({
  descricao: z.string().min(1),
  fornecedor: z.string().min(1),
  valor: z.number().positive(),
  vencimento: z.string(),
  status: z.enum(["PENDENTE", "PAGO", "ATRASADO"]).optional(),
});

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function serialize(conta: {
  id: string;
  descricao: string;
  fornecedor: string;
  valor: { toNumber: () => number };
  vencimento: Date;
  status: string;
}) {
  const due = conta.vencimento;
  const dueDate = [
    due.getUTCFullYear(),
    String(due.getUTCMonth() + 1).padStart(2, "0"),
    String(due.getUTCDate()).padStart(2, "0"),
  ].join("-");

  return {
    id: conta.id,
    description: conta.descricao,
    supplier: conta.fornecedor,
    value: conta.valor.toNumber(),
    dueDate,
    status: conta.status.toLowerCase(),
  };
}

export async function GET() {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  const empresaId = auth.session.empresaId;

  // Contas pendentes com vencimento antes de hoje → ATRASADO
  await prisma.contaPagar.updateMany({
    where: {
      empresaId,
      status: "PENDENTE",
      vencimento: { lt: startOfTodayUtc() },
    },
    data: { status: "ATRASADO" },
  });

  const contas = await prisma.contaPagar.findMany({
    where: { empresaId },
    orderBy: { vencimento: "asc" },
  });

  return NextResponse.json({ contas: contas.map(serialize) });
}

export async function POST(request: Request) {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const conta = await prisma.contaPagar.create({
      data: {
        descricao: parsed.data.descricao,
        fornecedor: parsed.data.fornecedor,
        valor: parsed.data.valor,
        vencimento: new Date(parsed.data.vencimento),
        status: parsed.data.status ?? "PENDENTE",
        empresaId: auth.session.empresaId,
      },
    });

    return NextResponse.json({ conta: serialize(conta) });
  } catch {
    return jsonError("Erro ao criar conta", 500);
  }
}
