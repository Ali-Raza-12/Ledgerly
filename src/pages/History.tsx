import { useMemo, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseListItem } from "@/components/ExpenseListItem";
import { formatCurrency, monthLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function History() {
  const { expenses, categories } = useExpenses();
  const [q, setQ] = useState("");
  const [month, setMonth] = useState<string>("all");
  const [cat, setCat] = useState<string>("all");
  const [minAmt, setMinAmt] = useState("");

  const months = useMemo(() => {
    return [...new Set(expenses.map((e) => e.month))].sort().reverse();
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (month !== "all" && e.month !== month) return false;
      if (cat !== "all" && e.category !== cat) return false;
      if (minAmt && e.amount < parseFloat(minAmt)) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!e.title.toLowerCase().includes(s) && !(e.note || "").toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [expenses, month, cat, minAmt, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const e of filtered) {
      const arr = map.get(e.month) || [];
      arr.push(e);
      map.set(e.month, arr);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const exportCSV = () => {
    const rows = [["Date", "Title", "Category", "Type", "Sub", "Amount", "Note"]];
    for (const e of filtered) {
      rows.push([e.date, e.title, e.category, e.type, e.bikeSubType || "", String(e.amount), e.note || ""]);
    }
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${month === "all" ? "all" : month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="History"
        subtitle={`${filtered.length} transactions • ${formatCurrency(total)}`}
        action={
          <Button variant="outline" size="sm" onClick={exportCSV} className="rounded-xl">
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
        }
      />

      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or notes…"
            className="pl-10 h-12 rounded-2xl bg-secondary border-border"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="h-11 rounded-xl bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All months</SelectItem>
              {months.map((m) => (
                <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="h-11 rounded-xl bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={minAmt}
              onChange={(e) => setMinAmt(e.target.value)}
              placeholder="Min Rs"
              className="pl-9 h-11 rounded-xl bg-secondary border-border"
            />
          </div>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center text-muted-foreground">
          No expenses match your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([m, items]) => {
            const monthTotal = items.reduce((s, e) => s + e.amount, 0);
            return (
              <section key={m}>
                <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground">{monthLabel(m)}</h3>
                  <span className="text-xs fin-number text-muted-foreground">{formatCurrency(monthTotal)}</span>
                </div>
                <div className="glass-card rounded-3xl p-2 space-y-1">
                  {items.map((e) => <ExpenseListItem key={e.id} expense={e} />)}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
