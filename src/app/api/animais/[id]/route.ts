import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";
import { dateOnly } from "@/lib/api/serialize";

const schema = z.object({
  nome: z.string().min(1),
  especie: z.string().min(1),
  status: z.enum(["DISPONIVEL", "ADOTADO", "TRATAMENTO"]).optional(),
  foto: z.string().optional(),
  dataResgate: z.string().min(1),
});

function serialize(animal: {
  id: string;
  nome: string;
  especie: string;
  status: string;
  foto: string | null;
  dataResgate: Date;
}) {
  return {
    id: animal.id,
    nome: animal.nome,
    especie: animal.especie,
    status: animal.status,
    foto: animal.foto ?? "",
    dataResgate: dateOnly(animal.dataResgate),
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

    const existing = await prisma.animal.findFirst({
      where: { id, empresaId: auth.session.empresaId },
    });
    if (!existing) return jsonError("Animal não encontrado", 404);

    const animal = await prisma.animal.update({
      where: { id },
      data: {
        nome: parsed.data.nome.trim(),
        especie: parsed.data.especie,
        foto: parsed.data.foto?.trim() || null,
        dataResgate: new Date(parsed.data.dataResgate),
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
      },
    });

    return NextResponse.json({ animal: serialize(animal) });
  } catch {
    return jsonError("Erro ao atualizar animal", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const existing = await prisma.animal.findFirst({
    where: { id, empresaId: auth.session.empresaId },
  });
  if (!existing) return jsonError("Animal não encontrado", 404);

  await prisma.animal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
