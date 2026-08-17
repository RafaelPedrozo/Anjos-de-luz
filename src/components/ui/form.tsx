import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-medium transition-colors duration-150",
        variant === "primary" &&
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
        variant === "secondary" &&
          "border border-[var(--color-border)] bg-white/5 text-[var(--color-text-secondary)] hover:bg-white/10 hover:text-white",
        variant === "ghost" &&
          "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-list-item)] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]/50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "w-full rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-list-item)] px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-[var(--color-primary)]/50",
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--color-card)]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "min-h-[88px] w-full resize-y rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-list-item)] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]/50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export type { ButtonProps, InputProps, SelectProps, TextareaProps };
