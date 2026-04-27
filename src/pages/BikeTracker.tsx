import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { BIKE_SUBTYPES } from "@/lib/categories";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatCurrency, monthKey, monthLabel, todayISO } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bike, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { getExpenses } from "@/services/expenseService";
import { Expense } from "@/types/expense";
import { toast } from "sonner";

export function BikeTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await getExpenses();
      if (error) {
        toast.error("Failed to fetch expenses");
        return;
      }
      setExpenses(data || []);
    };

    fetchData();
  }, []);

  const months = useMemo(
    () => [...new Set(expenses.map((e) => e.month))].sort().reverse(),
    [expenses]
  );
  const [month, setMonth] = useState<string>(monthKey(todayISO()));

  const data = useMemo(() => {
    const all = expenses.filter((e) => e.type === "bike");
    const inMonth = all.filter((e) => e.month === month);
    const total = inMonth.reduce((s, e) => s + e.amount, 0);
    const bySub = new Map<string, number>();
    for (const e of inMonth) bySub.set(e.bikeSubType || "other", (bySub.get(e.bikeSubType || "other") || 0) + e.amount);
    const timeline = [...inMonth].sort((a, b) => b.date.localeCompare(a.date));
    return { total, bySub, timeline };
  }, [expenses, month]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Bike Tracker"
        subtitle="Petrol, oil, repairs and more"
        action={
          <Button asChild size="sm" className="rounded-xl bg-gradient-primary text-primary-foreground">
            <Link to="/add"><Plus className="h-4 w-4 mr-1" /> Add</Link>
          </Button>
        }
      />

      <div className="mb-5">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="h-11 rounded-xl bg-secondary border-border w-full sm:w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(months.length ? months : [month]).map((m) => (
              <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section className="relative overflow-hidden glass-card rounded-3xl p-6 mb-5">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Bike className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Monthly bike spend</p>
            <p className="fin-number text-3xl font-semibold mt-1">{formatCurrency(data.total)}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 mb-6">
        {BIKE_SUBTYPES.map((s) => {
          const amount = data.bySub.get(s.id) || 0;
          return (
            <div key={s.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <CategoryIcon name={s.icon} color={s.color} className="h-10 w-10" size={18} />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{s.name}</p>
                  <p className="fin-number font-semibold truncate">{formatCurrency(amount)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section>
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-1">Timeline</h3>
        {data.timeline.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center text-muted-foreground">
            No bike expenses for this month.
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            <div className="space-y-4">
              {data.timeline.map((e) => {
                const sub = BIKE_SUBTYPES.find((s) => s.id === e.bikeSubType);
                return (
                  <div key={e.id} className="relative">
                    <div
                      className="absolute -left-[18px] top-3 h-3 w-3 rounded-full ring-4 ring-background"
                      style={{ background: sub?.color || "hsl(var(--primary))" }}
                    />
                    <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
                      <CategoryIcon name={sub?.icon || "Bike"} color={sub?.color} className="h-10 w-10" size={18} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{e.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {sub?.name} • {new Date(e.date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <p className="fin-number font-semibold">{formatCurrency(e.amount)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
