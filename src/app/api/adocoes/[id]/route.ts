import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";
import { dateOnly } from "@/lib/api/serialize";

const schema = z.object({
  animalId: z.string().min(1),
  adotanteNome: z.string().min(1),
  adotanteEmail: z.string().email().optional().or(z.literal("")),
  adotanteTelefone: z.string().optional(),
  data: z.string().min(1),
});

function serialize(adocao: {
  id: string;
  animalId: string;
  adotanteNome: string;
  adotanteEmail: string | null;
  adotanteTelefone: string | null;
  data: Date;
  animal: { nome: string; especie: string };
}) {
  return {
    id: adocao.id,
    animalId: adocao.animalId,
    animalNome: adocao.animal.nome,
    animalEspecie: adocao.animal.especie,
    adotanteNome: adocao.adotanteNome,
    adotanteEmail: adocao.adotanteEmail ?? "",
    adotanteTelefone: adocao.adotanteTelefone ?? "",
    data: dateOnly(adocao.data),
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

    const existing = await prisma.adocao.findFirst({
      where: { id, empresaId: auth.session.empresaId },
    });
    if (!existing) return jsonError("Adoção não encontrada", 404);

    const adocao = await prisma.$transaction(async (tx) => {
      if (existing.animalId !== parsed.data.animalId) {
        await tx.animal.update({
          where: { id: existing.animalId },
          data: { status: "DISPONIVEL" },
        });
        await tx.animal.update({
          where: { id: parsed.data.animalId },
          data: { status: "ADOTADO" },
        });
      }

      return tx.adocao.update({
        where: { id },
        data: {
          animalId: parsed.data.animalId,
          adotanteNome: parsed.data.adotanteNome.trim(),
          adotanteEmail: parsed.data.adotanteEmail?.trim() || null,
          adotanteTelefone: parsed.data.adotanteTelefone?.trim() || null,
          data: new Date(parsed.data.data),
        },
        include: { animal: { select: { nome: true, especie: true } } },
      });
    });

    return NextResponse.json({ adocao: serialize(adocao) });
  } catch {
    return jsonError("Erro ao atualizar adoção", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const existing = await prisma.adocao.findFirst({
    where: { id, empresaId: auth.session.empresaId },
  });
  if (!existing) return jsonError("Adoção não encontrada", 404);

  await prisma.$transaction(async (tx) => {
    await tx.adocao.delete({ where: { id } });
    const remaining = await tx.adocao.count({ where: { animalId: existing.animalId } });
    if (remaining === 0) {
      await tx.animal.update({
        where: { id: existing.animalId },
        data: { status: "DISPONIVEL" },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
