import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { jsonError } from "@/lib/api/helpers";

const registerSchema = z.object({
  razaoSocial: z.string().min(2),
  nomeFantasia: z.string().min(2),
  cnpj: z.string().min(1, "CNPJ é obrigatório"),
  telefone: z.string().optional(),
  email: z.string().email(),
  endereco: z.string().optional(),
  adminNome: z.string().min(2),
  adminEmail: z.string().email(),
  adminSenha: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const data = parsed.data;
    const cnpj = data.cnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) {
  return jsonError("CNPJ deve conter 14 números");
}
    const adminEmail = data.adminEmail.toLowerCase();

    const existingCnpj = await prisma.empresa.findUnique({ where: { cnpj } });
    if (existingCnpj) {
      return jsonError("CNPJ já cadastrado");
    }

    const existingEmail = await prisma.usuario.findUnique({ where: { email: adminEmail } });
    if (existingEmail) {
      return jsonError("E-mail já cadastrado");
    }

    const senhaHash = await hashPassword(data.adminSenha);

    const result = await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: {
          razaoSocial: data.razaoSocial,
          nomeFantasia: data.nomeFantasia,
          cnpj,
          telefone: data.telefone,
          email: data.email.toLowerCase(),
          endereco: data.endereco,
        },
      });

      const usuario = await tx.usuario.create({
        data: {
          nome: data.adminNome,
          email: adminEmail,
          senhaHash,
          perfil: "ADMINISTRADOR",
          empresaId: empresa.id,
        },
      });

      return { empresa, usuario };
    });

    const token = await signToken({
      sub: result.usuario.id,
      empresaId: result.empresa.id,
      perfil: result.usuario.perfil,
      nome: result.usuario.nome,
      email: result.usuario.email,
    });

    const response = NextResponse.json({
      empresa: { id: result.empresa.id, nomeFantasia: result.empresa.nomeFantasia },
      user: { id: result.usuario.id, nome: result.usuario.nome, email: result.usuario.email },
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
    return jsonError("Erro ao cadastrar empresa", 500);
  }
}
