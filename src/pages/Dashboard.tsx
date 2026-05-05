import { useMemo } from "react";
import { formatCurrency, monthKey, monthLabel, previousMonth, todayISO } from "@/lib/format";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ArrowDownRight, ArrowRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Progress } from "@/components/ui/progress";
import { ExpenseListItem } from "@/components/ExpenseListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { deleteExpense, getExpenses } from "@/services/expenseService";
import { getCategories } from "@/services/categoryService";
import { getBudget } from "@/services/budgetService";
import { useQueryClient, useQuery } from "@tanstack/react-query";

export function Dashboard() {

  const currentMonth = monthKey(todayISO());
  const prevMonth = previousMonth(currentMonth);
  const QueryClient = useQueryClient();

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({ 
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await getExpenses();
      return res.data || [];
    },
    retry: 1,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
      return res.data || [];
    },
    retry: 1,
  });

  const { data: budget, isLoading: budgetLoading } = useQuery({
    queryKey: ["budget", currentMonth],
    queryFn: async () => {
      return await getBudget(currentMonth);
    },
    retry: 1,
  });

  const dashboardData = useMemo(() => {
  const monthExp = expenses.filter((e) => monthKey(e.date) === currentMonth);
  const prevExp = expenses.filter((e) => monthKey(e.date) === prevMonth);

  const total = monthExp.reduce((s, e) => s + e.amount, 0);
  const prevTotal = prevExp.reduce((s, e) => s + e.amount, 0);

  const today = todayISO();
  const todayTotal = monthExp
    .filter((e) => e.date === today)
    .reduce((s, e) => s + e.amount, 0);

  const byCat = new Map();
  for (const e of monthExp) {
    byCat.set(e.category, (byCat.get(e.category) || 0) + e.amount);
  }

  const cats = [...byCat.entries()]
    .map(([id, amount]) => ({
      id,
      amount,
      cat: categories.find((c) => c.id === id),
    }))
    .sort((a, b) => b.amount - a.amount);

  const top = cats[0];
  const change =
    prevTotal === 0 ? 0 : ((total - prevTotal) / prevTotal) * 100;

  return { total, prevTotal, todayTotal, cats, top, change, monthExp };

  }, [expenses, categories, currentMonth, prevMonth]);

  const budgetUsed = budget ? Math.min(100, (dashboardData.total / budget) * 100) : 0;
  const overBudget = budget != null && dashboardData.total > budget;

  const recent = [...dashboardData.monthExp].slice(0, 5);

  if (expensesLoading || categoriesLoading || budgetLoading) {
    return <DashboardSkeleton />;
  }

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
            <h2 className="fin-number text-4xl lg:text-5xl font-semibold">{formatCurrency(dashboardData.total)}</h2>
            {dashboardData.prevTotal > 0 && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  dashboardData.change > 0 ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
                }`}
              >
                {dashboardData.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(dashboardData.change).toFixed(0)}%
              </span>
            )}
          </div>

          {budget != null && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Budget {formatCurrency(budget)}</span>
                <span className={overBudget ? "text-destructive font-medium" : ""}>
                  {overBudget ? "Over budget" : `${formatCurrency(budget - dashboardData.total)} left`}
                </span>
              </div>
              <Progress value={budgetUsed} className="h-2 bg-secondary" />
            </div>
          )}
        </div>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Today" value={formatCurrency(dashboardData.todayTotal)} accent="primary" />
        <StatCard
          label="Top category"
          value={dashboardData.top?.cat?.name || "—"}
          sub={dashboardData.top ? formatCurrency(dashboardData.top.amount) : ""}
          accent="accent"
          color={dashboardData.top?.cat?.color}
        />
      </section>

      {/* Category breakdown */}
      <section className="glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Categories</h3>
          <span className="text-xs text-muted-foreground">{dashboardData.cats.length} active</span>
        </div>
        {dashboardData.cats.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No expenses yet this month.</p>
        ) : (
          <div className="space-y-3">
            {dashboardData.cats.slice(0, 5).map(({ id, amount, cat }) => {
              const pct = dashboardData.total > 0 ? (amount / dashboardData.total) * 100 : 0;
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
                onDelete={async (id) => {
                  await deleteExpense(id);
                  QueryClient.invalidateQueries({ queryKey: ["expenses"] });
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl glass-card p-6 lg:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 rounded-full bg-secondary/80" />
              <Skeleton className="h-4 w-20 rounded-full bg-secondary/70" />
            </div>
            <Skeleton className="h-10 w-10 rounded-2xl bg-secondary/80" />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Skeleton className="h-12 w-48 rounded-2xl bg-secondary/80" />
            <Skeleton className="h-6 w-16 rounded-full bg-secondary/70" />
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24 rounded-full bg-secondary/70" />
              <Skeleton className="h-3 w-20 rounded-full bg-secondary/70" />
            </div>
            <Skeleton className="h-2 w-full rounded-full bg-secondary/80" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {[0, 1].map((item) => (
          <div key={item} className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full bg-secondary/80" />
              <Skeleton className="h-3 w-20 rounded-full bg-secondary/70" />
            </div>
            <Skeleton className="mt-3 h-7 w-28 rounded-xl bg-secondary/80" />
            <Skeleton className="mt-2 h-3 w-16 rounded-full bg-secondary/70" />
          </div>
        ))}
      </section>

      <section className="glass-card rounded-3xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-24 rounded-full bg-secondary/80" />
          <Skeleton className="h-3 w-12 rounded-full bg-secondary/70" />
        </div>
        <div className="space-y-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl bg-secondary/80" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-24 rounded-full bg-secondary/80" />
                  <Skeleton className="h-4 w-16 rounded-full bg-secondary/70" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full bg-secondary/80" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-3xl p-3 lg:p-4">
        <div className="mb-2 flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full bg-secondary/80" />
            <Skeleton className="h-5 w-28 rounded-full bg-secondary/80" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full bg-secondary/70" />
        </div>

        <div className="space-y-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-2xl bg-secondary/80" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 rounded-full bg-secondary/80" />
                  <Skeleton className="h-3 w-20 rounded-full bg-secondary/70" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full bg-secondary/80" />
              </div>
            </div>
          ))}
        </div>
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
