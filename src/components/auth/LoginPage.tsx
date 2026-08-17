"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DollarSign } from "lucide-react";
import { Card } from "@/components/ui";
import { Button, Input } from "@/components/ui/form";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao entrar");
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]">
            <DollarSign size={24} strokeWidth={2.5} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">ViaConeta</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Gestão Financeira</p>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white">Entrar</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Acesse sua conta para continuar
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
            <Input
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <p className="rounded-[var(--radius-button)] bg-[var(--color-primary)]/10 px-3 py-2 text-sm text-[var(--color-primary)]">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-medium text-[var(--color-primary)] hover:underline">
              Cadastrar empresa
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
