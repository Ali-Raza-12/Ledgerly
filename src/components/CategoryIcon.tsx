import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  color?: string;
  className?: string;
  size?: number;
  background?: boolean;
}

export function CategoryIcon({ name, color, className, size = 18, background = true }: Props) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[name] ||
    Icons.Circle;

  if (!background) {
    return <Icon size={size} className={cn(className)} />;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl shrink-0",
        className
      )}
      style={{
        background: color ? `${color}22` : "hsl(var(--muted))",
        color: color || "hsl(var(--foreground))",
      }}
    >
      <Icon size={size} />
    </div>
  );
}
