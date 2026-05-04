import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

interface LoaderProps {
  label?: string;
  sublabel?: string;
  fullscreen?: boolean;
  className?: string;
}

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
        fullscreen ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-md" : "w-full py-16",
        className,
      )}
    >
      <div className="relative flex flex-col items-center gap-5 animate-fade-in">
        <div className="absolute -inset-10 rounded-full bg-primary/20 blur-3xl opacity-70 pointer-events-none" />

        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border border-border/60" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/60 animate-spin"
            style={{ animationDuration: "1.1s" }}
          />
          <div
            className="absolute inset-2 rounded-full border border-transparent border-b-accent/70 animate-spin"
            style={{ animationDuration: "1.8s", animationDirection: "reverse" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <BrandLogo className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="relative text-center">
          <p className="flex items-center justify-center gap-1 text-sm font-medium tracking-wide">
            <span>{label}</span>
            <Dots />
          </p>
          {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
        </div>

        <div className="relative h-[3px] w-40 overflow-hidden rounded-full bg-secondary">
          <div className="absolute inset-y-0 -left-1/3 w-1/3 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span className="ml-0.5 inline-flex gap-0.5">
      <Dot delay="0ms" />
      <Dot delay="150ms" />
      <Dot delay="300ms" />
    </span>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1 w-1 animate-pulse rounded-full bg-primary"
      style={{ animationDelay: delay, animationDuration: "1s" }}
    />
  );
}

export default Loader;
