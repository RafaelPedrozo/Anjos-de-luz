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

  const subject = "Anjos de Luz — Senha redefinida";
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #FFF8F0;">
      <h2 style="color: #2F453A;">Anjos de Luz</h2>
      <p>Olá, <strong>${nome}</strong>.</p>
      <p>Sua senha foi redefinida por um administrador.</p>
      <p><strong>Nova senha temporária:</strong> ${senhaTemporaria}</p>
      <p>Acesse o sistema e altere sua senha o quanto antes.</p>
      <p><a href="${appUrl}/login" style="color: #E08A45;">Entrar no Anjos de Luz</a></p>
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

  const subject = "Anjos de Luz — Bem-vindo ao sistema";
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #FFF8F0;">
      <h2 style="color: #2F453A;">Anjos de Luz</h2>
      <p>Olá, <strong>${nome}</strong>.</p>
      <p>Sua conta de acesso à gestão financeira da ONG foi criada com sucesso.</p>
      <p><strong>Senha de acesso:</strong> ${senha}</p>
      <p><a href="${appUrl}/login" style="color: #E08A45;">Acessar o sistema</a></p>
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
    <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #FFF8F0; color: #2F453A; border-radius: 16px;">
      <h2 style="color: #2F453A; margin: 0 0 16px;">Anjos de Luz</h2>
      <p style="color: #5C7268; margin: 0 0 20px;">Lembrete de vencimento</p>
      <div style="background: #FFFFFF; border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid rgba(47,69,58,0.14);">
        <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${dados.descricao}</p>
        <p style="margin: 0 0 4px; color: #5C7268; font-size: 14px;">Fornecedor: ${dados.fornecedor}</p>
        <p style="margin: 0 0 4px; color: #5C7268; font-size: 14px;">Vencimento: ${dados.vencimento}</p>
        <p style="margin: 8px 0 0; font-size: 18px; font-weight: 700; color: #E08A45;">${dados.valor}</p>
      </div>
      <p style="color: #5C7268; font-size: 13px; margin: 0;">${corpoTexto}</p>
      <p style="margin-top: 24px;">
        <a href="${appUrl}/doacoes" style="color: #E08A45; text-decoration: none; font-weight: 500;">
          Ver doações →
        </a>
      </p>
    </div>
  `;

  return sendEmail(to, assunto, html, corpoTexto);
}
