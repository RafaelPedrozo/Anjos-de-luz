"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { KeyRound, Pencil, Plus, UserX } from "lucide-react";
import {
  DataTable,
  Modal,
  PageToolbar,
  StatusBadge,
} from "@/components/shared";
import type { TableColumn } from "@/components/shared";
import { Button, Input, Select } from "@/components/ui/form";
import { useAuth } from "@/components/auth/AuthProvider";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: "ADMINISTRADOR" | "FUNCIONARIO";
  perfilLabel: string;
  ativo: boolean;
  status: string;
}

const emptyForm = {
  nome: "",
  email: "",
  perfil: "FUNCIONARIO",
  senha: "",
};

export function ConfiguracoesUsuariosPage() {
  const { isAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const loadUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios");
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data.usuarios);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadUsuarios();
  }, [isAdmin, loadUsuarios]);

  const filtered = usuarios.filter(
    (u) =>
      search === "" ||
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setTempPassword("");
    setModalOpen(true);
  }

  function openEdit(usuario: Usuario) {
    setEditing(usuario);
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      senha: "",
    });
    setTempPassword("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (editing) {
      const res = await fetch(`/api/usuarios/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          perfil: form.perfil,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Erro ao salvar");
        return;
      }
    } else {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          perfil: form.perfil,
          senha: form.senha || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Erro ao criar");
        return;
      }
      if (data.senhaTemporaria) {
        setTempPassword(data.senhaTemporaria);
      }
    }

    await loadUsuarios();
    if (!tempPassword) setModalOpen(false);
  }

  async function toggleAtivo(usuario: Usuario) {
    const res = await fetch(`/api/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !usuario.ativo }),
    });
    if (res.ok) await loadUsuarios();
  }

  async function resetSenha(usuario: Usuario) {
    const res = await fetch(`/api/usuarios/${usuario.id}/reset-senha`, {
      method: "POST",
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(
        data.senhaTemporaria
          ? `Senha temporária de ${usuario.nome}: ${data.senhaTemporaria}`
          : `Senha redefinida e enviada para ${usuario.email}`,
      );
    }
  }

  const columns: TableColumn<Usuario>[] = [
    { key: "nome", header: "Nome", render: (r) => r.nome },
    { key: "email", header: "E-mail", render: (r) => r.email },
    { key: "perfil", header: "Perfil", render: (r) => r.perfilLabel },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge status={r.ativo ? "ativo" : "inativo"} label={r.ativo ? "Ativo" : "Inativo"} />
      ),
    },
    {
      key: "actions",
      header: "Ações",
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openEdit(r)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white"
            aria-label="Editar"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => resetSenha(r)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10"
            aria-label="Resetar senha"
          >
            <KeyRound size={14} />
          </button>
          <button
            type="button"
            onClick={() => toggleAtivo(r)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
            aria-label={r.ativo ? "Desativar" : "Ativar"}
          >
            <UserX size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center text-sm text-[var(--color-text-secondary)]">
        Acesso restrito a administradores.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {message && (
        <p className="rounded-[var(--radius-button)] bg-[var(--color-success)]/10 px-4 py-3 text-sm text-[var(--color-success)]">
          {message}
        </p>
      )}

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar usuários..."
        actionLabel="Criar Usuário"
        actionIcon={<Plus size={16} strokeWidth={2} />}
        onAction={openCreate}
      />

      {loading ? (
        <div className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
          Carregando...
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} emptyMessage="Nenhum usuário encontrado" />
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setTempPassword("");
        }}
        title={editing ? "Editar Usuário" : "Criar Usuário"}
        subtitle="Gestão de acesso ao sistema"
      >
        {tempPassword ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Usuário criado. Senha temporária:
            </p>
            <p className="rounded-[var(--radius-button)] bg-[var(--color-list-item)] px-4 py-3 font-mono text-sm text-white">
              {tempPassword}
            </p>
            <Button onClick={() => { setModalOpen(false); setTempPassword(""); }}>
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nome"
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
            <Select
              label="Perfil"
              options={[
                { value: "ADMINISTRADOR", label: "Administrador" },
                { value: "FUNCIONARIO", label: "Funcionário" },
              ]}
              value={form.perfil}
              onChange={(e) => setForm({ ...form, perfil: e.target.value })}
            />
            {!editing && (
              <Input
                label="Senha (opcional — gerada automaticamente se vazio)"
                type="password"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
              />
            )}
            {message && modalOpen && (
              <p className="text-sm text-[var(--color-primary)]">{message}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editing ? "Salvar" : "Criar Usuário"}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
