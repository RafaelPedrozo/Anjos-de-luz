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
    const [animais, resgates, adocoes, doacoes] = await Promise.all([
      prisma.animal.findMany({
        where: { empresaId, OR: [{ nome: contains }, { especie: contains }] },
        take: 8,
        orderBy: { nome: "asc" },
      }),
      prisma.resgate.findMany({
        where: {
          empresaId,
          OR: [{ local: contains }, { descricao: contains }],
        },
        take: 8,
        include: { animal: { select: { nome: true } } },
        orderBy: { data: "desc" },
      }),
      prisma.adocao.findMany({
        where: {
          empresaId,
          OR: [{ adotanteNome: contains }, { adotanteEmail: contains }],
        },
        take: 8,
        include: { animal: { select: { nome: true } } },
        orderBy: { data: "desc" },
      }),
      prisma.doacao.findMany({
        where: { empresaId, doador: contains },
        take: 8,
        orderBy: { data: "desc" },
      }),
    ]);

    const results = [
      ...animais.map((a) => ({
        id: a.id,
        type: "animal" as const,
        title: a.nome,
        subtitle: `${a.especie} · Animal`,
        href: "/animais",
      })),
      ...resgates.map((r) => ({
        id: r.id,
        type: "resgate" as const,
        title: r.animal.nome,
        subtitle: `${r.local} · Resgate`,
        href: "/animais",
      })),
      ...adocoes.map((a) => ({
        id: a.id,
        type: "adocao" as const,
        title: a.animal.nome,
        subtitle: `${a.adotanteNome} · Adoção`,
        href: "/adocoes",
      })),
      ...doacoes.map((d) => ({
        id: d.id,
        type: "doacao" as const,
        title: d.doador,
        subtitle: `${d.tipo} · Doação`,
        href: "/doacoes",
      })),
    ].slice(0, 20);

    return NextResponse.json({ results });
  } catch {
    return jsonError("Erro ao buscar", 500);
  }
}
