"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { PawPrint, Pencil, Plus, Trash2 } from "lucide-react";
import {
  DataTable,
  Modal,
  PageToolbar,
  StatCards,
  StatusBadge,
} from "@/components/shared";
import type { StatusVariant, TableColumn } from "@/components/shared";
import { Button, Input, Select } from "@/components/ui/form";
import { Card } from "@/components/ui";
import {
  especiesOptions,
  formatCurrency,
  formatDate,
  statusAnimalOptions,
} from "@/data/shared";

interface Animal {
  id: string;
  nome: string;
  especie: string;
  status: "DISPONIVEL" | "ADOTADO" | "TRATAMENTO";
  foto: string;
  dataResgate: string;
}

interface Resgate {
  id: string;
  animalId: string;
  animalNome: string;
  local: string;
  custos: number;
  descricao: string;
  data: string;
}

const emptyAnimal = {
  nome: "",
  especie: "Cão",
  status: "DISPONIVEL",
  foto: "",
  dataResgate: "",
};

const emptyResgate = {
  animalId: "",
  local: "",
  custos: "",
  descricao: "",
  data: "",
};

function statusVariant(status: Animal["status"]): StatusVariant {
  if (status === "ADOTADO") return "adotado";
  if (status === "TRATAMENTO") return "tratamento";
  return "disponivel";
}

