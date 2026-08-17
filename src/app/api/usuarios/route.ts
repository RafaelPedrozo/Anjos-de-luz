import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateTemporaryPassword } from "@/lib/auth/password";
import { requireAdminSession, sanitizeUsuario, jsonError } from "@/lib/api/helpers";
import { sendWelcomeEmail } from "@/lib/mail";

const createSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  perfil: z.enum(["ADMINISTRADOR", "FUNCIONARIO"]),
  senha: z.string().min(6).optional(),
});

export async function GET() {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  const usuarios = await prisma.usuario.findMany({
    where: { empresaId: auth.session.empresaId },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json({
    usuarios: usuarios.map(sanitizeUsuario),
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const email = parsed.data.email.toLowerCase();
    const senhaPlana = parsed.data.senha ?? generateTemporaryPassword();

    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return jsonError("E-mail já cadastrado");
    }

    const usuario = await prisma.usuario.create({
      data: {
        nome: parsed.data.nome,
        email,
        senhaHash: await hashPassword(senhaPlana),
        perfil: parsed.data.perfil,
        empresaId: auth.session.empresaId,
      },
    });

    await sendWelcomeEmail(usuario.email, usuario.nome, senhaPlana);

    return NextResponse.json({
      usuario: sanitizeUsuario(usuario),
      senhaTemporaria: parsed.data.senha ? undefined : senhaPlana,
    });
  } catch {
    return jsonError("Erro ao criar usuário", 500);
  }
}
