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
import { Button, Input, Select } from "@/components/ui/form";
import {
  buildEntradasStats,
  type Entrada,
} from "@/data/entradas";
import {
  formatCurrency,
  formatDate,
  incomeCategories,
  paymentMethods,
  periodOptions,
} from "@/data/shared";

const emptyForm = {
  date: "",
  description: "",
  category: "vendas",
  client: "",
  paymentMethod: "pix",
  value: "",
  status: "RECEBIDO",
};

function findOptionValue(
  options: { value: string; label: string }[],
  labelOrValue: string,
) {
  const byLabel = options.find(
    (o) => o.label.toLowerCase() === labelOrValue.toLowerCase(),
  );
  if (byLabel) return byLabel.value;
  const byValue = options.find(
    (o) => o.value.toLowerCase() === labelOrValue.toLowerCase(),
  );
  return byValue?.value ?? options[0]?.value ?? "";
}

export function EntradasPage() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("month");
  const [category, setCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState<Entrada[]>([]);
  const [form, setForm] = useState(emptyForm);

  const categoryOptions = incomeCategories.filter((c) => c.value !== "all");

  const loadEntradas = useCallback(async () => {
    const res = await fetch("/api/entradas");
    if (res.ok) {
      const data = await res.json();
      setItems(
        data.entradas.map((e: {
          id: string;
          date: string;
          description: string;
          category: string;
          client: string;
          paymentMethod: string;
          value: number;
          status: string;
        }) => ({
          id: e.id,
          date: e.date,
          description: e.description,
          category: e.category,
          client: e.client,
          paymentMethod: e.paymentMethod,
          value: e.value,
          status: e.status as Entrada["status"],
        })),
      );
    }
  }, []);

  useEffect(() => {
    loadEntradas();
  }, [loadEntradas]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        search === "" ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.client.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "all" || item.category.toLowerCase().includes(category);
      return matchSearch && matchCategory;
    });
  }, [items, search, category]);

  const stats = useMemo(() => buildEntradasStats(items), [items]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: Entrada) {
    setEditingId(item.id);
    setForm({
      date: item.date,
      description: item.description,
      category: findOptionValue(categoryOptions, item.category),
      client: item.client,
      paymentMethod: findOptionValue(paymentMethods, item.paymentMethod),
      value: String(item.value),
      status: item.status === "recebido" ? "RECEBIDO" : "PENDENTE",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  const columns: TableColumn<Entrada>[] = [
    { key: "date", header: "Data", render: (r) => formatDate(r.date) },
    { key: "description", header: "Descrição", render: (r) => r.description },
    { key: "category", header: "Categoria", render: (r) => r.category },
    { key: "client", header: "Cliente", render: (r) => r.client },
    { key: "payment", header: "Pagamento", render: (r) => r.paymentMethod },
    {
      key: "value",
      header: "Valor",
      render: (r) => (
        <span className="font-semibold text-[var(--color-success)]">
          {formatCurrency(r.value)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge
          status={r.status === "recebido" ? "pago" : "pendente"}
          label={r.status === "recebido" ? "Recebido" : "Pendente"}
        />
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
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Editar entrada"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Excluir esta entrada?")) return;
              const res = await fetch(`/api/entradas/${r.id}`, { method: "DELETE" });
              if (res.ok) await loadEntradas();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
            aria-label="Excluir entrada"
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
      data: form.date,
      descricao: form.description,
      categoria: categoryOptions.find((c) => c.value === form.category)?.label ?? form.category,
      cliente: form.client,
      formaPagamento:
        paymentMethods.find((p) => p.value === form.paymentMethod)?.label ?? form.paymentMethod,
      valor: parseFloat(form.value) || 0,
      status: form.status as "RECEBIDO" | "PENDENTE",
    };

    const res = editingId
      ? await fetch(`/api/entradas/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/entradas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (res.ok) {
      await loadEntradas();
      closeModal();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar entradas..."
        periodValue={period}
        onPeriodChange={setPeriod}
        periodOptions={periodOptions}
        categoryValue={category}
        onCategoryChange={setCategory}
        categoryOptions={incomeCategories}
        actionLabel="Nova Entrada"
        actionIcon={<Plus size={16} strokeWidth={2} />}
        onAction={openCreate}
      />

      <DataTable columns={columns} data={filtered} emptyMessage="Nenhuma entrada encontrada" />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? "Editar Entrada" : "Nova Entrada"}
        subtitle={editingId ? "Atualize os dados do recebimento" : "Registre um recebimento"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <Input
              label="Valor"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              required
            />
          </div>
          <Input
            label="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Categoria"
              options={categoryOptions}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <Select
              label="Forma de pagamento"
              options={paymentMethods}
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            />
          </div>
          <Input
            label="Cliente"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
            required
          />
          <Select
            label="Status"
            options={[
              { value: "RECEBIDO", label: "Recebido" },
              { value: "PENDENTE", label: "Pendente" },
            ]}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingId ? "Salvar Alterações" : "Salvar Entrada"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
