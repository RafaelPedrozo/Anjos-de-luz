"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import { Card } from "@/components/ui";
import { Button, Input, Select } from "@/components/ui/form";
import { ConfiguracoesLayout } from "./ConfiguracoesLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { StatusBadge } from "@/components/shared";

interface NotificacaoConfig {
  emailVencimentosAtivo: boolean;
  emailDestino: string;
  emailDiasAntes: number;
  emailNoDiaVencimento: boolean;
  emailAtrasados: boolean;
}

interface HistoricoItem {
  id: string;
  descricao: string;
  fornecedor: string;
  tipo: string;
  email: string;
  assunto: string;
  sucesso: boolean;
  enviadoEm: string;
}

const tipoLabels: Record<string, string> = {
  ANTES_VENCIMENTO: "Antes do vencimento",
  DIA_VENCIMENTO: "No dia do vencimento",
  ATRASADO: "Atrasado",
};

export function ConfiguracoesNotificacoesPage() {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState<NotificacaoConfig>({
    emailVencimentosAtivo: false,
    emailDestino: "",
    emailDiasAntes: 3,
    emailNoDiaVencimento: true,
    emailAtrasados: true,
  });
  const [emailEmpresa, setEmailEmpresa] = useState("");
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/notificacoes");
    if (res.ok) {
      const data = await res.json();
      setForm(data.config);
      setEmailEmpresa(data.emailEmpresa ?? "");
      setHistorico(data.historico);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isAdmin) return;
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/notificacoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    setMessage(res.ok ? "Configurações salvas" : "Erro ao salvar");
    if (res.ok) await load();
  }

  async function enviarAgora() {
    if (!isAdmin) return;
    setSending(true);
    setMessage("");

    const res = await fetch("/api/notificacoes/vencimentos/enviar", { method: "POST" });
    const data = await res.json();

    setSending(false);
    if (res.ok) {
      setMessage(
        `Processado: ${data.result.enviados} e-mail(s) enviado(s), ${data.result.ignorados} ignorado(s).`,
      );
      await load();
    } else {
      setMessage(data.error ?? "Erro ao enviar");
    }
  }

  return (
    <ConfiguracoesLayout>
      <Card className="p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
            <Mail size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Lembretes de vencimento por e-mail</h2>
            <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
              Alertas automáticos de boletos e contas a pagar via Nodemailer
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex cursor-pointer items-center justify-between rounded-[10px] bg-[var(--color-list-item)] px-4 py-3.5">
            <span className="text-sm text-[var(--color-text-primary)]">Ativar lembretes por e-mail</span>
            <input
              type="checkbox"
              checked={form.emailVencimentosAtivo}
              onChange={(e) => setForm({ ...form, emailVencimentosAtivo: e.target.checked })}
              disabled={!isAdmin}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="E-mail de destino (opcional)"
                type="email"
                placeholder={emailEmpresa || "contato@anjosdeluz.org"}
                value={form.emailDestino}
                onChange={(e) => setForm({ ...form, emailDestino: e.target.value })}
                disabled={!isAdmin}
              />
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Vazio = usa o e-mail da ONG ({emailEmpresa || "não cadastrado"})
              </p>
            </div>
            <Select
              label="Avisar quantos dias antes"
              options={[1, 2, 3, 5, 7, 10, 15].map((d) => ({
                value: String(d),
                label: `${d} dia(s) antes`,
              }))}
              value={String(form.emailDiasAntes)}
              onChange={(e) =>
                setForm({ ...form, emailDiasAntes: Number(e.target.value) })
              }
              disabled={!isAdmin}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex cursor-pointer items-center justify-between rounded-[10px] bg-[var(--color-list-item)] px-4 py-3.5">
              <span className="text-sm text-[var(--color-text-primary)]">No dia do vencimento</span>
              <input
                type="checkbox"
                checked={form.emailNoDiaVencimento}
                onChange={(e) => setForm({ ...form, emailNoDiaVencimento: e.target.checked })}
                disabled={!isAdmin}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-[10px] bg-[var(--color-list-item)] px-4 py-3.5">
              <span className="text-sm text-[var(--color-text-primary)]">Contas atrasadas</span>
              <input
                type="checkbox"
                checked={form.emailAtrasados}
                onChange={(e) => setForm({ ...form, emailAtrasados: e.target.checked })}
                disabled={!isAdmin}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
            </label>
          </div>

          {message && (
            <p className="text-sm text-[var(--color-success)]">{message}</p>
          )}

          {isAdmin && (
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar configurações"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={enviarAgora}
                disabled={sending || !form.emailVencimentosAtivo}
              >
                <Send size={16} />
                {sending ? "Enviando..." : "Enviar lembretes agora"}
              </Button>
            </div>
          )}
        </form>

        <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
          Configure SMTP no arquivo .env. Sem SMTP, os e-mails aparecem no console do servidor.
        </p>
      </Card>

      {historico.length > 0 && (
        <Card className="p-6">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Histórico de e-mails</h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {historico.map((item) => (
              <li
                key={item.id}
                className="rounded-[10px] bg-[var(--color-list-item)] px-4 py-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.assunto}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {item.descricao} · {item.fornecedor} · {tipoLabels[item.tipo] ?? item.tipo}
                    </p>
                  </div>
                  <StatusBadge
                    status={item.sucesso ? "ativo" : "inativo"}
                    label={item.sucesso ? "Enviado" : "Falhou"}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  {new Date(item.enviadoEm).toLocaleString("pt-BR")} → {item.email}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </ConfiguracoesLayout>
  );
}
