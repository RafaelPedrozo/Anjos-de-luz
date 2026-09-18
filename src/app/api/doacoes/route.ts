import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";
import { dateOnly, toNumber } from "@/lib/api/serialize";

const schema = z.object({
  valor: z.number().positive("Informe um valor válido"),
  tipo: z.enum(["PIX", "CARTAO"]),
  doador: z.string().min(1, "Informe o doador"),
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

export async function GET() {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  const doacoes = await prisma.doacao.findMany({
    where: { empresaId: auth.session.empresaId },
    orderBy: { data: "desc" },
  });

  return NextResponse.json({ doacoes: doacoes.map(serialize) });
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

    const doacao = await prisma.doacao.create({
      data: {
        valor: parsed.data.valor,
        tipo: parsed.data.tipo,
        doador: parsed.data.doador.trim(),
        data: new Date(parsed.data.data),
        empresaId: auth.session.empresaId,
      },
    });

    return NextResponse.json({ doacao: serialize(doacao) });
  } catch {
    return jsonError("Erro ao registrar doação", 500);
  }
}
