import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  Fuel,
  Gauge,
  History,
  Plus,
  Route,
  Sparkles,
  Waves,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { AddFuelLogDialog } from "@/components/AddFuelLogDialog";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryIcon } from "@/components/CategoryIcon";
import { BIKE_SUBTYPES } from "@/lib/categories";
import { buildFuelCycles } from "@/lib/fuel";
import { formatCurrency, formatDate, monthKey, monthLabel, todayISO } from "@/lib/format";
import { getExpenses } from "@/services/expenseService";
import { getFuelLogs } from "@/services/fuelLogService";
import type { Expense } from "@/types/expense";
import type { FuelLog } from "@/types/fuel";
import { cn } from "@/lib/utils";

const numberFormatter = new Intl.NumberFormat("en-PK");

const formatDistance = (value: number) => `${numberFormatter.format(Math.round(value))} km`;
const formatLitres = (value: number) => `${value.toFixed(1)} L`;
const formatAverage = (value: number) => `${value.toFixed(1)} km/L`;

export function BikeTracker() {
  const [loading, setLoading] = useState(true);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<string>(monthKey(todayISO()));
  const [tab, setTab] = useState("timeline");

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: expenseData, error: expenseError }, { data: fuelData, error: fuelError }] =
        await Promise.all([getExpenses(), getFuelLogs()]);

      if (expenseError) {
        toast.error(expenseError instanceof Error ? expenseError.message : "Failed to fetch expenses");
      }

      if (fuelError) {
        toast.error(fuelError instanceof Error ? fuelError.message : "Failed to fetch fuel history");
      }

      setExpenses(expenseData || []);
      setFuelLogs(fuelData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const months = useMemo(
    () => [...new Set(expenses.map((expense) => monthKey(expense.date)).filter(Boolean))].sort().reverse(),
    [expenses],
  );

  const timelineData = useMemo(() => {
    const bikeExpenses = expenses.filter((expense) => expense.type === "bike");
    const monthExpenses = bikeExpenses.filter((expense) => monthKey(expense.date) === month);
    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const bySub = new Map<string, number>();

    for (const expense of monthExpenses) {
      const key = expense.bikeSubType || "other";
      bySub.set(key, (bySub.get(key) || 0) + expense.amount);
    }

    const timeline = [...monthExpenses].sort((a, b) => b.date.localeCompare(a.date));
    return { total, bySub, timeline };
  }, [expenses, month]);

  return (
    <section className="space-y-4">
      <SectionHeader
        icon={<Wallet className="h-4 w-4" />}
        title="Bike Expenses"
        subtitle="Track every rupee spent on your vehicle"
      />

      {/* Hero total */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {filter === "all" ? "Total spent" : `Total ${labelOf(filter)}`}
            </p>
            <p className="fin-number mt-1 text-3xl font-semibold sm:text-4xl">
              {formatCurrency(total)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{filtered.length} entries</p>
          </div>
          <Button
            onClick={() => setOpen((o) => !o)}
            className="h-11 rounded-2xl bg-gradient-primary px-4 font-semibold text-primary-foreground shadow-glow hover:opacity-95"
          >
            <Plus className="mr-1 h-4 w-4" />
            {open ? "Close" : "Add"}
          </Button>
        </div>
      </div>

      {/* Sub-category pills */}
      <div className="flex flex-wrap gap-2">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterPill>
        {BIKE_SUBTYPES.map((s) => (
          <FilterPill
            key={s.id}
            active={filter === s.id}
            color={s.color}
            onClick={() => setFilter(s.id)}
          >
            {s.name}
          </FilterPill>
        ))}
      </div>

      {/* Inline form */}
      {open && (
        <ExpenseForm
          defaultSubType={filter === "all" ? "petrol" : filter}
          onSaved={() => {
            setOpen(false);
            onChanged();
          }}
        />
      )}

      {/* List */}
      <ExpenseList expenses={filtered} onChanged={onChanged} />
    </section>
  );
}

function FilterPill({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-transparent bg-foreground text-background shadow-soft"
          : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
      style={active && color ? { background: color, color: "#fff" } : undefined}
    >
      {children}
    </button>
  );
}

function ExpenseForm({
  defaultSubType,
  onSaved,
}: {
  defaultSubType: BikeSubType;
  onSaved: () => void;
}) {
  const [subType, setSubType] = useState<BikeSubType>(defaultSubType);
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");

    setSaving(true);
    const sub = BIKE_SUBTYPES.find((s) => s.id === subType)!;
    const { error } = await addExpense({
      title: title.trim() || sub.name,
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
    toast.success(`${sub.name} expense added`);
    setAmount("");
    setTitle("");
    setNote("");
    onSaved();
  };

  return (
    <form onSubmit={submit} className="glass-card animate-fade-in space-y-4 rounded-3xl p-5">
      <p className="text-sm font-semibold">New bike expense</p>

      {/* sub-type chips */}
      <div className="flex flex-wrap gap-2">
        {BIKE_SUBTYPES.map((s) => {
          const active = subType === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSubType(s.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                active
                  ? "border-transparent text-white shadow-soft"
                  : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary",
              )}
              style={active ? { background: s.color } : undefined}
            >
              <CategoryIcon name={s.icon} color={active ? "#fff" : s.color} background={false} size={14} />
              {s.name}
            </button>
          );
        })}
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
              placeholder="e.g. Shell V-Power"
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
        <Plus className="mr-1 h-4 w-4" /> {saving ? "Saving…" : "Save expense"}
      </Button>
    </form>
  );
}

function ExpenseList({ expenses, onChanged }: { expenses: Expense[]; onChanged: () => void }) {
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

  if (expenses.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-10 text-center text-sm text-muted-foreground">
        No bike expenses yet. Tap <b className="text-foreground">Add</b> to log your first one.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[...expenses]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((e) => {
          const sub = BIKE_SUBTYPES.find((s) => s.id === e.bikeSubType);
          return (
            <div key={e.id} className="group glass-card flex items-center gap-3 rounded-2xl p-3.5 sm:p-4">
              <CategoryIcon
                name={sub?.icon || "Car"}
                color={sub?.color || "#10b981"}
                className="h-11 w-11"
                size={20}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{e.title || sub?.name}</p>
                  {sub && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: `${sub.color}22`, color: sub.color }}
                    >
                      {sub.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(e.date, { day: "numeric", month: "short", year: "numeric" })}
                  {e.note ? ` • ${e.note}` : ""}
                </p>
              </div>
              <p className="fin-number whitespace-nowrap font-semibold">-{formatCurrency(e.amount)}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(e.id)}
                className="h-8 w-8 text-muted-foreground opacity-100 transition-opacity hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
    </div>
  );
}

/* =================== FUEL AVERAGE CALCULATOR =================== */

function FuelAverageSection({ logs, onChanged }: { logs: FuelLog[]; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const cycles = useMemo(() => computeFuelCycles(logs), [logs]);
  const latest = cycles[cycles.length - 1];
  const fullTanks = logs.filter((l) => l.is_full_tank).length;

  const overallAvg =
    cycles.length > 0
      ? cycles.reduce((s, c) => s + c.averageKmPerL, 0) / cycles.length
      : 0;

  return (
    <section className="space-y-4">
      <SectionHeader
        icon={<Sparkles className="h-4 w-4" />}
        title="Fuel Average Calculator"
        subtitle="Auto-calculated between full tank entries"
      />

      {/* Hero stats */}
      {latest ? (
        <div className="relative overflow-hidden rounded-3xl glass-card p-6">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                  <Gauge className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Latest Average</p>
                  <p className="fin-number text-3xl font-semibold sm:text-4xl">
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
              <Stat label="Overall avg" value={`${overallAvg.toFixed(2)} km/L`} />
            </div>

            <p className="mt-4 text-[11px] text-muted-foreground">
              Cycle: {formatDate(latest.fromDate, { day: "numeric", month: "short" })} →{" "}
              {formatDate(latest.toDate, { day: "numeric", month: "short" })} ({latest.fromOdo} → {latest.toOdo} km)
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warning/15 text-warning">
              <Info className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Waiting for full tank to calculate average</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add at least <span className="font-medium text-foreground">two “Full Tank”</span> entries with
                odometer readings. Average will be calculated automatically.
              </p>
              <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                <span>
                  <b className="text-foreground">{fullTanks}</b> full tanks
                </span>
                <span>•</span>
                <span>
                  <b className="text-foreground">{logs.length}</b> total entries
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => setOpen((o) => !o)}
          variant="outline"
          className="h-10 rounded-2xl"
        >
          <Plus className="mr-1 h-4 w-4" />
          {open ? "Close" : "Log fuel"}
        </Button>
      </div>

      {open && (
        <FuelForm
          lastOdometer={logs[0]?.odometer}
          onSaved={() => {
            setOpen(false);
            onChanged();
          }}
        />
      )}

      <FuelHistory logs={logs} onDeleted={onChanged} />
    </section>
  );
}

function FuelForm({ lastOdometer, onSaved }: { lastOdometer?: number; onSaved: () => void }) {
  const [date, setDate] = useState(todayISO());
  const [odometer, setOdometer] = useState("");
  const [liters, setLiters] = useState("");
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
      fuel_cost: null,
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
    onSaved();
  };

  return (
    <form onSubmit={submit} className="glass-card animate-fade-in space-y-4 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Log fuel reading</p>
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
        <div className="col-span-2">
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
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Tip: Toggle <b className="text-foreground">Full tank</b> ON every time you fill it completely. Average is
        calculated between two full tanks.
      </p>

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

  if (logs.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-10 text-center text-sm text-muted-foreground">
        No fuel entries yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="px-1 text-xs uppercase tracking-widest text-muted-foreground">Fuel history</h3>
      {logs.map((log) => (
        <div key={log.id} className="group glass-card flex items-center gap-3 rounded-2xl p-3.5 sm:p-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              log.is_full_tank ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground",
            )}
          >
            <Fuel className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{Number(log.fuel_liters).toFixed(2)} L</p>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(log.id)}
            className="h-8 w-8 text-muted-foreground opacity-100 transition-opacity hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

/* =================== SHARED =================== */

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold leading-tight sm:text-lg">{title}</h2>
        <p className="text-[11px] text-muted-foreground sm:text-xs">{subtitle}</p>
      </div>
    </div>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="fin-number mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function labelOf(sub: BikeSubType) {
  return BIKE_SUBTYPES.find((s) => s.id === sub)?.name ?? sub;
}
