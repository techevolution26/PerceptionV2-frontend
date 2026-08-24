// app/components/ui/Card.tsx
import { forwardRef, type ElementType, type ComponentPropsWithoutRef } from "react";

type CardProps<T extends ElementType> = {
  as?: T;
  hover?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

const Card = forwardRef(function Card<T extends ElementType = "div">(
  { as, hover = false, className = "", ...props }: CardProps<T>,
  ref: React.ForwardedRef<Element>
) {
  const Tag = (as || "div") as ElementType;
  return (
    <Tag
      ref={ref}
      className={`rounded-card border border-border-hairline bg-surface ${
        hover ? "transition-colors hover:border-border-strong" : ""
      } ${className}`}
      {...props}
    />
  );
});

export default Card;