export function AnimaisPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [resgates, setResgates] = useState<Resgate[]>([]);
  const [search, setSearch] = useState("");
  const [especie, setEspecie] = useState("all");
  const [animalModal, setAnimalModal] = useState(false);
  const [resgateModal, setResgateModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<string | null>(null);
  const [editingResgate, setEditingResgate] = useState<string | null>(null);
  const [animalForm, setAnimalForm] = useState(emptyAnimal);
  const [resgateForm, setResgateForm] = useState(emptyResgate);

  const load = useCallback(async () => {
    const [aRes, rRes] = await Promise.all([fetch("/api/animais"), fetch("/api/resgates")]);
    if (aRes.ok) {
      const data = await aRes.json();
      setAnimais(data.animais);
    }
    if (rRes.ok) {
      const data = await rRes.json();
      setResgates(data.resgates);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredAnimais = useMemo(() => {
    return animais.filter((item) => {
      const matchSearch =
        search === "" ||
        item.nome.toLowerCase().includes(search.toLowerCase()) ||
        item.especie.toLowerCase().includes(search.toLowerCase());
      const matchEspecie = especie === "all" || item.especie === especie;
      return matchSearch && matchEspecie;
    });
  }, [animais, search, especie]);

  const stats = [
    {
      id: "total",
      label: "Animais",
      value: String(animais.length),
      icon: PawPrint,
      iconColor: "success" as const,
    },
    {
      id: "disp",
      label: "Disponíveis",
      value: String(animais.filter((a) => a.status === "DISPONIVEL").length),
      icon: PawPrint,
      iconColor: "primary" as const,
    },
    {
      id: "trat",
      label: "Em tratamento",
      value: String(animais.filter((a) => a.status === "TRATAMENTO").length),
      icon: PawPrint,
      iconColor: "warning" as const,
    },
    {
      id: "custos",
      label: "Custos de resgate",
      value: formatCurrency(resgates.reduce((sum, r) => sum + r.custos, 0)),
      icon: PawPrint,
      iconColor: "purple" as const,
    },
  ];

  const animalOptions = animais.map((a) => ({ value: a.id, label: `${a.nome} (${a.especie})` }));

  const animalColumns: TableColumn<Animal>[] = [
    { key: "nome", header: "Nome", render: (r) => r.nome },
    { key: "especie", header: "Espécie", render: (r) => r.especie },
    { key: "data", header: "Resgate", render: (r) => formatDate(r.dataResgate) },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={statusVariant(r.status)} />,
    },
    {
      key: "actions",
      header: "Ações",
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setEditingAnimal(r.id);
              setAnimalForm({
                nome: r.nome,
                especie: r.especie,
                status: r.status,
                foto: r.foto,
                dataResgate: r.dataResgate,
              });
              setAnimalModal(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)]"
            aria-label="Editar animal"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Excluir este animal?")) return;
              const res = await fetch(`/api/animais/${r.id}`, { method: "DELETE" });
              if (res.ok) await load();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
            aria-label="Excluir animal"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const resgateColumns: TableColumn<Resgate>[] = [
    { key: "data", header: "Data", render: (r) => formatDate(r.data) },
    { key: "animal", header: "Animal", render: (r) => r.animalNome },
    { key: "local", header: "Local", render: (r) => r.local },
    { key: "descricao", header: "Descrição", render: (r) => r.descricao },
    {
      key: "custos",
      header: "Custos",
      render: (r) => formatCurrency(r.custos),
    },
    {
      key: "actions",
      header: "Ações",
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setEditingResgate(r.id);
              setResgateForm({
                animalId: r.animalId,
                local: r.local,
                custos: String(r.custos),
                descricao: r.descricao,
                data: r.data,
              });
              setResgateModal(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)]"
            aria-label="Editar resgate"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Excluir este resgate?")) return;
              const res = await fetch(`/api/resgates/${r.id}`, { method: "DELETE" });
              if (res.ok) await load();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
            aria-label="Excluir resgate"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  async function submitAnimal(e: FormEvent) {
    e.preventDefault();
    const payload = {
      nome: animalForm.nome,
      especie: animalForm.especie,
      status: animalForm.status,
      foto: animalForm.foto,
      dataResgate: animalForm.dataResgate,
    };
    const res = editingAnimal
      ? await fetch(`/api/animais/${editingAnimal}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/animais", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    if (res.ok) {
      await load();
      setAnimalModal(false);
      setEditingAnimal(null);
      setAnimalForm(emptyAnimal);
    }
  }

  async function submitResgate(e: FormEvent) {
    e.preventDefault();
    const payload = {
      animalId: resgateForm.animalId,
      local: resgateForm.local,
      custos: parseFloat(resgateForm.custos) || 0,
      descricao: resgateForm.descricao,
      data: resgateForm.data,
    };
    const res = editingResgate
      ? await fetch(`/api/resgates/${editingResgate}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/resgates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    if (res.ok) {
      await load();
      setResgateModal(false);
      setEditingResgate(null);
      setResgateForm(emptyResgate);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar animais..."
        categoryValue={especie}
        onCategoryChange={setEspecie}
        categoryOptions={especiesOptions}
        actionLabel="Novo animal"
        actionIcon={<Plus size={16} strokeWidth={2} />}
        onAction={() => {
          setEditingAnimal(null);
          setAnimalForm(emptyAnimal);
          setAnimalModal(true);
        }}
      />

      <DataTable columns={animalColumns} data={filteredAnimais} emptyMessage="Nenhum animal cadastrado" />

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Resgates</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">Local, custos e descrição</p>
          </div>
          <Button
            onClick={() => {
              setEditingResgate(null);
              setResgateForm({
                ...emptyResgate,
                animalId: animalOptions[0]?.value ?? "",
              });
              setResgateModal(true);
            }}
          >
            <Plus size={16} />
            Novo resgate
          </Button>
        </div>
        <DataTable columns={resgateColumns} data={resgates} emptyMessage="Nenhum resgate registrado" />
      </Card>

      <Modal
        open={animalModal}
        onClose={() => setAnimalModal(false)}
        title={editingAnimal ? "Editar animal" : "Novo animal"}
        subtitle="Cadastro de animais resgatados"
      >
        <form onSubmit={submitAnimal} className="flex flex-col gap-4">
          <Input
            label="Nome"
            value={animalForm.nome}
            onChange={(e) => setAnimalForm({ ...animalForm, nome: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Espécie"
              options={especiesOptions.filter((o) => o.value !== "all")}
              value={animalForm.especie}
              onChange={(e) => setAnimalForm({ ...animalForm, especie: e.target.value })}
            />
            <Select
              label="Status"
              options={statusAnimalOptions}
              value={animalForm.status}
              onChange={(e) => setAnimalForm({ ...animalForm, status: e.target.value })}
            />
          </div>
          <Input
            label="Data do resgate"
            type="date"
            value={animalForm.dataResgate}
            onChange={(e) => setAnimalForm({ ...animalForm, dataResgate: e.target.value })}
            required
          />
          <Input
            label="Foto (URL)"
            value={animalForm.foto}
            onChange={(e) => setAnimalForm({ ...animalForm, foto: e.target.value })}
            placeholder="https://..."
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAnimalModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editingAnimal ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={resgateModal}
        onClose={() => setResgateModal(false)}
        title={editingResgate ? "Editar resgate" : "Novo resgate"}
        subtitle="Registro operacional do resgate"
      >
        <form onSubmit={submitResgate} className="flex flex-col gap-4">
          <Select
            label="Animal"
            options={animalOptions}
            value={resgateForm.animalId}
            onChange={(e) => setResgateForm({ ...resgateForm, animalId: e.target.value })}
          />
          <Input
            label="Local"
            value={resgateForm.local}
            onChange={(e) => setResgateForm({ ...resgateForm, local: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data"
              type="date"
              value={resgateForm.data}
              onChange={(e) => setResgateForm({ ...resgateForm, data: e.target.value })}
            />
            <Input
              label="Custos"
              type="number"
              step="0.01"
              value={resgateForm.custos}
              onChange={(e) => setResgateForm({ ...resgateForm, custos: e.target.value })}
              required
            />
          </div>
          <Input
            label="Descrição"
            value={resgateForm.descricao}
            onChange={(e) => setResgateForm({ ...resgateForm, descricao: e.target.value })}
            required
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setResgateModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editingResgate ? "Salvar" : "Registrar"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
