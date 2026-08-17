import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { verifyToken } from "@/lib/auth/jwt";
import { canAccessApi, canAccessRoute } from "@/lib/auth/permissions";

const PUBLIC_PATHS = ["/login", "/cadastro"];
const PUBLIC_API = ["/api/auth/login", "/api/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPage = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isPublicApi = PUBLIC_API.some((path) => pathname.startsWith(path));
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");

  if (isStatic) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  if (isPublicApi) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/cron")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    if (!canAccessApi(pathname, session.perfil, request.method)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    const headers = new Headers(request.headers);
    headers.set("x-user-id", session.sub);
    headers.set("x-empresa-id", session.empresaId);
    headers.set("x-user-perfil", session.perfil);
    return NextResponse.next({ request: { headers } });
  }

  if (isPublicPage) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!canAccessRoute(pathname, session.perfil)) {
    return NextResponse.redirect(new URL("/configuracoes", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
