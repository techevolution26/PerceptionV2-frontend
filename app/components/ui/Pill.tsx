// app/components/ui/Pill.tsx
import type { ReactNode } from "react";

const TONES = {
  neutral: "bg-surface-sunken text-foreground-muted border-border-hairline",
  accent: "bg-accent-soft text-accent-strong border-accent/25",
} as const;

interface PillProps {
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}

export default function Pill({ children, tone = "neutral", className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
