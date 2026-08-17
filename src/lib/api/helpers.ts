import { NextResponse } from "next/server";
import type { Perfil } from "@prisma/client";
import { getSession, isAdmin } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/permissions";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    return { error: jsonError("Não autenticado", 401) };
  }
  return { session };
}

export async function requireAdminSession() {
  const result = await requireSession();
  if ("error" in result) return result;
  if (!requireAdmin(result.session.perfil)) {
    return { error: jsonError("Acesso negado", 403) };
  }
  return result;
}

export function perfilLabel(perfil: Perfil) {
  return perfil === "ADMINISTRADOR" ? "Administrador" : "Funcionário";
}

export function sanitizeUsuario(usuario: {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  ativo: boolean;
  criadoEm: Date;
  empresaId: string;
}) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    perfilLabel: perfilLabel(usuario.perfil),
    ativo: usuario.ativo,
    status: usuario.ativo ? "ativo" : "inativo",
    criadoEm: usuario.criadoEm.toISOString(),
    empresaId: usuario.empresaId,
  };
}

export { isAdmin };
