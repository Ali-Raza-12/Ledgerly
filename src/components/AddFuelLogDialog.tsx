import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { addFuelLog } from "@/services/fuelLogService";
import { todayISO } from "@/lib/format";
import type { FuelLog, FuelLogInput } from "@/types/fuel";
import { Check, Fuel, Gauge } from "lucide-react";
import { toast } from "sonner";

interface Props {
  trigger: React.ReactNode;
  onSuccess?: (log: FuelLog) => void;
}

export function AddFuelLogDialog({ trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [odometerKm, setOdometerKm] = useState("");
  const [litres, setLitres] = useState("");
  const [isFullTank, setIsFullTank] = useState(true);
  const [note, setNote] = useState("");

  const reset = () => {
    setDate(todayISO());
    setOdometerKm("");
    setLitres("");
    setIsFullTank(true);
    setNote("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const odometer = Number(odometerKm);
    const fuelLitres = Number(litres);

    if (!odometer || odometer <= 0 || !fuelLitres || fuelLitres <= 0) {
      toast.error("Enter a valid odometer reading and fuel litres");
      return;
    }

    const payload: FuelLogInput = {
      date,
      odometerKm: odometer,
      litres: fuelLitres,
      isFullTank,
      note: note.trim() || undefined,
    };

    const { data, error } = await addFuelLog(payload);
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
      <DialogContent className="glass-card max-w-md rounded-3xl border-border">
        <DialogHeader>
          <DialogTitle>Log fuel reading</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 px-4 py-3">
            <div className="min-w-0 pr-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Fuel className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">Full tank</p>
                  <p className="text-xs text-muted-foreground">
                    Turn this on only when the tank is filled completely.
                  </p>
                </div>
              </div>
            </div>
            <Switch checked={isFullTank} onCheckedChange={setIsFullTank} aria-label="Mark fuel log as full tank" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Fuel litres</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={litres}
                onChange={(e) => setLitres(e.target.value)}
                placeholder="0"
                className="h-11 rounded-xl border-border bg-secondary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meter reading (km)</Label>
            <div className="relative">
              <Gauge className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                inputMode="numeric"
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
                placeholder="e.g. 24580"
                className="h-11 rounded-xl border-border bg-secondary pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Pump, route, or trip note..."
              className="resize-none rounded-xl border-border bg-secondary"
            />
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-gradient-primary font-semibold text-primary-foreground shadow-glow"
          >
            <Check className="mr-2 h-4 w-4" />
            Save fuel log
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
