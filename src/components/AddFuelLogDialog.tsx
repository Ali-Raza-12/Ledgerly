import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addFuelLog, getFuelLogs } from "@/services/fuelLogService";
import { todayISO } from "@/lib/format";
import { normalizeOdometerKm } from "@/lib/fuel";
import type { FuelLog, FuelLogInput } from "@/types/fuel";
import { Calendar as CalendarIcon, Check, Droplet, Fuel, Gauge, Sparkles, StickyNote, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  trigger: React.ReactNode;
  onSuccess?: (log: FuelLog) => void;
}

const odometerFormatter = new Intl.NumberFormat("en-PK", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function AddFuelLogDialog({ trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [odometerKm, setOdometerKm] = useState("");
  const [litres, setLitres] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [isFullTank, setIsFullTank] = useState(true);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastLog, setLastLog] = useState<FuelLog | null>(null);

  const reset = () => {
    setDate(todayISO());
    setOdometerKm("");
    setLitres("");
    setFuelCost("");
    setIsFullTank(true);
    setNote("");
  };

  useEffect(() => {
    if (!open) return;
    let active = true;
    getFuelLogs().then(({ data }) => {
      if (!active) return;
      setLastLog(data?.[0] ?? null);
    });
    return () => {
      active = false;
    };
  }, [open]);

  const odometerNum = normalizeOdometerKm(odometerKm);
  const litresNum = Number(litres);
  const fuelCostNum = Number(fuelCost);

  const preview = useMemo(() => {
    const distance =
      lastLog && odometerNum > 0 && odometerNum > lastLog.odometerKm
        ? odometerNum - lastLog.odometerKm
        : null;
    const mileage = distance && litresNum > 0 ? distance / litresNum : null;
    const cost = fuelCostNum > 0 ? fuelCostNum : null;
    const costPerKm = cost && distance ? cost / distance : null;
    return { distance, mileage, cost, costPerKm };
  }, [lastLog, odometerNum, litresNum, fuelCostNum]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!odometerNum || odometerNum <= 0 || !litresNum || litresNum <= 0 || !fuelCostNum || fuelCostNum <= 0) {
      toast.error("Enter a valid odometer reading, fuel litres, and fuel cost");
      return;
    }

    setSubmitting(true);

    const payload: FuelLogInput = {
      date,
      odometerKm: odometerNum,
      litres: litresNum,
      fuelCost: fuelCostNum,
      isFullTank,
      note: note.trim() || undefined,
    };

    const { data, error } = await addFuelLog(payload);
    setSubmitting(false);

    if (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save fuel log");
      return;
    }

    if (data?.[0]) {
      onSuccess?.(data[0]);
    }

    toast.success("Fuel log saved");
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="app-scrollbar glass-card max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto rounded-3xl border-border p-0">
        <div className="relative overflow-hidden rounded-t-3xl border-b border-border/60 bg-gradient-to-br from-primary/15 via-background to-accent/10 p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <Fuel className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold tracking-tight sm:text-xl">Log fuel reading</DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Track every fill to unlock accurate mileage and cost insights.
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
          <button
            type="button"
            role="switch"
            aria-checked={isFullTank}
            aria-label="Mark as full tank fill"
            onClick={() => setIsFullTank((value) => !value)}
            className={cn(
              "group flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all duration-300",
              isFullTank
                ? "border-primary/40 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent shadow-[0_0_0_1px_hsl(var(--primary)/0.15),0_8px_24px_-12px_hsl(var(--primary)/0.4)]"
                : "border-border bg-secondary/40 hover:border-primary/30 hover:bg-secondary/60",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                  isFullTank
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {isFullTank ? <Sparkles className="h-4 w-4" /> : <Droplet className="h-4 w-4" />}
                {isFullTank ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background ring-2 ring-primary">
                    <Check className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
                  </span>
                ) : null}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{isFullTank ? "Full tank fill" : "Partial top-up"}</p>
                <p className="text-xs text-muted-foreground">
                  {isFullTank ? "Counts as a cycle marker for mileage." : "Tap to mark as a complete fill."}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-all duration-300",
                isFullTank
                  ? "border-primary/50 bg-gradient-primary shadow-[inset_0_1px_2px_hsl(var(--primary-foreground)/0.2),0_0_12px_hsl(var(--primary)/0.5)]"
                  : "border-border bg-secondary",
              )}
            >
              <span
                className={cn(
                  "absolute top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-md transition-all duration-300",
                  isFullTank ? "left-[calc(100%-1.375rem)]" : "left-1",
                )}
              >
                {isFullTank ? (
                  <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                )}
              </span>
            </span>
          </button>

          <div className="space-y-2">
            <Label htmlFor="odometer" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Odometer reading
            </Label>
            <div className="relative">
              <Gauge className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70" />
              <Input
                id="odometer"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
                placeholder="e.g. 914151"
                className="h-14 rounded-2xl border-border bg-secondary/60 pl-12 pr-16 text-lg font-semibold tracking-tight focus-visible:border-primary/60 focus-visible:ring-primary/20"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                km
              </span>
            </div>
            {lastLog ? (
              <p className="px-1 text-[11px] text-muted-foreground">
                Last reading: <span className="font-medium text-foreground">{odometerFormatter.format(lastLog.odometerKm)} km</span>
              </p>
            ) : null}
            <p className="px-1 text-[11px] text-muted-foreground">
              Whole-number readings treat the last digit as `0.1 km`, so `914151` becomes `91,415.1 km`.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="litres" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Fuel
              </Label>
              <div className="relative">
                <Input
                  id="litres"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={litres}
                  onChange={(e) => setLitres(e.target.value)}
                  placeholder="0.0"
                  className="h-12 rounded-xl border-border bg-secondary/60 pr-10 font-medium focus-visible:border-primary/60"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  L
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel-cost" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Fuel cost
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  Rs
                </span>
                <Input
                  id="fuel-cost"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  placeholder="0"
                  className="h-12 rounded-xl border-border bg-secondary/60 pl-10 font-medium focus-visible:border-primary/60"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Date
            </Label>
            <div className="relative">
              <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 rounded-xl border-border bg-secondary/60 pl-10 font-medium focus-visible:border-primary/60"
              />
            </div>
          </div>

          {preview.distance || preview.mileage || preview.cost ? (
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/5 p-4 animate-fade-in">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
              <div className="relative">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
                  <TrendingUp className="h-3 w-3" />
                  Live preview
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <PreviewStat label="Distance" value={preview.distance ? `${Math.round(preview.distance)} km` : "-"} />
                  <PreviewStat
                    label="Mileage"
                    value={preview.mileage ? `${preview.mileage.toFixed(1)} km/L` : "-"}
                    accent
                  />
                  <PreviewStat label="Total cost" value={preview.cost ? `Rs ${preview.cost.toFixed(0)}` : "-"} />
                  <PreviewStat
                    label="Cost / km"
                    value={preview.costPerKm ? `Rs ${preview.costPerKm.toFixed(2)}` : "-"}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="note" className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <StickyNote className="h-3 w-3" /> Note (optional)
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Pump, route, or trip note..."
              className="resize-none rounded-xl border-border bg-secondary/60 focus-visible:border-primary/60"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-12 rounded-xl sm:w-28">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-12 flex-1 rounded-xl bg-gradient-primary font-semibold text-primary-foreground shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_hsl(var(--primary)/0.55)]"
            >
              <Check className="mr-2 h-4 w-4" />
              {submitting ? "Saving..." : "Save fuel log"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PreviewStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 px-3 py-2 backdrop-blur-sm">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-sm font-semibold tabular-nums", accent && "text-primary")}>{value}</p>
    </div>
  );
}
