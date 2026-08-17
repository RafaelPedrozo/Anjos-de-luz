import type { Perfil } from "@prisma/client";

const ADMIN_ONLY_ROUTES = ["/configuracoes/usuarios"];
const ADMIN_ONLY_API_PREFIXES = ["/api/usuarios", "/api/empresa", "/api/notificacoes"];

export function canAccessRoute(pathname: string, perfil: Perfil) {
  if (perfil === "ADMINISTRADOR") return true;

  if (ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    return false;
  }

  return true;
}

export function canAccessApi(pathname: string, perfil: Perfil, method: string) {
  if (perfil === "ADMINISTRADOR") return true;

  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (ADMIN_ONLY_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (pathname === "/api/empresa" && method === "GET") return true;
    if (pathname.startsWith("/api/notificacoes") && method === "GET") return true;
    return false;
  }

  return true;
}

export function requireAdmin(perfil: Perfil) {
  return perfil === "ADMINISTRADOR";
}
