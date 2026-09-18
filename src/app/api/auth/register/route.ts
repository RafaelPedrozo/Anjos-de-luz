import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { jsonError } from "@/lib/api/helpers";
import { ONG_PADRAO } from "@/lib/ong";

const registerSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const nome = parsed.data.nome.trim();
    const email = parsed.data.email.toLowerCase();

    const existingEmail = await prisma.usuario.findUnique({ where: { email } });
    if (existingEmail) {
      return jsonError("E-mail já cadastrado");
    }

    let ong = await prisma.empresa.findFirst({
      orderBy: { criadoEm: "asc" },
    });

    if (!ong) {
      ong = await prisma.empresa.create({
        data: {
          razaoSocial: ONG_PADRAO.razaoSocial,
          nomeFantasia: ONG_PADRAO.nomeFantasia,
          cnpj: ONG_PADRAO.cnpj,
          telefone: ONG_PADRAO.telefone,
          email: ONG_PADRAO.email,
          endereco: ONG_PADRAO.endereco,
        },
      });
    }

    const usuariosNaOng = await prisma.usuario.count({ where: { empresaId: ong.id } });
    const senhaHash = await hashPassword(parsed.data.senha);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        perfil: usuariosNaOng === 0 ? "ADMINISTRADOR" : "FUNCIONARIO",
        empresaId: ong.id,
      },
    });

    const token = await signToken({
      sub: usuario.id,
      empresaId: ong.id,
      perfil: usuario.perfil,
      nome: usuario.nome,
      email: usuario.email,
    });

    const response = NextResponse.json({
      ong: { id: ong.id, nomeFantasia: ong.nomeFantasia },
      user: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
    });

    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("ERRO NO CADASTRO:", error);

    return jsonError(
      error instanceof Error ? error.message : "Erro ao cadastrar usuário",
      500,
    );
  }
}
