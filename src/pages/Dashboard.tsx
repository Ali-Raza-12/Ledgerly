import { useEffect, useMemo, useState } from "react";
import { formatCurrency, monthKey, monthLabel, previousMonth, todayISO } from "@/lib/format";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ArrowDownRight, ArrowRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Progress } from "@/components/ui/progress";
import { ExpenseListItem } from "@/components/ExpenseListItem";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getExpenses } from "@/services/expenseService";
import { getCategories } from "@/services/categoryService";
import { getBudget } from "@/services/budgetService";
import { Category, Expense } from "@/types/expense";
import { toast } from "sonner";

export function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budget, setBudgetAmount] = useState<number | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      const { data, error } = await getExpenses();
      if (error) {
        toast.error(error instanceof Error ? error.message : "Failed to fetch expenses");
        return;
      } 
      setExpenses(data || []);
    };
    const fetchCategories = async () => {
      const { data, error } = await getCategories();
      if (error) {
        toast.error("Failed to fetch categories");
        return;
      }
      setCategories(data || []);
    };

    fetchExpenses();
    fetchCategories();
  }, []);

  const currentMonth = monthKey(todayISO());
  const prevMonth = previousMonth(currentMonth);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const value = await getBudget(currentMonth);
        setBudgetAmount(value);
      } catch (error) {
        console.error("Failed to fetch budget:", error);
        toast.error(error instanceof Error ? error.message : "Failed to fetch budget");
        setBudgetAmount(null);
      }
    };

    fetchBudget();
  }, [currentMonth]);

  const data = useMemo(() => {
    const monthExp = expenses.filter((e) => monthKey(e.date) === currentMonth);
    const prevExp = expenses.filter((e) => monthKey(e.date) === prevMonth);
    const total = monthExp.reduce((s, e) => s + e.amount, 0);
    const prevTotal = prevExp.reduce((s, e) => s + e.amount, 0);
    const today = todayISO();
    const todayTotal = monthExp.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0);

    const byCat = new Map<string, number>();
    for (const e of monthExp) byCat.set(e.category, (byCat.get(e.category) || 0) + e.amount);
    const cats = [...byCat.entries()]
      .map(([id, amount]) => ({ id, amount, cat: categories.find((c) => c.id === id) }))
      .sort((a, b) => b.amount - a.amount);

    const top = cats[0];
    const change = prevTotal === 0 ? 0 : ((total - prevTotal) / prevTotal) * 100;

    return { total, prevTotal, todayTotal, cats, top, change, monthExp };
  }, [expenses, categories, currentMonth, prevMonth]);

  const budgetUsed = budget ? Math.min(100, (data.total / budget) * 100) : 0;
  const overBudget = budget != null && data.total > budget;

  const recent = [...data.monthExp].slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero balance card */}
      <section className="relative overflow-hidden rounded-3xl glass-card p-6 lg:p-8">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{monthLabel(currentMonth)}</p>
              <p className="text-sm text-muted-foreground mt-1">Total spent</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <BrandLogo className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <h2 className="fin-number text-4xl lg:text-5xl font-semibold">{formatCurrency(data.total)}</h2>
            {data.prevTotal > 0 && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  data.change > 0 ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
                }`}
              >
                {data.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(data.change).toFixed(0)}%
              </span>
            )}
          </div>

          {budget != null && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Budget {formatCurrency(budget)}</span>
                <span className={overBudget ? "text-destructive font-medium" : ""}>
                  {overBudget ? "Over budget" : `${formatCurrency(budget - data.total)} left`}
                </span>
              </div>
              <Progress value={budgetUsed} className="h-2 bg-secondary" />
            </div>
          )}
        </div>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Today" value={formatCurrency(data.todayTotal)} accent="primary" />
        <StatCard
          label="Top category"
          value={data.top?.cat?.name || "—"}
          sub={data.top ? formatCurrency(data.top.amount) : ""}
          accent="accent"
          color={data.top?.cat?.color}
        />
      </section>

      {/* Category breakdown */}
      <section className="glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Categories</h3>
          <span className="text-xs text-muted-foreground">{data.cats.length} active</span>
        </div>
        {data.cats.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No expenses yet this month.</p>
        ) : (
          <div className="space-y-3">
            {data.cats.slice(0, 5).map(({ id, amount, cat }) => {
              const pct = data.total > 0 ? (amount / data.total) * 100 : 0;
              return (
                <div key={id} className="flex items-center gap-3">
                  <CategoryIcon name={cat?.icon || "Circle"} color={cat?.color} className="h-10 w-10" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{cat?.name || id}</span>
                      <span className="fin-number text-sm">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: cat?.color || "hsl(var(--primary))" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent transactions */}
      <section className="glass-card rounded-3xl p-3 lg:p-4">
        <div className="flex items-center justify-between px-2 pt-2 mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Recent activity
          </h3>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="group h-8 gap-1 rounded-full border border-border bg-secondary/40 px-3 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:text-primary hover:shadow-glow"
          >
            <Link to="/history">
              View all
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No activity yet — tap + to add your first expense.</p>
        ) : (
          <div className="space-y-1">
            {recent.map((e) => (
              <ExpenseListItem 
                key={e.id} 
                expense={e}
                onDelete={(id) => setExpenses((prev) => prev.filter((exp) => exp.id !== id))}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, sub, accent, color }: { label: string; value: string; sub?: string; accent: "primary" | "accent"; color?: string }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: color || (accent === "primary" ? "hsl(var(--primary))" : "hsl(var(--accent))") }}
        />
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 fin-number text-xl font-semibold truncate">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
