"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, subtitle, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar modal"
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-card)]",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
            )}
          </div>
          <IconButton aria-label="Fechar" onClick={onClose}>
            <X size={18} strokeWidth={1.75} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}
