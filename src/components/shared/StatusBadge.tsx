import { cn } from "@/lib/utils";

export type StatusVariant =
  | "pendente"
  | "pago"
  | "atrasado"
  | "ativo"
  | "inativo"
  | "disponivel"
  | "adotado"
  | "tratamento";

const statusStyles: Record<StatusVariant, string> = {
  pendente: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  pago: "bg-[var(--color-success)]/15 text-[var(--color-success)]",
  atrasado: "bg-[var(--color-primary)]/15 text-[var(--color-primary)]",
  ativo: "bg-[var(--color-success)]/15 text-[var(--color-success)]",
  inativo: "bg-[var(--color-hover)] text-[var(--color-text-secondary)]",
  disponivel: "bg-[var(--color-success)]/15 text-[var(--color-success)]",
  adotado: "bg-[var(--color-primary)]/15 text-[var(--color-primary)]",
  tratamento: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
};

const statusLabels: Record<StatusVariant, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  ativo: "Ativo",
  inativo: "Inativo",
  disponivel: "Disponível",
  adotado: "Adotado",
  tratamento: "Tratamento",
};

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-tag)] px-2.5 py-1 text-xs font-medium capitalize",
        statusStyles[status],
      )}
    >
      {label ?? statusLabels[status]}
    </span>
  );
}
