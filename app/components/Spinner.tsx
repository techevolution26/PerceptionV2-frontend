// app/components/Spinner.tsx
import VantageMark from "./ui/VantageMark";

export default function Spinner({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center text-foreground-subtle ${className}`} role="status" aria-label="Loading">
      <VantageMark size={size} spinning strokeWidth={1.8} />
    </div>
  );
}
