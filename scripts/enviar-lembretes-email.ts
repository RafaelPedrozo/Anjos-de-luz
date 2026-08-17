import { processarLembretesTodasEmpresas } from "../src/lib/notifications/vencimentos-email";

async function main() {
  console.log("Iniciando job de lembretes por e-mail...");
  const results = await processarLembretesTodasEmpresas();
  const total = results.reduce((s, r) => s + r.enviados, 0);
  console.log(`Concluído: ${results.length} empresa(s), ${total} e-mail(s) enviado(s).`);
  for (const r of results) {
    if (r.erros.length) {
      console.error(`Empresa ${r.empresaId}:`, r.erros);
    }
  }
}

main().catch(console.error);
