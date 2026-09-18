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

export async function GET() {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  const resgates = await prisma.resgate.findMany({
    where: { empresaId: auth.session.empresaId },
    include: { animal: { select: { nome: true } } },
    orderBy: { data: "desc" },
  });

  return NextResponse.json({ resgates: resgates.map(serialize) });
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

    const animal = await prisma.animal.findFirst({
      where: { id: parsed.data.animalId, empresaId: auth.session.empresaId },
    });
    if (!animal) return jsonError("Animal não encontrado", 404);

    const resgate = await prisma.resgate.create({
      data: {
        animalId: parsed.data.animalId,
        local: parsed.data.local.trim(),
        custos: parsed.data.custos,
        descricao: parsed.data.descricao.trim(),
        data: parsed.data.data ? new Date(parsed.data.data) : new Date(),
        empresaId: auth.session.empresaId,
      },
      include: { animal: { select: { nome: true } } },
    });

    return NextResponse.json({ resgate: serialize(resgate) });
  } catch {
    return jsonError("Erro ao cadastrar resgate", 500);
  }
}
