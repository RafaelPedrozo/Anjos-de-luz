"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthUser {
  id: string;
  nome: string;
  email: string;
  perfil: "ADMINISTRADOR" | "FUNCIONARIO";
  perfilLabel: string;
  initials: string;
  ativo: boolean;
}

interface AuthEmpresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  empresa: AuthEmpresa | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [empresa, setEmpresa] = useState<AuthEmpresa | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function refresh() {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setUser(null);
        setEmpresa(null);
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setEmpresa(data.empresa);
    } catch {
      setUser(null);
      setEmpresa(null);
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setEmpresa(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        empresa,
        loading,
        isAdmin: user?.perfil === "ADMINISTRADOR",
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
