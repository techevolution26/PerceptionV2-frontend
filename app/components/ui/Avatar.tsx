// app/components/ui/Avatar.tsx
import Image from "next/image";

const SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 88 } as const;
type AvatarSize = keyof typeof SIZES | number;

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  ring?: boolean;
  className?: string;
}

export default function Avatar({ src, alt = "", size = "md", ring = false, className = "" }: AvatarProps) {
  const px = typeof size === "number" ? size : SIZES[size];
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-surface-sunken
        ${ring ? "ring-2 ring-background" : ""} ${className}`}
      style={{ width: px, height: px }}
    >
      <Image
        src={src || "/default-avatar.png"}
        alt={alt}
        fill
        sizes={`${px}px`}
        className="object-cover"
      />
    </span>
  );
}
