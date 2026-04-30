import { Category, Expense } from "@/types/expense";
import { CategoryIcon } from "./CategoryIcon";
import { getCategories } from "@/services/categoryService";
import { deleteExpense } from "@/services/expenseService";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { BIKE_SUBTYPES } from "@/lib/categories";
import { toast } from "sonner";

export function ExpenseListItem({ expense, onDelete }: { expense: Expense; onDelete?: (id: string) => void }) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await getCategories();
      if (error) {
        return;
      }
      setCategories(data || []);
    };

    fetchCategories();
  }, []);

  const cat = categories.find((c) => c.id === expense.category);
  const sub = expense.bikeSubType ? BIKE_SUBTYPES.find((s) => s.id === expense.bikeSubType) : null;
  const icon = sub?.icon || cat?.icon || "Circle";
  const color = sub?.color || cat?.color || "#94a3b8";
  const date = formatDate(expense.date, { day: "numeric", month: "short" });

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${expense.title}"?`)) {
      return;
    }

    const { error } = await deleteExpense(expense.id);
    if (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete expense");
      console.error(error);
      return;
    }

    toast.success("Expense deleted");
    onDelete?.(expense.id);
  };

  return (
    <div className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/60 transition-colors">
      <CategoryIcon name={icon} color={color} size={20} className="h-11 w-11" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{expense.title}</p>
        </div>
        <p className="text-xs text-muted-foreground capitalize">
          {sub ? `${sub.name} • ` : `${cat?.name || expense.category} • `}{date}
        </p>
      </div>
      <div className="text-right">
        <p className="fin-number font-semibold">-{formatCurrency(expense.amount)}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
