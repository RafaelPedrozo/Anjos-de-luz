import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";

const schema = z
  .object({
    descricao: z.string().min(1).optional(),
    fornecedor: z.string().min(1).optional(),
    valor: z.number().positive().optional(),
    vencimento: z.string().optional(),
    status: z.enum(["PENDENTE", "PAGO", "ATRASADO"]).optional(),
  })
  .refine(
    (data) =>
      data.descricao !== undefined ||
      data.fornecedor !== undefined ||
      data.valor !== undefined ||
      data.vencimento !== undefined ||
      data.status !== undefined,
    { message: "Nenhum dado para atualizar" },
  );

function serialize(conta: {
  id: string;
  descricao: string;
  fornecedor: string;
  valor: { toNumber: () => number };
  vencimento: Date;
  status: string;
}) {
  return {
    id: conta.id,
    description: conta.descricao,
    supplier: conta.fornecedor,
    value: conta.valor.toNumber(),
    dueDate: conta.vencimento.toISOString().split("T")[0],
    status: conta.status.toLowerCase(),
  };
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const existing = await prisma.contaPagar.findFirst({
      where: { id, empresaId: auth.session.empresaId },
    });

    if (!existing) return jsonError("Conta não encontrada", 404);

    const conta = await prisma.contaPagar.update({
      where: { id },
      data: {
        ...(parsed.data.descricao !== undefined
          ? { descricao: parsed.data.descricao }
          : {}),
        ...(parsed.data.fornecedor !== undefined
          ? { fornecedor: parsed.data.fornecedor }
          : {}),
        ...(parsed.data.valor !== undefined ? { valor: parsed.data.valor } : {}),
        ...(parsed.data.vencimento !== undefined
          ? { vencimento: new Date(parsed.data.vencimento) }
          : {}),
        ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      },
    });

    return NextResponse.json({ conta: serialize(conta) });
  } catch {
    return jsonError("Erro ao atualizar conta", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  const { id } = await params;

  const existing = await prisma.contaPagar.findFirst({
    where: { id, empresaId: auth.session.empresaId },
  });

  if (!existing) return jsonError("Conta não encontrada", 404);

  await prisma.contaPagar.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
