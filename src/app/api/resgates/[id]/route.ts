import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";
import { dateOnly, toNumber } from "@/lib/api/serialize";

const schema = z.object({
  animalId: z.string().min(1),
  local: z.string().min(1),
  custos: z.number().min(0),
  descricao: z.string().min(1),
  data: z.string().optional(),
});

function serialize(resgate: {
  id: string;
  local: string;
  custos: { toNumber: () => number };
  descricao: string;
  data: Date;
  animalId: string;
  animal: { nome: string };
}) {
  return {
    id: resgate.id,
    animalId: resgate.animalId,
    animalNome: resgate.animal.nome,
    local: resgate.local,
    custos: toNumber(resgate.custos),
    descricao: resgate.descricao,
    data: dateOnly(resgate.data),
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

    const existing = await prisma.resgate.findFirst({
      where: { id, empresaId: auth.session.empresaId },
    });
    if (!existing) return jsonError("Resgate não encontrado", 404);

    const animal = await prisma.animal.findFirst({
      where: { id: parsed.data.animalId, empresaId: auth.session.empresaId },
    });
    if (!animal) return jsonError("Animal não encontrado", 404);

    const resgate = await prisma.resgate.update({
      where: { id },
      data: {
        animalId: parsed.data.animalId,
        local: parsed.data.local.trim(),
        custos: parsed.data.custos,
        descricao: parsed.data.descricao.trim(),
        data: parsed.data.data ? new Date(parsed.data.data) : existing.data,
      },
      include: { animal: { select: { nome: true } } },
    });

    return NextResponse.json({ resgate: serialize(resgate) });
  } catch {
    return jsonError("Erro ao atualizar resgate", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const existing = await prisma.resgate.findFirst({
    where: { id, empresaId: auth.session.empresaId },
  });
  if (!existing) return jsonError("Resgate não encontrado", 404);

  await prisma.resgate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
