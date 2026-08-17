import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, sanitizeUsuario, jsonError } from "@/lib/api/helpers";

const updateSchema = z.object({
  nome: z.string().min(2).optional(),
  email: z.string().email().optional(),
  perfil: z.enum(["ADMINISTRADOR", "FUNCIONARIO"]).optional(),
  ativo: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const body = await request.json();

    if (id === auth.session.sub && body.ativo === false) {
      return jsonError("Você não pode desativar sua própria conta");
    }

    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const existing = await prisma.usuario.findFirst({
      where: { id, empresaId: auth.session.empresaId },
    });

    if (!existing) {
      return jsonError("Usuário não encontrado", 404);
    }

    if (parsed.data.email) {
      const emailTaken = await prisma.usuario.findFirst({
        where: { email: parsed.data.email.toLowerCase(), NOT: { id } },
      });
      if (emailTaken) {
        return jsonError("E-mail já cadastrado");
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        ...parsed.data,
        email: parsed.data.email?.toLowerCase(),
      },
    });

    return NextResponse.json({ usuario: sanitizeUsuario(usuario) });
  } catch {
    return jsonError("Erro ao atualizar usuário", 500);
  }
}
