import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";

const schema = z.object({
  nome: z.string().min(2),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  documento: z.string().optional(),
  endereco: z.string().optional(),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
});

function serialize(cliente: {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  documento: string | null;
  endereco: string | null;
  status: string;
  criadoEm: Date;
}) {
  return {
    id: cliente.id,
    name: cliente.nome,
    phone: cliente.telefone ?? "",
    email: cliente.email ?? "",
    document: cliente.documento ?? "",
    address: cliente.endereco ?? "",
    status: cliente.status.toLowerCase(),
    createdAt: cliente.criadoEm.toISOString().split("T")[0],
  };
}

export async function GET() {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  const clientes = await prisma.cliente.findMany({
    where: { empresaId: auth.session.empresaId },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json({ clientes: clientes.map(serialize) });
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

    const cliente = await prisma.cliente.create({
      data: {
        nome: parsed.data.nome,
        telefone: parsed.data.telefone || null,
        email: parsed.data.email || null,
        documento: parsed.data.documento || null,
        endereco: parsed.data.endereco || null,
        status: parsed.data.status ?? "ATIVO",
        empresaId: auth.session.empresaId,
      },
    });

    return NextResponse.json({ cliente: serialize(cliente) });
  } catch {
    return jsonError("Erro ao criar cliente", 500);
  }
}
