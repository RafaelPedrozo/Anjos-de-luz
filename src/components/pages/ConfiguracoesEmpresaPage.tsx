"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Card } from "@/components/ui";
import { Button, Input } from "@/components/ui/form";
import { ConfiguracoesLayout } from "./ConfiguracoesLayout";
import { useAuth } from "@/components/auth/AuthProvider";

export function ConfiguracoesEmpresaPage() {
  const { isAdmin, empresa } = useAuth();
  const [form, setForm] = useState({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/empresa");
      if (res.ok) {
        const data = await res.json();
        setForm({
          razaoSocial: data.empresa.razaoSocial ?? "",
          nomeFantasia: data.empresa.nomeFantasia ?? "",
          cnpj: data.empresa.cnpj ?? "",
          telefone: data.empresa.telefone ?? "",
          email: data.empresa.email ?? "",
          endereco: data.empresa.endereco ?? "",
        });
      }
    }
    load();
  }, [empresa?.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isAdmin) return;
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/empresa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    setMessage(res.ok ? "Dados salvos com sucesso" : "Erro ao salvar");
  }

  return (
    <ConfiguracoesLayout>
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Dados da ONG</h2>
        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
          Informações cadastrais da ONG Anjos de Luz
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-4">
          <Input
            label="Razão social"
            value={form.razaoSocial}
            onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
            disabled={!isAdmin}
          />
          <Input
            label="Nome fantasia"
            value={form.nomeFantasia}
            onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })}
            disabled={!isAdmin}
          />
          <Input label="CNPJ" value={form.cnpj} disabled />
          <Input
            label="Telefone"
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            disabled={!isAdmin}
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={!isAdmin}
          />
          <Input
            label="Endereço"
            value={form.endereco}
            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
            disabled={!isAdmin}
          />

          {message && (
            <p className="col-span-2 text-sm text-[var(--color-success)]">{message}</p>
          )}

          {isAdmin && (
            <div className="col-span-2 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </ConfiguracoesLayout>
  );
}
