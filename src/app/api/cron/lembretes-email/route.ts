import { NextResponse } from "next/server";
import { processarLembretesTodasEmpresas } from "@/lib/notifications/vencimentos-email";
import { jsonError } from "@/lib/api/helpers";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== expected) {
    return jsonError("Não autorizado", 401);
  }

  try {
    const results = await processarLembretesTodasEmpresas();
    const totalEnviados = results.reduce((sum, r) => sum + r.enviados, 0);

    return NextResponse.json({
      ok: true,
      empresas: results.length,
      totalEnviados,
      results,
    });
  } catch {
    return jsonError("Erro no job de lembretes", 500);
  }
}
