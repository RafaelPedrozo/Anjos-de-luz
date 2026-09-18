"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui";
import { Button, Input } from "@/components/ui/form";
import { useAuth } from "@/components/auth/AuthProvider";

export function CadastroPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
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

      await refresh();
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
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]">
            <Heart size={24} strokeWidth={2.5} className="text-[var(--color-on-primary)]" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Cadastrar usuário
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Solicite acesso ao controle da ONG Anjos de Luz
            </p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nome completo"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Senha"
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              required
            />

            {error && (
              <p className="rounded-[var(--radius-button)] bg-[var(--color-primary)]/15 px-3 py-2 text-sm text-[var(--color-text-primary)]">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Criar acesso"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-[var(--color-primary-hover)] hover:underline">
              Entrar
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
