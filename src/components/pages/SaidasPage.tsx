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
import { buildSaidasStats, type Saida } from "@/data/saidas";
import {
  expenseCategories,
  formatCurrency,
  formatDate,
  paymentMethods,
  periodOptions,
} from "@/data/shared";

const emptyForm = {
  date: "",
  description: "",
  category: "fornecedores",
  supplier: "",
  paymentMethod: "pix",
  value: "",
  status: "PAGO",
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

export function SaidasPage() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("month");
  const [category, setCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState<Saida[]>([]);
  const [form, setForm] = useState(emptyForm);

  const categoryOptions = expenseCategories.filter((c) => c.value !== "all");

  const loadSaidas = useCallback(async () => {
    const res = await fetch("/api/saidas");
    if (res.ok) {
      const data = await res.json();
      setItems(
        data.saidas.map((s: {
          id: string;
          date: string;
          description: string;
          category: string;
          supplier: string;
          paymentMethod: string;
          value: number;
          status: string;
        }) => ({
          id: s.id,
          date: s.date,
          description: s.description,
          category: s.category,
          supplier: s.supplier,
          paymentMethod: s.paymentMethod,
          value: s.value,
          status: s.status as Saida["status"],
        })),
      );
    }
  }, []);

  useEffect(() => {
    loadSaidas();
  }, [loadSaidas]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        search === "" ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.supplier.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "all" || item.category.toLowerCase().includes(category);
      return matchSearch && matchCategory;
    });
  }, [items, search, category]);

  const stats = useMemo(() => buildSaidasStats(items), [items]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: Saida) {
    setEditingId(item.id);
    setForm({
      date: item.date,
      description: item.description,
      category: findOptionValue(categoryOptions, item.category),
      supplier: item.supplier,
      paymentMethod: findOptionValue(paymentMethods, item.paymentMethod),
      value: String(item.value),
      status: item.status === "pago" ? "PAGO" : "PENDENTE",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  const columns: TableColumn<Saida>[] = [
    { key: "date", header: "Data", render: (r) => formatDate(r.date) },
    { key: "description", header: "Descrição", render: (r) => r.description },
    { key: "category", header: "Categoria", render: (r) => r.category },
    { key: "supplier", header: "Fornecedor", render: (r) => r.supplier },
    { key: "payment", header: "Pagamento", render: (r) => r.paymentMethod },
    {
      key: "value",
      header: "Valor",
      render: (r) => (
        <span className="font-semibold text-[var(--color-primary)]">
          {formatCurrency(r.value)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge status={r.status === "pago" ? "pago" : "pendente"} />
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
            aria-label="Editar despesa"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Excluir esta despesa?")) return;
              const res = await fetch(`/api/saidas/${r.id}`, { method: "DELETE" });
              if (res.ok) await loadSaidas();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
            aria-label="Excluir despesa"
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
      fornecedor: form.supplier,
      formaPagamento:
        paymentMethods.find((p) => p.value === form.paymentMethod)?.label ?? form.paymentMethod,
      valor: parseFloat(form.value) || 0,
      status: form.status as "PAGO" | "PENDENTE",
    };

    const res = editingId
      ? await fetch(`/api/saidas/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/saidas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (res.ok) {
      await loadSaidas();
      closeModal();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar despesas..."
        periodValue={period}
        onPeriodChange={setPeriod}
        periodOptions={periodOptions}
        categoryValue={category}
        onCategoryChange={setCategory}
        categoryOptions={expenseCategories}
        actionLabel="Nova Despesa"
        actionIcon={<Plus size={16} strokeWidth={2} />}
        onAction={openCreate}
      />

      <DataTable columns={columns} data={filtered} emptyMessage="Nenhuma despesa encontrada" />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? "Editar Despesa" : "Nova Despesa"}
        subtitle={editingId ? "Atualize os dados da saída" : "Registre uma saída financeira"}
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
            label="Fornecedor"
            value={form.supplier}
            onChange={(e) => setForm({ ...form, supplier: e.target.value })}
            required
          />
          <Select
            label="Status"
            options={[
              { value: "PAGO", label: "Pago" },
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
              {editingId ? "Salvar Alterações" : "Salvar Despesa"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
