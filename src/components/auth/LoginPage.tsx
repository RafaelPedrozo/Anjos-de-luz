"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui";
import { Button, Input } from "@/components/ui/form";
import { useAuth } from "@/components/auth/AuthProvider";

export function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
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

      await refresh();
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
            <Heart size={24} strokeWidth={2.5} className="text-[var(--color-on-primary)]" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Anjos de Luz</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Controle de animais, resgates, adoções e doações</p>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Entrar</h2>
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
              <p className="rounded-[var(--radius-button)] bg-[var(--color-primary)]/15 px-3 py-2 text-sm text-[var(--color-text-primary)]">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-medium text-[var(--color-primary-hover)] hover:underline">
              Cadastrar usuário
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
