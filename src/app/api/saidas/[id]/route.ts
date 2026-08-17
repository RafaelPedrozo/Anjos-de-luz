import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";

const schema = z.object({
  data: z.string(),
  descricao: z.string().min(1),
  categoria: z.string().min(1),
  fornecedor: z.string().min(1),
  formaPagamento: z.string().min(1),
  valor: z.number().positive(),
  status: z.enum(["PAGO", "PENDENTE"]).optional(),
});

function serialize(saida: {
  id: string;
  data: Date;
  descricao: string;
  categoria: string;
  fornecedor: string;
  formaPagamento: string;
  valor: { toNumber: () => number };
  status: string;
}) {
  return {
    id: saida.id,
    date: saida.data.toISOString().split("T")[0],
    description: saida.descricao,
    category: saida.categoria,
    supplier: saida.fornecedor,
    paymentMethod: saida.formaPagamento,
    value: saida.valor.toNumber(),
    status: saida.status === "PAGO" ? "pago" : "pendente",
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

    const existing = await prisma.saida.findFirst({
      where: { id, empresaId: auth.session.empresaId },
    });

    if (!existing) {
      return jsonError("Saída não encontrada", 404);
    }

    const saida = await prisma.saida.update({
      where: { id },
      data: {
        data: new Date(parsed.data.data),
        descricao: parsed.data.descricao,
        categoria: parsed.data.categoria,
        fornecedor: parsed.data.fornecedor,
        formaPagamento: parsed.data.formaPagamento,
        valor: parsed.data.valor,
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
      },
    });

    return NextResponse.json({ saida: serialize(saida) });
  } catch {
    return jsonError("Erro ao atualizar saída", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  const { id } = await params;

  const existing = await prisma.saida.findFirst({
    where: { id, empresaId: auth.session.empresaId },
  });

  if (!existing) {
    return jsonError("Saída não encontrada", 404);
  }

  await prisma.saida.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
