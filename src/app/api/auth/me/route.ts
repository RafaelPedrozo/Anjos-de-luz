import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getInitials } from "@/lib/auth/session";
import { PERFIL_LABELS } from "@/lib/auth/constants";
import { jsonError } from "@/lib/api/helpers";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.sub },
    include: { empresa: true },
  });

  if (!usuario || !usuario.ativo) {
    return jsonError("Usuário não encontrado", 404);
  }

  return NextResponse.json({
    user: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      perfilLabel: PERFIL_LABELS[usuario.perfil],
      initials: getInitials(usuario.nome),
      ativo: usuario.ativo,
    },
    empresa: {
      id: usuario.empresa.id,
      razaoSocial: usuario.empresa.razaoSocial,
      nomeFantasia: usuario.empresa.nomeFantasia,
      cnpj: usuario.empresa.cnpj,
    },
  });
}
