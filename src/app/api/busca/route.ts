import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantSession, jsonError } from "@/lib/api/tenant";

export async function GET(request: Request) {
  const auth = await getTenantSession();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const empresaId = auth.session.empresaId;
  const contains = { contains: q, mode: "insensitive" as const };

  try {
    const [entradas, saidas, contas, clientes] = await Promise.all([
      prisma.entrada.findMany({
        where: {
          empresaId,
          OR: [{ descricao: contains }, { cliente: contains }, { categoria: contains }],
        },
        take: 8,
        orderBy: { data: "desc" },
      }),
      prisma.saida.findMany({
        where: {
          empresaId,
          OR: [{ descricao: contains }, { fornecedor: contains }, { categoria: contains }],
        },
        take: 8,
        orderBy: { data: "desc" },
      }),
      prisma.contaPagar.findMany({
        where: {
          empresaId,
          OR: [{ descricao: contains }, { fornecedor: contains }],
        },
        take: 8,
        orderBy: { vencimento: "asc" },
      }),
      prisma.cliente.findMany({
        where: {
          empresaId,
          OR: [{ nome: contains }, { email: contains }, { documento: contains }],
        },
        take: 8,
        orderBy: { nome: "asc" },
      }),
    ]);

    const results = [
      ...entradas.map((e) => ({
        id: e.id,
        type: "entrada" as const,
        title: e.descricao,
        subtitle: `${e.cliente} · Entrada`,
        href: "/entradas",
      })),
      ...saidas.map((s) => ({
        id: s.id,
        type: "saida" as const,
        title: s.descricao,
        subtitle: `${s.fornecedor} · Saída`,
        href: "/saidas",
      })),
      ...contas.map((c) => ({
        id: c.id,
        type: "conta" as const,
        title: c.descricao,
        subtitle: `${c.fornecedor} · Conta a pagar`,
        href: "/contas-a-pagar",
      })),
      ...clientes.map((c) => ({
        id: c.id,
        type: "cliente" as const,
        title: c.nome,
        subtitle: `${c.email || c.documento || "Cliente"}`,
        href: "/clientes",
      })),
    ].slice(0, 20);

    return NextResponse.json({ results });
  } catch {
    return jsonError("Erro ao buscar", 500);
  }
}
