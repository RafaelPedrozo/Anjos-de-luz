import { config } from "dotenv";
import nodemailer from "nodemailer";

config({ path: ".env" });

async function main() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.error("Variáveis SMTP incompletas. Verifique o .env e reinicie o terminal.");
    process.exit(1);
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: port === 2525 ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await transport.verify();
    console.log("Conexão SMTP OK (Mailtrap)");

    const info = await transport.sendMail({
      from: process.env.SMTP_FROM ?? user,
      to: "teste@viaconeta.com.br",
      subject: "ViaConeta — Teste Mailtrap",
      text: "Se aparecer na inbox do Mailtrap, está funcionando.",
      html: "<p>Se aparecer na inbox do Mailtrap, está funcionando.</p>",
    });

    console.log("E-mail enviado com sucesso. Confira a inbox do Mailtrap.");
    console.log("Message ID:", info.messageId);
  } catch (err) {
    console.error("Erro ao enviar:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
