import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { BIKE_SUBTYPES } from "@/lib/categories";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatCurrency, formatDate, monthKey, monthLabel, todayISO } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Car, Plus } from "lucide-react";
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
    () => [...new Set(expenses.map((expense) => monthKey(expense.date)).filter(Boolean))].sort().reverse(),
    [expenses],
  );
  const [month, setMonth] = useState<string>(monthKey(todayISO()));

  const data = useMemo(() => {
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
    <div className="animate-fade-in">
      <PageHeader
        title="Vehicle Tracker"
        subtitle="Petrol, oil, repairs and more"
        action={
          <Button asChild size="sm" className="rounded-xl bg-gradient-primary text-primary-foreground transition-all duration-300 hover:shadow-glow hover:scale-[1.03]">
            <Link to="/add"><Plus className="mr-1 h-4 w-4" /> Add</Link>
          </Button>
        }
      />

      <div className="mb-5">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="h-11 w-full rounded-xl border-border bg-secondary sm:w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(months.length ? months : [month]).map((item) => (
              <SelectItem key={item} value={item}>{monthLabel(item)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section className="relative mb-5 overflow-hidden rounded-3xl glass-card p-6">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
            <Car className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Monthly vehicle spend</p>
            <p className="mt-1 fin-number text-3xl font-semibold">{formatCurrency(data.total)}</p>
          </div>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3">
        {BIKE_SUBTYPES.map((subType) => {
          const amount = data.bySub.get(subType.id) || 0;
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

      <section>
        <h3 className="mb-3 px-1 text-xs uppercase tracking-widest text-muted-foreground">Timeline</h3>
        {data.timeline.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center text-muted-foreground">
            No vehicle expenses for this month.
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            <div className="space-y-4">
              {data.timeline.map((expense) => {
                const subType = BIKE_SUBTYPES.find((item) => item.id === expense.bikeSubType);
                return (
                  <div key={expense.id} className="relative">
                    <div
                      className="absolute -left-[18px] top-3 h-3 w-3 rounded-full ring-4 ring-background"
                      style={{ background: subType?.color || "hsl(var(--primary))" }}
                    />
                    <div className="glass-card flex items-center gap-3 rounded-2xl p-4">
                      <CategoryIcon name={subType?.icon || "Car"} color={subType?.color} className="h-10 w-10" size={18} />
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
    </div>
  );
}
