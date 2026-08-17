"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
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
  buildContasStats,
  contaStatusVariant,
  resolveContaStatus,
  statusToApi,
  type ContaPagar,
} from "@/data/contas-a-pagar";
import { formatCurrency, formatDate, periodOptions } from "@/data/shared";

const emptyForm = {
  description: "",
  supplier: "",
  value: "",
  dueDate: "",
  status: "PENDENTE",
};

const statusOptions = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "PAGO", label: "Pago" },
  { value: "ATRASADO", label: "Atrasado" },
];

export function ContasAPagarPage() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState<ContaPagar[]>([]);
  const [form, setForm] = useState(emptyForm);

  const loadContas = useCallback(async () => {
    const res = await fetch("/api/contas-a-pagar");
    if (res.ok) {
      const data = await res.json();
      setItems(
        data.contas.map(
          (c: {
            id: string;
            description: string;
            supplier: string;
            value: number;
            dueDate: string;
            status: string;
          }) => ({
            id: c.id,
            description: c.description,
            supplier: c.supplier,
            value: c.value,
            dueDate: c.dueDate,
            status: c.status as ContaPagar["status"],
          }),
        ),
      );
    }
  }, []);

  useEffect(() => {
    loadContas();
  }, [loadContas]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      return (
        search === "" ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.supplier.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [items, search]);

  const stats = useMemo(() => buildContasStats(items), [items]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: ContaPagar) {
    setEditingId(item.id);
    setForm({
      description: item.description,
      supplier: item.supplier,
      value: String(item.value),
      dueDate: item.dueDate,
      status: statusToApi(item.status),
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  const columns: TableColumn<ContaPagar>[] = [
    { key: "description", header: "Descrição", render: (r) => r.description },
    { key: "supplier", header: "Fornecedor", render: (r) => r.supplier },
    { key: "dueDate", header: "Vencimento", render: (r) => formatDate(r.dueDate) },
    {
      key: "value",
      header: "Valor",
      render: (r) => <span className="font-semibold">{formatCurrency(r.value)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge status={contaStatusVariant(resolveContaStatus(r))} />
      ),
    },
    {
      key: "actions",
      header: "Ações",
      render: (r) => (
        <div className="flex items-center gap-1">
          {resolveContaStatus(r) !== "pago" && (
            <button
              type="button"
              onClick={async () => {
                const res = await fetch(`/api/contas-a-pagar/${r.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "PAGO" }),
                });
                if (res.ok) await loadContas();
              }}
              className="mr-1 flex items-center gap-1.5 text-xs font-medium text-[var(--color-success)] transition-colors hover:text-[var(--color-success-muted)]"
            >
              <Check size={14} />
              Marcar pago
            </button>
          )}
          <button
            type="button"
            onClick={() => openEdit(r)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Editar conta"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Excluir esta conta a pagar?")) return;
              const res = await fetch(`/api/contas-a-pagar/${r.id}`, {
                method: "DELETE",
              });
              if (res.ok) await loadContas();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
            aria-label="Excluir conta"
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
      descricao: form.description,
      fornecedor: form.supplier,
      valor: parseFloat(form.value) || 0,
      vencimento: form.dueDate,
      status: form.status as "PENDENTE" | "PAGO" | "ATRASADO",
    };

    const res = editingId
      ? await fetch(`/api/contas-a-pagar/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/contas-a-pagar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (res.ok) {
      await loadContas();
      closeModal();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar contas..."
        periodValue={period}
        onPeriodChange={setPeriod}
        periodOptions={periodOptions}
        actionLabel="Nova Conta"
        actionIcon={<Plus size={16} strokeWidth={2} />}
        onAction={openCreate}
      />

      <DataTable columns={columns} data={filtered} emptyMessage="Nenhuma conta encontrada" />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
        subtitle={
          editingId ? "Atualize os dados do vencimento" : "Cadastre um vencimento"
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <Input
            label="Fornecedor"
            value={form.supplier}
            onChange={(e) => setForm({ ...form, supplier: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor"
              type="number"
              step="0.01"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              required
            />
            <Input
              label="Data de vencimento"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </div>
          <Select
            label="Status"
            options={statusOptions}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingId ? "Salvar Alterações" : "Salvar Conta"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
