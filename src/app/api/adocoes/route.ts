import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";
import { dateOnly } from "@/lib/api/serialize";

const schema = z.object({
  animalId: z.string().min(1),
  adotanteNome: z.string().min(1, "Informe o adotante"),
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

export async function GET() {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  const adocoes = await prisma.adocao.findMany({
    where: { empresaId: auth.session.empresaId },
    include: { animal: { select: { nome: true, especie: true } } },
    orderBy: { data: "desc" },
  });

  return NextResponse.json({ adocoes: adocoes.map(serialize) });
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

    const adocao = await prisma.$transaction(async (tx) => {
      const created = await tx.adocao.create({
        data: {
          animalId: parsed.data.animalId,
          adotanteNome: parsed.data.adotanteNome.trim(),
          adotanteEmail: parsed.data.adotanteEmail?.trim() || null,
          adotanteTelefone: parsed.data.adotanteTelefone?.trim() || null,
          data: new Date(parsed.data.data),
          empresaId: auth.session.empresaId,
        },
        include: { animal: { select: { nome: true, especie: true } } },
      });

      await tx.animal.update({
        where: { id: parsed.data.animalId },
        data: { status: "ADOTADO" },
      });

      return created;
    });

    return NextResponse.json({ adocao: serialize(adocao) });
  } catch {
    return jsonError("Erro ao registrar adoção", 500);
  }
}
