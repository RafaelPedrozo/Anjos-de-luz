import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { jsonError } from "@/lib/api/helpers";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha obrigatória"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const { email, senha } = parsed.data;

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
      include: { empresa: true },
    });

    if (!usuario || !usuario.ativo) {
      return jsonError("Credenciais inválidas", 401);
    }

    const valid = await verifyPassword(senha, usuario.senhaHash);
    if (!valid) {
      return jsonError("Credenciais inválidas", 401);
    }

    const token = await signToken({
      sub: usuario.id,
      empresaId: usuario.empresaId,
      perfil: usuario.perfil,
      nome: usuario.nome,
      email: usuario.email,
    });

    const response = NextResponse.json({
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        empresa: {
          id: usuario.empresa.id,
          nomeFantasia: usuario.empresa.nomeFantasia,
        },
      },
    });

    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return jsonError("Erro ao autenticar", 500);
  }
}
