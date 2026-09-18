import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "primary";
}

export function Card({ children, className, variant = "default" }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--color-border)] p-6",
        variant === "default" && "bg-[var(--color-card)] shadow-[var(--shadow-card)]",
        variant === "primary" &&
          "border-transparent bg-[var(--color-primary)] shadow-[var(--shadow-primary-card)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  "aria-label": string;
}

export function IconButton({ children, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]",
        "text-[var(--color-text-secondary)] transition-colors duration-150",
        "hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-tag)] px-2.5 py-1 text-xs font-medium",
        variant === "default" && "bg-[var(--color-hover)] text-[var(--color-text-secondary)]",
        variant === "primary" && "bg-[var(--color-on-primary)]/15 text-[var(--color-on-primary)]",
        variant === "success" && "bg-[var(--color-success)]/15 text-[var(--color-success)]",
        variant === "warning" && "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

interface AvatarProps {
  initials: string;
  className?: string;
  size?: "sm" | "md";
}

export function Avatar({ initials, className, size = "md" }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] font-semibold text-[var(--color-on-primary)]",
        size === "sm" && "h-8 w-8 text-xs",
        size === "md" && "h-9 w-9 text-sm",
        className,
      )}
    >
      {initials}
    </div>
  );
}

export type { CardProps, IconButtonProps, BadgeProps, AvatarProps };
