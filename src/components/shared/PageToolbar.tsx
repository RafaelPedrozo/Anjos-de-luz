"use client";

import type { ReactNode } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/form";

interface PageToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  periodValue?: string;
  onPeriodChange?: (value: string) => void;
  periodOptions?: { value: string; label: string }[];
  categoryValue?: string;
  onCategoryChange?: (value: string) => void;
  categoryOptions?: { value: string; label: string }[];
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  extraFilters?: ReactNode;
}

export function PageToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Pesquisar...",
  periodValue,
  onPeriodChange,
  periodOptions,
  categoryValue,
  onCategoryChange,
  categoryOptions,
  actionLabel,
  onAction,
  actionIcon,
  extraFilters,
}: PageToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[240px] flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
        />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-list-item)] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]/50"
        />
      </div>

      {periodOptions && onPeriodChange && (
        <select
          value={periodValue}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-list-item)] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[var(--color-primary)]/50"
        >
          {periodOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--color-card)]">
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {categoryOptions && onCategoryChange && (
        <select
          value={categoryValue}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-list-item)] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[var(--color-primary)]/50"
        >
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--color-card)]">
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {extraFilters}

      {actionLabel && onAction && (
        <Button onClick={onAction} className={cn("shrink-0")}>
          {actionIcon}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function FilterButton({ label = "Filtrar" }: { label?: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-white/5 px-3.5 py-2.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-white/10 hover:text-white"
    >
      <SlidersHorizontal size={15} strokeWidth={1.75} />
      {label}
    </button>
  );
}
