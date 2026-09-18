import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";
import { dateOnly } from "@/lib/api/serialize";

const schema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  especie: z.string().min(1, "Informe a espécie"),
  status: z.enum(["DISPONIVEL", "ADOTADO", "TRATAMENTO"]).optional(),
  foto: z.string().optional(),
  dataResgate: z.string().min(1, "Informe a data do resgate"),
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

export async function GET() {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  const animais = await prisma.animal.findMany({
    where: { empresaId: auth.session.empresaId },
    orderBy: { dataResgate: "desc" },
  });

  return NextResponse.json({ animais: animais.map(serialize) });
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

    const animal = await prisma.animal.create({
      data: {
        nome: parsed.data.nome.trim(),
        especie: parsed.data.especie,
        status: parsed.data.status ?? "DISPONIVEL",
        foto: parsed.data.foto?.trim() || null,
        dataResgate: new Date(parsed.data.dataResgate),
        empresaId: auth.session.empresaId,
      },
    });

    return NextResponse.json({ animal: serialize(animal) });
  } catch {
    return jsonError("Erro ao cadastrar animal", 500);
  }
}
