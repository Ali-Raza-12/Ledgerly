import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { BIKE_SUBTYPES } from "@/lib/categories";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatCurrency, formatDate, todayISO } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader } from "@/components/Loader";
import { Car, Fuel, Droplets, Wrench, Hammer, Plus, Trash2, Gauge, TrendingUp, BadgeCheck, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getExpenses, addExpense, deleteExpense } from "@/services/expenseService";
import { addFuelLog, computeFuelCycles, deleteFuelLog, getFuelLogs } from "@/services/fuelService";
import type { Expense, BikeSubType } from "@/types/expense";
import type { FuelLog } from "@/types/fuel";

type TabKey = "fuel" | "oil" | "maintenance" | "repairs";

const TAB_META: Record<TabKey, { label: string; icon: typeof Fuel; color: string; subType?: BikeSubType }> = {
  fuel: { label: "Fuel", icon: Fuel, color: "#22c55e", subType: "petrol" },
  oil: { label: "Oil", icon: Droplets, color: "#f59e0b", subType: "oil" },
  maintenance: { label: "Maintenance", icon: Wrench, color: "#a855f7", subType: "maintenance" },
  repairs: { label: "Repairs", icon: Hammer, color: "#ef4444", subType: "repairs" },
};

export function BikeTracker() {
  const [tab, setTab] = useState<TabKey>("fuel");
  const [loading, setLoading] = useState(true);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const refresh = async () => {
    setLoading(true);
    const [fuelRes, expRes] = await Promise.all([getFuelLogs(), getExpenses()]);
    if (fuelRes.error) {
      const msg = fuelRes.error instanceof Error ? fuelRes.error.message : "Failed to load fuel logs";
      // Likely table missing — show actionable hint, don't crash UI
      if (/vehicle_fuel_logs/i.test(msg) || /relation .* does not exist/i.test(msg)) {
        toast.error("Fuel tracking table missing — please run the migration.");
      } else {
        toast.error(msg);
      }
    } else {
      setFuelLogs(fuelRes.data || []);
    }
    if (expRes.error) {
      toast.error(expRes.error instanceof Error ? expRes.error.message : "Failed to load expenses");
    } else {
      setExpenses((expRes.data || []).filter((e) => e.type === "bike"));
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="animate-fade-in pb-10">
      <PageHeader title="Vehicle" subtitle="Fuel tracking & vehicle expenses" />

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full">
        <TabsList className="mb-5 grid h-auto w-full grid-cols-4 rounded-2xl bg-secondary/60 p-1">
          {(Object.keys(TAB_META) as TabKey[]).map((k) => {
            const meta = TAB_META[k];
            const Icon = meta.icon;
            return (
              <TabsTrigger
                key={k}
                value={k}
                className="flex flex-col gap-1 rounded-xl py-2.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-glow data-[state=active]:text-foreground"
              >
                <Icon className="h-4 w-4" style={{ color: meta.color }} />
                <span className="font-medium">{meta.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="fuel" className="mt-0">
          {loading ? <Loader label="Loading fuel data" /> : <FuelPanel logs={fuelLogs} onChanged={refresh} />}
        </TabsContent>

        {(["oil", "maintenance", "repairs"] as TabKey[]).map((k) => (
          <TabsContent key={k} value={k} className="mt-0">
            {loading ? (
              <Loader label={`Loading ${TAB_META[k].label}`} />
            ) : (
              <ExpensePanel
                tabKey={k}
                expenses={expenses.filter((e) => e.bikeSubType === TAB_META[k].subType)}
                onChanged={refresh}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

/* ---------------- FUEL PANEL ---------------- */

function FuelPanel({ logs, onChanged }: { logs: FuelLog[]; onChanged: () => void }) {
  const cycles = useMemo(() => computeFuelCycles(logs), [logs]);
  const latest = cycles[cycles.length - 1];
  const fullTanks = logs.filter((l) => l.is_full_tank).length;

  return (
    <div className="space-y-5">
      <FuelStatsCard latest={latest} fullTanks={fullTanks} totalLogs={logs.length} />
      <FuelAddForm onAdded={onChanged} lastOdometer={logs[0]?.odometer} />
      <FuelHistory logs={logs} onDeleted={onChanged} />
    </div>
  );
}

function FuelStatsCard({
  latest,
  fullTanks,
  totalLogs,
}: {
  latest: ReturnType<typeof computeFuelCycles>[number] | undefined;
  fullTanks: number;
  totalLogs: number;
}) {
  if (!latest) {
    return (
      <section className="glass-card rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/15 text-warning">
            <Info className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Waiting for full tank to calculate average</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add at least <span className="font-medium text-foreground">two “Full Tank”</span> entries with
              odometer readings. We'll calculate km/L automatically between them.
            </p>
            <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
              <span><b className="text-foreground">{fullTanks}</b> full tanks</span>
              <span>•</span>
              <span><b className="text-foreground">{totalLogs}</b> total entries</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl glass-card p-6">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <Gauge className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Latest Average</p>
              <p className="fin-number text-3xl font-semibold">
                {latest.averageKmPerL.toFixed(2)}{" "}
                <span className="text-base font-normal text-muted-foreground">km/L</span>
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary sm:flex">
            <TrendingUp className="h-3 w-3" /> Live
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Distance" value={`${latest.distance} km`} />
          <Stat label="Fuel used" value={`${latest.totalLiters.toFixed(2)} L`} />
          <Stat
            label="Cost / km"
            value={latest.costPerKm > 0 ? formatCurrency(latest.costPerKm) : "—"}
          />
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground">
          Cycle: {formatDate(latest.fromDate, { day: "numeric", month: "short" })} →{" "}
          {formatDate(latest.toDate, { day: "numeric", month: "short" })} ({latest.fromOdo} → {latest.toOdo} km)
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="fin-number mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function FuelAddForm({ onAdded, lastOdometer }: { onAdded: () => void; lastOdometer?: number }) {
  const [date, setDate] = useState(todayISO());
  const [odometer, setOdometer] = useState("");
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");
  const [isFull, setIsFull] = useState(true);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const odo = parseFloat(odometer);
    const lit = parseFloat(liters);
    if (!odo || odo <= 0) return toast.error("Enter a valid odometer reading");
    if (!lit || lit <= 0) return toast.error("Enter fuel liters");
    if (lastOdometer && odo < lastOdometer) {
      const ok = window.confirm(
        `Odometer (${odo}) is lower than last entry (${lastOdometer}). Save anyway?`,
      );
      if (!ok) return;
    }

    setSaving(true);
    const { error } = await addFuelLog({
      date,
      odometer: odo,
      fuel_liters: lit,
      fuel_cost: cost ? parseFloat(cost) : null,
      is_full_tank: isFull,
    });
    setSaving(false);

    if (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
      return;
    }
    toast.success(isFull ? "Full tank logged" : "Fuel entry saved");
    setOdometer("");
    setLiters("");
    setCost("");
    onAdded();
  };

  return (
    <form onSubmit={submit} className="glass-card space-y-4 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Log fuel</p>
        <label className="flex cursor-pointer items-center gap-2 rounded-full bg-secondary/60 px-3 py-1.5">
          <BadgeCheck
            className={cn("h-4 w-4 transition-colors", isFull ? "text-primary" : "text-muted-foreground")}
          />
          <span className="text-xs font-medium">Full tank</span>
          <Switch checked={isFull} onCheckedChange={setIsFull} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 rounded-xl border-border bg-secondary"
          />
        </Field>
        <Field label="Odometer (km)">
          <Input
            type="number"
            inputMode="decimal"
            placeholder={lastOdometer ? `${lastOdometer}` : "0"}
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            className="h-11 rounded-xl border-border bg-secondary"
          />
        </Field>
        <Field label="Fuel (liters)">
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0.00"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            className="h-11 rounded-xl border-border bg-secondary"
          />
        </Field>
        <Field label="Cost (optional)">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Rs"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="h-11 rounded-xl border-border bg-secondary"
          />
        </Field>
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="h-12 w-full rounded-2xl bg-gradient-primary font-semibold text-primary-foreground shadow-glow hover:opacity-95"
      >
        <Plus className="mr-1 h-4 w-4" /> {saving ? "Saving…" : "Add fuel entry"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function FuelHistory({ logs, onDeleted }: { logs: FuelLog[]; onDeleted: () => void }) {
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this fuel entry?")) return;
    const { error } = await deleteFuelLog(id);
    if (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
      return;
    }
    toast.success("Entry deleted");
    onDeleted();
  };

  return (
    <section>
      <h3 className="mb-3 px-1 text-xs uppercase tracking-widest text-muted-foreground">Fuel history</h3>
      {logs.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center text-muted-foreground">
          No fuel entries yet. Add your first one above.
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="group glass-card flex items-center gap-3 rounded-2xl p-4">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  log.is_full_tank ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground",
                )}
              >
                <Fuel className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{log.fuel_liters.toFixed(2)} L</p>
                  {log.is_full_tank && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      FULL TANK
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(log.date, { day: "numeric", month: "short", year: "numeric" })} • {log.odometer} km
                </p>
              </div>
              <div className="text-right">
                {log.fuel_cost ? (
                  <p className="fin-number font-semibold">{formatCurrency(log.fuel_cost)}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">—</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(log.id)}
                className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------- OIL / MAINTENANCE / REPAIRS PANEL ---------------- */

function ExpensePanel({
  tabKey,
  expenses,
  onChanged,
}: {
  tabKey: TabKey;
  expenses: Expense[];
  onChanged: () => void;
}) {
  const meta = TAB_META[tabKey];
  const subType = meta.subType!;
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");

    setSaving(true);
    const { error } = await addExpense({
      title: title.trim() || meta.label,
      amount: amt,
      category: "bike",
      type: "bike",
      bikeSubType: subType,
      date,
      note: note.trim() || undefined,
    });
    setSaving(false);
    if (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
      return;
    }
    toast.success(`${meta.label} entry added`);
    setAmount("");
    setTitle("");
    setNote("");
    onChanged();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this entry?")) return;
    const { error } = await deleteExpense(id);
    if (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
      return;
    }
    toast.success("Deleted");
    onChanged();
  };

  const Icon = meta.icon;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl glass-card p-6">
        <div
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl pointer-events-none"
          style={{ background: `${meta.color}33` }}
        />
        <div className="relative flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: `${meta.color}22`, color: meta.color }}
          >
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Total {meta.label}</p>
            <p className="mt-1 fin-number text-3xl font-semibold">{formatCurrency(total)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{expenses.length} entries</p>
          </div>
        </div>
      </section>

      <form onSubmit={submit} className="glass-card space-y-4 rounded-3xl p-5">
        <p className="text-sm font-semibold">Add {meta.label.toLowerCase()} entry</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 rounded-xl border-border bg-secondary"
            />
          </Field>
          <Field label="Amount">
            <Input
              type="number"
              inputMode="decimal"
              placeholder="Rs"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 rounded-xl border-border bg-secondary"
            />
          </Field>
          <div className="col-span-2">
            <Field label="Title (optional)">
              <Input
                placeholder={meta.label}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-xl border-border bg-secondary"
              />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Note (optional)">
              <Input
                placeholder="Workshop, brand, etc."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-11 rounded-xl border-border bg-secondary"
              />
            </Field>
          </div>
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="h-12 w-full rounded-2xl bg-gradient-primary font-semibold text-primary-foreground shadow-glow hover:opacity-95"
        >
          <Plus className="mr-1 h-4 w-4" /> {saving ? "Saving…" : `Add ${meta.label}`}
        </Button>
      </form>

      <section>
        <h3 className="mb-3 px-1 text-xs uppercase tracking-widest text-muted-foreground">History</h3>
        {expenses.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center text-muted-foreground">
            No {meta.label.toLowerCase()} entries yet.
          </div>
        ) : (
          <div className="space-y-2">
            {[...expenses]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((e) => {
                const sub = BIKE_SUBTYPES.find((s) => s.id === e.bikeSubType);
                return (
                  <div key={e.id} className="group glass-card flex items-center gap-3 rounded-2xl p-4">
                    <CategoryIcon
                      name={sub?.icon || "Car"}
                      color={sub?.color || meta.color}
                      className="h-11 w-11"
                      size={20}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{e.title || meta.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(e.date, { day: "numeric", month: "short", year: "numeric" })}
                        {e.note ? ` • ${e.note}` : ""}
                      </p>
                    </div>
                    <p className="fin-number font-semibold">-{formatCurrency(e.amount)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(e.id)}
                      className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
          </div>
        )}
      </section>
    </div>
  );
}

// suppress unused warning for Car import
void Car;
