import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { formatCurrency, monthKey, monthShort, previousMonth, todayISO } from "@/lib/format";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Category, Expense } from "@/types/expense";
import { getExpenses } from "@/services/expenseService";
import { toast } from "sonner";
import { getCategories } from "@/services/categoryService";

export function Analytics() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

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

  const current = monthKey(todayISO());
  const prev = previousMonth(current);

  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) map.set(monthKey(e.date), (map.get(monthKey(e.date)) || 0) + e.amount);
    const last6: { month: string; label: string; total: number }[] = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = monthKey(d);
      last6.push({ month: key, label: monthShort(key), total: map.get(key) || 0 });
    }
    return last6;
  }, [expenses]);

  const pie = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses.filter((x) => monthKey(x.date) === current)) {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    }
    return [...map.entries()].map(([id, value]) => {
      const cat = categories.find((c) => c.id === id);
      return { name: cat?.name || id, value, color: cat?.color || "#94a3b8" };
    }).sort((a, b) => b.value - a.value);
  }, [expenses, categories, current]);

  const currentTotal = monthlyData[monthlyData.length - 1]?.total || 0;
  const prevTotal = expenses.filter((e) => monthKey(e.date) === prev).reduce((s, e) => s + e.amount, 0);
  const change = prevTotal === 0 ? 0 : ((currentTotal - prevTotal) / prevTotal) * 100;
  const up = change > 0;

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader title="Analytics" subtitle="Spending insights" />

      <section className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">This month</p>
          <p className="fin-number text-2xl font-semibold mt-1">{formatCurrency(currentTotal)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Last month</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="fin-number text-2xl font-semibold">{formatCurrency(prevTotal)}</p>
            {prevTotal > 0 && (
              <span className={`inline-flex items-center text-[11px] font-medium ${up ? "text-destructive" : "text-primary"}`}>
                {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(change).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Bar chart */}
      <section className="glass-card rounded-3xl p-5">
        <h3 className="font-semibold mb-1">6-month trend</h3>
        <p className="text-xs text-muted-foreground mb-4">Total spending per month</p>
        <div className="h-56 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barSize={28}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--secondary) / 0.5)" }}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: number) => [formatCurrency(v), "Total"]}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              />
              <Bar dataKey="total" fill="url(#barGrad)" radius={[8, 8, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Pie chart */}
      <section className="glass-card rounded-3xl p-5">
        <h3 className="font-semibold mb-1">Category split</h3>
        <p className="text-xs text-muted-foreground mb-4">This month by category</p>
        {pie.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">No data this month.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {pie.map((p, i) => (
                      <Cell key={i} fill={p.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {pie.map((p) => {
                const total = pie.reduce((s, x) => s + x.value, 0);
                const pct = ((p.value / total) * 100).toFixed(0);
                return (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm">{p.name}</span>
                      <span className="text-xs text-muted-foreground fin-number">{formatCurrency(p.value)} • {pct}%</span>
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
