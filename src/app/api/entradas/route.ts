import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";

const schema = z.object({
  data: z.string(),
  descricao: z.string().min(1),
  categoria: z.string().min(1),
  cliente: z.string().min(1),
  formaPagamento: z.string().min(1),
  valor: z.number().positive(),
  status: z.enum(["RECEBIDO", "PENDENTE"]).optional(),
});

function serialize(entrada: {
  id: string;
  data: Date;
  descricao: string;
  categoria: string;
  cliente: string;
  formaPagamento: string;
  valor: { toNumber: () => number };
  status: string;
}) {
  return {
    id: entrada.id,
    date: entrada.data.toISOString().split("T")[0],
    description: entrada.descricao,
    category: entrada.categoria,
    client: entrada.cliente,
    paymentMethod: entrada.formaPagamento,
    value: entrada.valor.toNumber(),
    status: entrada.status === "RECEBIDO" ? "recebido" : "pendente",
  };
}

export async function GET() {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  const entradas = await prisma.entrada.findMany({
    where: { empresaId: auth.session.empresaId },
    orderBy: { data: "desc" },
  });

  return NextResponse.json({ entradas: entradas.map(serialize) });
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

    const entrada = await prisma.entrada.create({
      data: {
        data: new Date(parsed.data.data),
        descricao: parsed.data.descricao,
        categoria: parsed.data.categoria,
        cliente: parsed.data.cliente,
        formaPagamento: parsed.data.formaPagamento,
        valor: parsed.data.valor,
        status: parsed.data.status ?? "RECEBIDO",
        empresaId: auth.session.empresaId,
      },
    });

    return NextResponse.json({ entrada: serialize(entrada) });
  } catch {
    return jsonError("Erro ao criar entrada", 500);
  }
}
