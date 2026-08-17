import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, requireAdminSession, jsonError } from "@/lib/api/helpers";

const updateSchema = z.object({
  razaoSocial: z.string().min(2).optional(),
  nomeFantasia: z.string().min(2).optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
  endereco: z.string().optional(),
});

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const empresa = await prisma.empresa.findUnique({
    where: { id: auth.session.empresaId },
  });

  if (!empresa) {
    return jsonError("Empresa não encontrada", 404);
  }

  return NextResponse.json({ empresa });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const empresa = await prisma.empresa.update({
      where: { id: auth.session.empresaId },
      data: {
        ...parsed.data,
        email: parsed.data.email?.toLowerCase(),
      },
    });

    return NextResponse.json({ empresa });
  } catch {
    return jsonError("Erro ao atualizar empresa", 500);
  }
}
