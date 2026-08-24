// app/components/ui/Button.tsx
"use client";

import type { ButtonHTMLAttributes } from "react";

const VARIANTS = {
  primary:
    "bg-foreground text-background hover:opacity-90 border border-transparent",
  accent:
    "bg-accent text-accent-on hover:bg-accent-strong border border-transparent",
  outline:
    "bg-transparent text-foreground border border-border-strong hover:bg-surface-hover",
  ghost:
    "bg-transparent text-foreground-muted border border-transparent hover:bg-surface-hover hover:text-foreground",
  danger:
    "bg-transparent text-danger border border-danger/30 hover:bg-danger/10",
} as const;

const SIZES = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
  lg: "text-base px-5 py-2.5 gap-2",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-control font-medium transition
        disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}
