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

  const fuelData = useMemo(() => {
    const { cycles, activeCycle } = buildFuelCycles(fuelLogs);
    const latestCycle = cycles[0] ?? null;
    const bestCycle =
      cycles.length > 0
        ? cycles.reduce((best, cycle) =>
            cycle.averageKmPerLitre > best.averageKmPerLitre ? cycle : best,
          )
        : null;

    const totalDistance = cycles.reduce((sum, cycle) => sum + cycle.distanceKm, 0);
    const totalLitres = cycles.reduce((sum, cycle) => sum + cycle.litresUsed, 0);
    const overallAverage = totalLitres > 0 ? totalDistance / totalLitres : null;
    const fullTankCount = fuelLogs.filter((log) => log.isFullTank).length;

    return {
      cycles,
      activeCycle,
      latestCycle,
      bestCycle,
      overallAverage,
      fullTankCount,
      totalLogs: fuelLogs.length,
      recentLogs: fuelLogs,
    };
  }, [fuelLogs]);

  if (loading) {
    return <Loader label="Loading vehicle data" sublabel="Preparing your timeline and fuel insights" />;
  }

  const action =
    tab === "timeline" ? (
      <Button
        asChild
        size="sm"
        className="rounded-xl bg-gradient-primary text-primary-foreground transition-all duration-300 hover:scale-[1.03] hover:shadow-glow"
      >
        <Link to="/add">
          <Plus className="mr-1 h-4 w-4" /> Add
        </Link>
      </Button>
    ) : (
      <AddFuelLogDialog
        onSuccess={(log) => setFuelLogs((prev) => [log, ...prev])}
        trigger={
          <Button
            size="sm"
            className="rounded-xl bg-gradient-primary text-primary-foreground transition-all duration-300 hover:scale-[1.03] hover:shadow-glow"
          >
            <Fuel className="mr-1 h-4 w-4" /> Log fuel
          </Button>
        }
      />
    );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Vehicle Tracker" subtitle="Expenses, mileage, and fuel efficiency" action={action} />

      <div className="space-y-5">
        <div>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="h-11 w-full rounded-xl border-border bg-secondary sm:w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(months.length ? months : [month]).map((item) => (
                <SelectItem key={item} value={item}>
                  {monthLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <section className="relative overflow-hidden rounded-3xl glass-card p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <Car className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Monthly vehicle spend</p>
              <p className="mt-1 fin-number text-3xl font-semibold">{formatCurrency(timelineData.total)}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {BIKE_SUBTYPES.map((subType) => {
            const amount = timelineData.bySub.get(subType.id) || 0;
            return (
              <div key={subType.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <CategoryIcon name={subType.icon} color={subType.color} className="h-10 w-10" size={18} />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{subType.name}</p>
                    <p className="fin-number truncate font-semibold">{formatCurrency(amount)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6 space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl border border-border bg-secondary/70 p-1">
          <TabsTrigger
            value="timeline"
            className="gap-2 rounded-xl px-4 py-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-glow"
          >
            <History className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger
            value="fuel"
            className="gap-2 rounded-xl px-4 py-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-glow"
          >
            <Fuel className="h-4 w-4" />
            Fuel Average
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-0 space-y-5 focus-visible:ring-0">
          <section>
            <h3 className="mb-3 px-1 text-xs uppercase tracking-widest text-muted-foreground">Timeline</h3>
            {timelineData.timeline.length === 0 ? (
              <div className="glass-card rounded-3xl p-10 text-center text-muted-foreground">
                No vehicle expenses for this month.
              </div>
            ) : (
              <div className="relative pl-6">
                <div className="absolute bottom-2 left-2 top-2 w-px bg-border" />
                <div className="space-y-4">
                  {timelineData.timeline.map((expense) => {
                    const subType = BIKE_SUBTYPES.find((item) => item.id === expense.bikeSubType);
                    return (
                      <div key={expense.id} className="relative">
                        <div
                          className="absolute -left-[18px] top-3 h-3 w-3 rounded-full ring-4 ring-background"
                          style={{ background: subType?.color || "hsl(var(--primary))" }}
                        />
                        <div className="glass-card flex items-center gap-3 rounded-2xl p-4">
                          <CategoryIcon
                            name={subType?.icon || "Car"}
                            color={subType?.color}
                            className="h-10 w-10"
                            size={18}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{expense.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {subType?.name} - {formatDate(expense.date, { day: "numeric", month: "short" })}
                            </p>
                          </div>
                          <p className="fin-number font-semibold">{formatCurrency(expense.amount)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="fuel" className="mt-0 space-y-5 focus-visible:ring-0">
          <section className="relative overflow-hidden rounded-3xl glass-card p-6">
            <div className="pointer-events-none absolute -left-12 top-0 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 right-0 h-44 w-44 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Fuel efficiency</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                      <Fuel className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="fin-number text-3xl font-semibold">
                        {fuelData.latestCycle ? formatAverage(fuelData.latestCycle.averageKmPerLitre) : "Awaiting data"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {fuelData.latestCycle
                          ? `Latest full-to-full cycle ended ${formatDate(fuelData.latestCycle.endDate, {
                              day: "numeric",
                              month: "short",
                            })}`
                          : "Your first average appears after two full tank logs"}
                      </p>
                    </div>
                  </div>
                </div>
                <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {fuelData.fullTankCount} full tank logs
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                Average uses the full tank method: litres added between two full tank readings divided by the distance travelled.
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={<Gauge className="h-4 w-4" />}
              label="Overall average"
              value={fuelData.overallAverage ? formatAverage(fuelData.overallAverage) : "Not ready"}
              tone="primary"
            />
            <MetricCard
              icon={<Sparkles className="h-4 w-4" />}
              label="Best mileage"
              value={fuelData.bestCycle ? formatAverage(fuelData.bestCycle.averageKmPerLitre) : "Not ready"}
              tone="accent"
            />
            <MetricCard
              icon={<Route className="h-4 w-4" />}
              label="Current tracking"
              value={fuelData.activeCycle ? formatDistance(fuelData.activeCycle.distanceKm) : "Waiting"}
              sub={
                fuelData.activeCycle
                  ? `${formatLitres(fuelData.activeCycle.litresAdded)} added so far`
                  : "Log a full tank to start tracking"
              }
              tone="primary"
            />
            <MetricCard
              icon={<History className="h-4 w-4" />}
              label="Fuel entries"
              value={String(fuelData.totalLogs)}
              sub={`${fuelData.cycles.length} completed cycles`}
              tone="accent"
            />
          </section>

          {fuelData.cycles.length === 0 ? (
            <section className="glass-card rounded-3xl p-10 text-center">
              <Fuel className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">Add two full tank readings to unlock your first fuel average.</p>
            </section>
          ) : (
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Average history</h3>
                <span className="text-xs text-muted-foreground">{fuelData.cycles.length} cycles</span>
              </div>
              <div className="space-y-3">
                {fuelData.cycles.map((cycle) => (
                  <div key={cycle.id} className="glass-card rounded-3xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{formatAverage(cycle.averageKmPerLitre)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(cycle.startDate, { day: "numeric", month: "short" })} to{" "}
                          {formatDate(cycle.endDate, { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <span className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] text-muted-foreground">
                        {cycle.logsCount} fills
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <MiniFuelStat label="Distance" value={formatDistance(cycle.distanceKm)} />
                      <MiniFuelStat label="Fuel used" value={formatLitres(cycle.litresUsed)} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Fuel log history</h3>
              <span className="text-xs text-muted-foreground">{fuelData.recentLogs.length} entries</span>
            </div>

            {fuelData.recentLogs.length === 0 ? (
              <div className="glass-card rounded-3xl p-10 text-center text-muted-foreground">
                No fuel logs yet.
              </div>
            ) : (
              <div className="relative pl-6">
                <div className="absolute bottom-2 left-2 top-2 w-px bg-border" />
                <div className="space-y-4">
                  {fuelData.recentLogs.map((log) => (
                    <div key={log.id} className="relative">
                      <div
                        className={cn(
                          "absolute -left-[18px] top-3 h-3 w-3 rounded-full ring-4 ring-background",
                          log.isFullTank ? "bg-primary" : "bg-accent",
                        )}
                      />
                      <div className="glass-card rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{log.isFullTank ? "Full tank" : "Partial fill"}</p>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                                  log.isFullTank
                                    ? "bg-primary/15 text-primary"
                                    : "bg-accent/15 text-accent-foreground",
                                )}
                              >
                                {log.isFullTank ? "Cycle marker" : "Top-up"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(log.date, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}{" "}
                              - {formatDistance(log.odometerKm)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="fin-number font-semibold">{formatLitres(log.litres)}</p>
                          </div>
                        </div>
                        {log.note ? <p className="mt-3 text-sm text-muted-foreground">{log.note}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: "primary" | "accent";
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            tone === "primary" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent-foreground",
          )}
        >
          {icon}
        </span>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 fin-number text-xl font-semibold">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function MiniFuelStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 fin-number text-sm font-semibold">{value}</p>
    </div>
  );
}
