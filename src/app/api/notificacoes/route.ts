import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireSession, jsonError } from "@/lib/api/helpers";

const updateSchema = z.object({
  emailVencimentosAtivo: z.boolean().optional(),
  emailDestino: z.string().email().optional().or(z.literal("")),
  emailDiasAntes: z.number().int().min(1).max(30).optional(),
  emailNoDiaVencimento: z.boolean().optional(),
  emailAtrasados: z.boolean().optional(),
});

function serialize(config: {
  id: string;
  emailVencimentosAtivo: boolean;
  emailDestino: string | null;
  emailDiasAntes: number;
  emailNoDiaVencimento: boolean;
  emailAtrasados: boolean;
}) {
  return {
    id: config.id,
    emailVencimentosAtivo: config.emailVencimentosAtivo,
    emailDestino: config.emailDestino ?? "",
    emailDiasAntes: config.emailDiasAntes,
    emailNoDiaVencimento: config.emailNoDiaVencimento,
    emailAtrasados: config.emailAtrasados,
  };
}

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  let config = await prisma.configNotificacao.findUnique({
    where: { empresaId: auth.session.empresaId },
  });

  if (!config) {
    config = await prisma.configNotificacao.create({
      data: { empresaId: auth.session.empresaId },
    });
  }

  const empresa = await prisma.empresa.findUnique({
    where: { id: auth.session.empresaId },
    select: { email: true },
  });

  const historico = await prisma.lembreteEmail.findMany({
    where: { empresaId: auth.session.empresaId },
    orderBy: { enviadoEm: "desc" },
    take: 20,
    include: {
      contaPagar: { select: { descricao: true, fornecedor: true } },
    },
  });

  return NextResponse.json({
    config: serialize(config),
    emailEmpresa: empresa?.email ?? "",
    historico: historico.map((h) => ({
      id: h.id,
      descricao: h.contaPagar.descricao,
      fornecedor: h.contaPagar.fornecedor,
      tipo: h.tipo,
      email: h.email,
      assunto: h.assunto,
      sucesso: h.sucesso,
      enviadoEm: h.enviadoEm.toISOString(),
    })),
  });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const data = {
      ...parsed.data,
      emailDestino: parsed.data.emailDestino === "" ? null : parsed.data.emailDestino,
    };

    const config = await prisma.configNotificacao.upsert({
      where: { empresaId: auth.session.empresaId },
      create: {
        empresaId: auth.session.empresaId,
        ...data,
      },
      update: data,
    });

    return NextResponse.json({ config: serialize(config) });
  } catch {
    return jsonError("Erro ao salvar configurações", 500);
  }
}
