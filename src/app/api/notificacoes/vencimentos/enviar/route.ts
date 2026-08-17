import { NextResponse } from "next/server";
import { requireAdminSession, jsonError } from "@/lib/api/helpers";
import { processarLembretesEmpresa } from "@/lib/notifications/vencimentos-email";

export async function POST() {
  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  try {
    const result = await processarLembretesEmpresa(auth.session.empresaId);
    return NextResponse.json({ ok: true, result });
  } catch {
    return jsonError("Erro ao processar lembretes", 500);
  }
}
