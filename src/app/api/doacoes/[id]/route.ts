import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";
import { dateOnly, toNumber } from "@/lib/api/serialize";

const schema = z.object({
  valor: z.number().positive(),
  tipo: z.enum(["PIX", "CARTAO"]),
  doador: z.string().min(1),
  data: z.string().min(1),
});

function serialize(doacao: {
  id: string;
  valor: { toNumber: () => number };
  tipo: string;
  doador: string;
  data: Date;
}) {
  return {
    id: doacao.id,
    valor: toNumber(doacao.valor),
    tipo: doacao.tipo,
    doador: doacao.doador,
    data: dateOnly(doacao.data),
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

    const existing = await prisma.doacao.findFirst({
      where: { id, empresaId: auth.session.empresaId },
    });
    if (!existing) return jsonError("Doação não encontrada", 404);

    const doacao = await prisma.doacao.update({
      where: { id },
      data: {
        valor: parsed.data.valor,
        tipo: parsed.data.tipo,
        doador: parsed.data.doador.trim(),
        data: new Date(parsed.data.data),
      },
    });

    return NextResponse.json({ doacao: serialize(doacao) });
  } catch {
    return jsonError("Erro ao atualizar doação", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const existing = await prisma.doacao.findFirst({
    where: { id, empresaId: auth.session.empresaId },
  });
  if (!existing) return jsonError("Doação não encontrada", 404);

  await prisma.doacao.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
