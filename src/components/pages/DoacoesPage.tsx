"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { HandCoins, Pencil, Plus, Trash2 } from "lucide-react";
import {
  DataTable,
  Modal,
  PageToolbar,
  StatCards,
} from "@/components/shared";
import type { TableColumn } from "@/components/shared";
import { Button, Input, Select } from "@/components/ui/form";
import { formatCurrency, formatDate, paymentMethods } from "@/data/shared";

interface Doacao {
  id: string;
  valor: number;
  tipo: "PIX" | "CARTAO";
  doador: string;
  data: string;
}

const emptyForm = {
  valor: "",
  tipo: "PIX",
  doador: "",
  data: "",
};

export function DoacoesPage() {
  const [items, setItems] = useState<Doacao[]>([]);
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const res = await fetch("/api/doacoes");
    if (res.ok) {
      const data = await res.json();
      setItems(data.doacoes);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        search === "" || item.doador.toLowerCase().includes(search.toLowerCase());
      const matchTipo = tipo === "all" || item.tipo === tipo;
      return matchSearch && matchTipo;
    });
  }, [items, search, tipo]);

  const total = items.reduce((sum, i) => sum + i.valor, 0);

  const stats = [
    {
      id: "total",
      label: "Total arrecadado",
      value: formatCurrency(total),
      icon: HandCoins,
      iconColor: "success" as const,
    },
    {
      id: "qtd",
      label: "Doações",
      value: String(items.length),
      icon: HandCoins,
      iconColor: "primary" as const,
    },
  ];

  const columns: TableColumn<Doacao>[] = [
    { key: "data", header: "Data", render: (r) => formatDate(r.data) },
    { key: "doador", header: "Doador", render: (r) => r.doador },
    { key: "tipo", header: "Tipo", render: (r) => (r.tipo === "PIX" ? "PIX" : "Cartão") },
    {
      key: "valor",
      header: "Valor",
      render: (r) => (
        <span className="font-semibold text-[var(--color-success)]">{formatCurrency(r.valor)}</span>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setEditingId(r.id);
              setForm({
                valor: String(r.valor),
                tipo: r.tipo,
                doador: r.doador,
                data: r.data,
              });
              setModalOpen(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)]"
            aria-label="Editar doação"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Excluir esta doação?")) return;
              const res = await fetch(`/api/doacoes/${r.id}`, { method: "DELETE" });
              if (res.ok) await load();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
            aria-label="Excluir doação"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      valor: parseFloat(form.valor) || 0,
      tipo: form.tipo,
      doador: form.doador,
      data: form.data,
    };
    const res = editingId
      ? await fetch(`/api/doacoes/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/doacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    if (res.ok) {
      await load();
      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar doadores..."
        categoryValue={tipo}
        onCategoryChange={setTipo}
        categoryOptions={[
          { value: "all", label: "Todos os tipos" },
          ...paymentMethods,
        ]}
        actionLabel="Nova doação"
        actionIcon={<Plus size={16} strokeWidth={2} />}
        onAction={() => {
          setEditingId(null);
          setForm(emptyForm);
          setModalOpen(true);
        }}
      />
      <DataTable columns={columns} data={filtered} emptyMessage="Nenhuma doação registrada" />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar doação" : "Nova doação"}
        subtitle="Registro de doação em dinheiro"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Doador"
            value={form.doador}
            onChange={(e) => setForm({ ...form, doador: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor"
              type="number"
              step="0.01"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              required
            />
            <Select
              label="Tipo"
              options={paymentMethods}
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            />
          </div>
          <Input
            label="Data"
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
            required
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editingId ? "Salvar" : "Registrar"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
