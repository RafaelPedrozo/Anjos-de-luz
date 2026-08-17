import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateTemporaryPassword } from "@/lib/auth/password";
import { requireAdminSession, jsonError } from "@/lib/api/helpers";
import { sendPasswordResetEmail } from "@/lib/mail";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const usuario = await prisma.usuario.findFirst({
      where: { id, empresaId: auth.session.empresaId },
    });

    if (!usuario) {
      return jsonError("Usuário não encontrado", 404);
    }

    const senhaTemporaria = generateTemporaryPassword();

    await prisma.usuario.update({
      where: { id },
      data: { senhaHash: await hashPassword(senhaTemporaria) },
    });

    const mailResult = await sendPasswordResetEmail(
      usuario.email,
      usuario.nome,
      senhaTemporaria,
    );

    return NextResponse.json({
      ok: true,
      senhaTemporaria: mailResult.devMode ? senhaTemporaria : undefined,
      emailEnviado: mailResult.sent,
    });
  } catch {
    return jsonError("Erro ao resetar senha", 500);
  }
}
