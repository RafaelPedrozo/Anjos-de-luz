"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  DataTable,
  Modal,
  PageToolbar,
  StatCards,
  StatusBadge,
} from "@/components/shared";
import type { TableColumn } from "@/components/shared";
import { Button, Input, Select, Textarea } from "@/components/ui/form";
import {
  buildClientesStats,
  statusToApi,
  type Cliente,
} from "@/data/clientes";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  document: "",
  address: "",
  status: "ATIVO",
};

const statusOptions = [
  { value: "ATIVO", label: "Ativo" },
  { value: "INATIVO", label: "Inativo" },
];

export function ClientesPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState<Cliente[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadClientes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clientes");
      if (!res.ok) {
        setError("Não foi possível carregar os clientes.");
        return;
      }
      const data = await res.json();
      setItems(
        (data.clientes ?? []).map(
          (c: {
            id: string;
            name: string;
            phone: string;
            email: string;
            document: string;
            address: string;
            status: string;
            createdAt: string;
          }) => ({
            id: c.id,
            name: c.name,
            phone: c.phone ?? "",
            email: c.email ?? "",
            document: c.document ?? "",
            address: c.address ?? "",
            status: c.status as Cliente["status"],
            createdAt: c.createdAt,
          }),
        ),
      );
      setError("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.document.toLowerCase().includes(q),
    );
  }, [items, search]);

  const stats = useMemo(() => buildClientesStats(items), [items]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(cliente: Cliente) {
    setEditingId(cliente.id);
    setForm({
      name: cliente.name,
      phone: cliente.phone,
      email: cliente.email,
      document: cliente.document,
      address: cliente.address,
      status: statusToApi(cliente.status),
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este cliente?")) return;
    const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadClientes();
    } else {
      alert("Não foi possível excluir o cliente.");
    }
  }

  const columns: TableColumn<Cliente>[] = [
    { key: "name", header: "Nome", render: (r) => r.name },
    { key: "phone", header: "Telefone", render: (r) => r.phone || "—" },
    { key: "email", header: "E-mail", render: (r) => r.email || "—" },
    { key: "document", header: "Documento", render: (r) => r.document || "—" },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "actions",
      header: "Ações",
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openEdit(r)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Editar cliente"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(r.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
            aria-label="Excluir cliente"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      nome: form.name.trim(),
      telefone: form.phone.trim(),
      email: form.email.trim(),
      documento: form.document.trim(),
      endereco: form.address.trim(),
      status: form.status as "ATIVO" | "INATIVO",
    };

    try {
      const res = editingId
        ? await fetch(`/api/clientes/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/clientes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Não foi possível salvar o cliente.");
        return;
      }

      await loadClientes();
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar clientes..."
        actionLabel="Novo Cliente"
        actionIcon={<Plus size={16} strokeWidth={2} />}
        onAction={openCreate}
      />

      {loading && items.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
          Carregando clientes...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="Nenhum cliente encontrado"
        />
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? "Editar Cliente" : "Novo Cliente"}
        subtitle={
          editingId ? "Atualize os dados do cliente" : "Cadastre um novo cliente"
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(11) 98765-4321"
            />
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contato@empresa.com"
            />
          </div>
          <Input
            label="Documento"
            value={form.document}
            onChange={(e) => setForm({ ...form, document: e.target.value })}
            placeholder="CNPJ ou CPF"
          />
          <Textarea
            label="Endereço"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Rua, número, cidade..."
          />
          <Select
            label="Status"
            options={statusOptions}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
          {error && (
            <p className="text-sm text-[var(--color-primary)]">{error}</p>
          )}
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Salvando..."
                : editingId
                  ? "Salvar Alterações"
                  : "Cadastrar Cliente"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
