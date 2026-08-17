import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: port === 2525 ? { rejectUnauthorized: false } : undefined,
  });
}

export async function sendPasswordResetEmail(to: string, nome: string, senhaTemporaria: string) {
  const transport = createTransport();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const subject = "ViaConeta — Senha redefinida";
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #E60023;">ViaConeta</h2>
      <p>Olá, <strong>${nome}</strong>.</p>
      <p>Sua senha foi redefinida por um administrador.</p>
      <p><strong>Nova senha temporária:</strong> ${senhaTemporaria}</p>
      <p>Acesse o sistema e altere sua senha o quanto antes.</p>
      <p><a href="${appUrl}/login" style="color: #E60023;">Entrar no ViaConeta</a></p>
    </div>
  `;

  if (!transport || !from) {
    console.info("[mail:dev] Senha redefinida para", to, ":", senhaTemporaria);
    return { sent: false, devMode: true };
  }

  await transport.sendMail({ from, to, subject, html });
  return { sent: true, devMode: false };
}

export async function sendWelcomeEmail(to: string, nome: string, senha: string) {
  const transport = createTransport();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const subject = "ViaConeta — Bem-vindo ao sistema";
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #E60023;">ViaConeta</h2>
      <p>Olá, <strong>${nome}</strong>.</p>
      <p>Sua conta foi criada com sucesso.</p>
      <p><strong>Senha de acesso:</strong> ${senha}</p>
      <p><a href="${appUrl}/login" style="color: #E60023;">Acessar o sistema</a></p>
    </div>
  `;

  if (!transport || !from) {
    console.info("[mail:dev] Conta criada para", to, "senha:", senha);
    return { sent: false, devMode: true };
  }

  await transport.sendMail({ from, to, subject, html });
  return { sent: true, devMode: false };
}

export interface MailResult {
  sent: boolean;
  devMode: boolean;
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<MailResult> {
  const transport = createTransport();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  if (!transport || !from) {
    console.info("[mail:dev]", to, "→", subject);
    console.info("[mail:dev]", text);
    return { sent: false, devMode: true };
  }

  await transport.sendMail({ from, to, subject, html, text });
  console.info("[mail:sent]", to, "→", subject);
  return { sent: true, devMode: false };
}

export async function sendVencimentoEmail(
  to: string,
  assunto: string,
  corpoTexto: string,
  dados: { descricao: string; fornecedor: string; valor: string; vencimento: string },
) {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #0F1324; color: #fff; border-radius: 16px;">
      <h2 style="color: #E60023; margin: 0 0 16px;">ViaConeta</h2>
      <p style="color: #949494; margin: 0 0 20px;">Lembrete de vencimento</p>
      <div style="background: #16161D; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${dados.descricao}</p>
        <p style="margin: 0 0 4px; color: #949494; font-size: 14px;">Fornecedor: ${dados.fornecedor}</p>
        <p style="margin: 0 0 4px; color: #949494; font-size: 14px;">Vencimento: ${dados.vencimento}</p>
        <p style="margin: 8px 0 0; font-size: 18px; font-weight: 700; color: #E60023;">${dados.valor}</p>
      </div>
      <p style="color: #949494; font-size: 13px; margin: 0;">${corpoTexto}</p>
      <p style="margin-top: 24px;">
        <a href="${appUrl}/contas-a-pagar" style="color: #E60023; text-decoration: none; font-weight: 500;">
          Ver contas a pagar →
        </a>
      </p>
    </div>
  `;

  return sendEmail(to, assunto, html, corpoTexto);
}
