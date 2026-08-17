import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";

const schema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
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

    const existing = await prisma.cliente.findFirst({
      where: { id, empresaId: auth.session.empresaId },
    });

    if (!existing) return jsonError("Cliente não encontrado", 404);

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome: parsed.data.nome,
        telefone: parsed.data.telefone || null,
        email: parsed.data.email || null,
        documento: parsed.data.documento || null,
        endereco: parsed.data.endereco || null,
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
      },
    });

    return NextResponse.json({ cliente: serialize(cliente) });
  } catch {
    return jsonError("Erro ao atualizar cliente", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  const { id } = await params;

  const existing = await prisma.cliente.findFirst({
    where: { id, empresaId: auth.session.empresaId },
  });

  if (!existing) return jsonError("Cliente não encontrado", 404);

  await prisma.cliente.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
