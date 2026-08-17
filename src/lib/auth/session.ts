import { cookies } from "next/headers";
import type { Perfil } from "@prisma/client";
import { AUTH_COOKIE } from "./constants";
import { verifyToken, type SessionPayload } from "./jwt";

export type SessionUser = SessionPayload;

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function isAdmin(perfil: Perfil) {
  return perfil === "ADMINISTRADOR";
}

export function getInitials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
