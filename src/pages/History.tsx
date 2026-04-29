import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseListItem } from "@/components/ExpenseListItem";
import { formatCurrency, monthKey, monthLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getExpenses } from "@/services/expenseService";
import { getCategories } from "@/services/categoryService";
import { Category, Expense } from "@/types/expense";
import { Loader } from "@/components/Loader";

export function History() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [month, setMonth] = useState<string>("all");
  const [cat, setCat] = useState<string>("all");
  const [minAmt, setMinAmt] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: expenseData, error: expenseError }, { data: categoryData, error: categoryError }] =
        await Promise.all([getExpenses(), getCategories()]);

      if (expenseError) {
        console.error(expenseError);
        toast.error("Failed to load expenses");
      }

      if (categoryError) {
        console.error(categoryError);
        toast.error("Failed to load categories");
      }

      setExpenses(expenseData || []);
      setCategories(categoryData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const months = useMemo(() => {
    return [...new Set(expenses.map((expense) => monthKey(expense.date)))].sort().reverse();
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter((expense) => {
      if (month !== "all" && monthKey(expense.date) !== month) return false;
      if (cat !== "all" && expense.category !== cat) return false;
      if (minAmt && expense.amount < parseFloat(minAmt)) return false;

      if (q) {
        const search = q.toLowerCase();
        const titleMatches = (expense.title || "").toLowerCase().includes(search);
        const noteMatches = (expense.note || "").toLowerCase().includes(search);
        if (!titleMatches && !noteMatches) return false;
      }

      return true;
    });
  }, [expenses, month, cat, minAmt, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const expense of filtered) {
      const key = monthKey(expense.date);
      const currentItems = map.get(key) || [];
      currentItems.push(expense);
      map.set(key, currentItems);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);

  const exportCSV = () => {
    const rows = [
      ["Date", "Title", "Category", "Type", "Sub", "Amount", "Note"],
    ];

    for (const expense of filtered) {
      rows.push([
        expense.date,
        expense.title,
        expense.category,
        expense.type,
        expense.bikeSubType || "",
        String(expense.amount),
        expense.note || "",
      ]);
    }

    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses-${month === "all" ? "all" : month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  if (loading) {
    return <Loader label="Loading history" sublabel="Gathering your expense timeline" />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="History"
        subtitle={`${filtered.length} transactions - ${formatCurrency(total)}`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="rounded-xl"
          >
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="mb-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or notes..."
            className="h-12 rounded-2xl border-border bg-secondary pl-10"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="h-11 rounded-xl border-border bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All months</SelectItem>
              {months.map((item) => (
                <SelectItem key={item} value={item}>
                  {monthLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="h-11 rounded-xl border-border bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="number"
              value={minAmt}
              onChange={(e) => setMinAmt(e.target.value)}
              placeholder="Min Rs"
              className="h-11 rounded-xl border-border bg-secondary pl-9"
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
          {grouped.map(([groupMonth, items]) => {
            const monthTotal = items.reduce((sum, expense) => sum + expense.amount, 0);
            return (
              <section key={groupMonth}>
                <div className="mb-2 flex items-center justify-between px-2">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                    {monthLabel(groupMonth)}
                  </h3>
                  <span className="fin-number text-xs text-muted-foreground">
                    {formatCurrency(monthTotal)}
                  </span>
                </div>
                <div className="glass-card rounded-3xl p-2 space-y-1">
                  {items.map((expense) => (
                    <ExpenseListItem
                      key={expense.id}
                      expense={expense}
                      onDelete={(id) => setExpenses((prev) => prev.filter((item) => item.id !== id))}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
