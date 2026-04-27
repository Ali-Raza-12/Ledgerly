import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  label?: string;
  sublabel?: string;
  fullscreen?: boolean;
  className?: string;
}

/**
 * Premium branded loader matching the dark fintech design system.
 * Uses primary neon-green accent, glass surfaces, and subtle motion.
 */
export function Loader({
  label = "Loading",
  sublabel,
  fullscreen = false,
  className,
}: LoaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullscreen
          ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
          : "w-full py-16",
        className
      )}
    >
      <div className="relative flex flex-col items-center gap-5 animate-fade-in">
        {/* Glow halo */}
        <div className="absolute -inset-10 rounded-full bg-primary/20 blur-3xl opacity-70 pointer-events-none" />

        {/* Orbiting ring + brand mark */}
        <div className="relative h-20 w-20">
          {/* Track */}
          <div className="absolute inset-0 rounded-full border border-border/60" />
          {/* Spinning arc */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/60 animate-spin"
            style={{ animationDuration: "1.1s" }}
          />
          {/* Inner counter-spin accent */}
          <div
            className="absolute inset-2 rounded-full border border-transparent border-b-accent/70 animate-spin"
            style={{ animationDuration: "1.8s", animationDirection: "reverse" }}
          />
          {/* Center brand */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Label */}
        <div className="relative text-center">
          <p className="text-sm font-medium tracking-wide flex items-center justify-center gap-1">
            <span>{label}</span>
            <Dots />
          </p>
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
          )}
        </div>

        {/* Shimmer bar */}
        <div className="relative h-[3px] w-40 rounded-full bg-secondary overflow-hidden">
          <div className="absolute inset-y-0 -left-1/3 w-1/3 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-0.5 ml-0.5">
      <Dot delay="0ms" />
      <Dot delay="150ms" />
      <Dot delay="300ms" />
    </span>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1 w-1 rounded-full bg-primary animate-pulse"
      style={{ animationDelay: delay, animationDuration: "1s" }}
    />
  );
}

export default Loader;
