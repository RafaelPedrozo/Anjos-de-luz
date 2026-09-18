"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { HeartHandshake, Pencil, Plus, Trash2 } from "lucide-react";
import {
  DataTable,
  Modal,
  PageToolbar,
  StatCards,
} from "@/components/shared";
import type { TableColumn } from "@/components/shared";
import { Button, Input, Select } from "@/components/ui/form";
import { formatDate } from "@/data/shared";

interface AnimalOption {
  id: string;
  nome: string;
  especie: string;
  status: string;
}

interface Adocao {
  id: string;
  animalId: string;
  animalNome: string;
  animalEspecie: string;
  adotanteNome: string;
  adotanteEmail: string;
  adotanteTelefone: string;
  data: string;
}

const emptyForm = {
  animalId: "",
  adotanteNome: "",
  adotanteEmail: "",
  adotanteTelefone: "",
  data: "",
};

export function AdocoesPage() {
  const [items, setItems] = useState<Adocao[]>([]);
  const [animais, setAnimais] = useState<AnimalOption[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const [aRes, anRes] = await Promise.all([fetch("/api/adocoes"), fetch("/api/animais")]);
    if (aRes.ok) {
      const data = await aRes.json();
      setItems(data.adocoes);
    }
    if (anRes.ok) {
      const data = await anRes.json();
      setAnimais(data.animais);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return items.filter(
      (item) =>
        search === "" ||
        item.animalNome.toLowerCase().includes(search.toLowerCase()) ||
        item.adotanteNome.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  const animalOptions = animais
    .filter((a) => a.status !== "ADOTADO" || a.id === form.animalId)
    .map((a) => ({ value: a.id, label: `${a.nome} (${a.especie})` }));

  const stats = [
    {
      id: "total",
      label: "Adoções",
      value: String(items.length),
      icon: HeartHandshake,
      iconColor: "success" as const,
    },
    {
      id: "mes",
      label: "Neste mês",
      value: String(
        items.filter((i) => {
          const now = new Date();
          const [y, m] = i.data.split("-").map(Number);
          return y === now.getFullYear() && m === now.getMonth() + 1;
        }).length,
      ),
      icon: HeartHandshake,
      iconColor: "primary" as const,
    },
  ];

  const columns: TableColumn<Adocao>[] = [
    { key: "data", header: "Data", render: (r) => formatDate(r.data) },
    { key: "animal", header: "Animal", render: (r) => r.animalNome },
    { key: "especie", header: "Espécie", render: (r) => r.animalEspecie },
    { key: "adotante", header: "Adotante", render: (r) => r.adotanteNome },
    { key: "contato", header: "Contato", render: (r) => r.adotanteTelefone || r.adotanteEmail || "—" },
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
                animalId: r.animalId,
                adotanteNome: r.adotanteNome,
                adotanteEmail: r.adotanteEmail,
                adotanteTelefone: r.adotanteTelefone,
                data: r.data,
              });
              setModalOpen(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)]"
            aria-label="Editar adoção"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Excluir esta adoção?")) return;
              const res = await fetch(`/api/adocoes/${r.id}`, { method: "DELETE" });
              if (res.ok) await load();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
            aria-label="Excluir adoção"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = editingId
      ? await fetch(`/api/adocoes/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      : await fetch("/api/adocoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
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
        searchPlaceholder="Pesquisar adoções..."
        actionLabel="Nova adoção"
        actionIcon={<Plus size={16} strokeWidth={2} />}
        onAction={() => {
          setEditingId(null);
          setForm({ ...emptyForm, animalId: animalOptions[0]?.value ?? "" });
          setModalOpen(true);
        }}
      />
      <DataTable columns={columns} data={filtered} emptyMessage="Nenhuma adoção registrada" />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar adoção" : "Nova adoção"}
        subtitle="Vínculo entre animal e adotante"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            label="Animal"
            options={animalOptions}
            value={form.animalId}
            onChange={(e) => setForm({ ...form, animalId: e.target.value })}
          />
          <Input
            label="Nome do adotante"
            value={form.adotanteNome}
            onChange={(e) => setForm({ ...form, adotanteNome: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="E-mail"
              type="email"
              value={form.adotanteEmail}
              onChange={(e) => setForm({ ...form, adotanteEmail: e.target.value })}
            />
            <Input
              label="Telefone"
              value={form.adotanteTelefone}
              onChange={(e) => setForm({ ...form, adotanteTelefone: e.target.value })}
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
