"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DollarSign } from "lucide-react";
import { Card } from "@/components/ui";
import { Button, Input } from "@/components/ui/form";

export function CadastroPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    adminNome: "",
    adminEmail: "",
    adminSenha: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao cadastrar");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]">
            <DollarSign size={24} strokeWidth={2.5} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Cadastrar Empresa</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Crie sua conta e comece a usar o ViaConeta
            </p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <h2 className="text-base font-semibold text-white">Dados da empresa</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Input
                  label="Razão social"
                  value={form.razaoSocial}
                  onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
                  required
                />
                <Input
                  label="Nome fantasia"
                  value={form.nomeFantasia}
                  onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })}
                  required
                />
                <Input
                  label="CNPJ"
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  required
                />
                <Input
                  label="Telefone"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
                <Input
                  label="E-mail da empresa"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <Input
                  label="Endereço"
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                />
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">Administrador</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  value={form.adminNome}
                  onChange={(e) => setForm({ ...form, adminNome: e.target.value })}
                  required
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={form.adminEmail}
                  onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                  required
                />
                <Input
                  label="Senha"
                  type="password"
                  className="col-span-2"
                  value={form.adminSenha}
                  onChange={(e) => setForm({ ...form, adminSenha: e.target.value })}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-[var(--radius-button)] bg-[var(--color-primary)]/10 px-3 py-2 text-sm text-[var(--color-primary)]">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Criar conta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-[var(--color-primary)] hover:underline">
              Entrar
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
