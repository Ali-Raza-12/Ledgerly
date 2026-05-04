import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Stroke/fill color. Defaults to primary-foreground for use over gradient tiles. */
  tone?: "light" | "dark";
}

/**
 * Premium brand mark — a layered aurora diamond with an inner spark.
 * Designed to read as a high-end fintech monogram (not a generic wallet).
 * Use inside a gradient-primary tile for the signature look.
 */
export function BrandLogo({ className, tone = "light" }: BrandLogoProps) {
  const stroke = tone === "light" ? "hsl(var(--primary-foreground))" : "hsl(var(--primary))";
  const soft = tone === "light" ? "hsl(var(--primary-foreground) / 0.55)" : "hsl(var(--primary) / 0.55)";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      {/* Outer faceted diamond */}
      <path
        d="M16 2.5 L28.5 12 L24 27 L8 27 L3.5 12 Z"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.95"
      />
      {/* Inner facet lines for depth */}
      <path
        d="M16 2.5 L16 27 M3.5 12 L28.5 12 M16 12 L8 27 M16 12 L24 27"
        stroke={soft}
        strokeWidth="0.9"
        strokeLinejoin="round"
        opacity="0.7"
      />
      {/* Inner spark */}
      <circle cx="16" cy="12" r="2.1" fill={stroke} />
    </svg>
  );
}

export default BrandLogo;
