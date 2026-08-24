// app/components/ui/VantageMark.tsx
// Perspective's signature mark: a shared center, seen from three unequal
// angles. Used as the brand mark, the loading state, and the "N perspectives"
// indicator wherever a topic collects more than one point of view.
interface VantageMarkProps {
  size?: number;
  className?: string;
  spinning?: boolean;
  strokeWidth?: number;
}

export default function VantageMark({ size = 24, className = "", spinning = false, strokeWidth = 1.6 }: VantageMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={`${spinning ? "animate-vantage-spin" : ""} ${className}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="12" y1="1" x2="12" y2="5.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line
        x1="21.7" y1="15.1" x2="17.7" y2="13.6"
        stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
        transform="rotate(2 12 12)"
      />
      <line
        x1="4.4" y1="18.9" x2="7.2" y2="15.5"
        stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
      />
    </svg>
  );
}
