import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Check, Edit2, X } from "lucide-react";
import type { Category, Expense, ExpenseInput } from "@/types/expense";
import { updateExpense } from "@/services/expenseService";
import { getCategories } from "@/services/categoryService";
import { BIKE_SUBTYPES } from "@/lib/categories";

interface Props {
  expense: Expense;
  onSuccess?: (expense: Expense) => void;
}

export function EditExpenseDialog({ expense, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState(expense.category);
  const [date, setDate] = useState(expense.date);
  const [note, setNote] = useState(expense.note || "");
  const [bikeSubType, setBikeSubType] = useState(expense.bikeSubType || "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchCategories = async () => {
      const { data, error } = await getCategories();
      if (error) {
        toast.error("Failed to load categories");
        return;
      }
      setCategories(data || []);
    };

    fetchCategories();
  }, [open]);

  const reset = () => {
    setTitle(expense.title);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setDate(expense.date);
    setNote(expense.note || "");
    setBikeSubType(expense.bikeSubType || "");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (!title.trim()) {
      toast.error("Enter a title");
      return;
    }

    setSubmitting(true);

    const payload: Partial<ExpenseInput> = {
      title: title.trim(),
      amount: amt,
      category,
      type: expense.type,
      date,
      note: note.trim() || undefined,
    };

    if (expense.type === "bike" && bikeSubType) {
      payload.bikeSubType = bikeSubType as any;
    }

    const { data, error } = await updateExpense(expense.id, payload);
    setSubmitting(false);

    if (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update expense");
      console.error(error);
      return;
    }

    if (data?.[0]) {
      onSuccess?.(data[0]);
    }

    toast.success("Expense updated");
    setOpen(false);
  };

  const isBike = expense.type === "bike";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-primary transition-colors duration-300"
          aria-label="Edit"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border w-[calc(100vw-1.5rem)] sm:max-w-lg md:max-w-xl max-h-[92vh] rounded-3xl border p-0 flex flex-col overflow-hidden">
        {/* Fixed Header with solid background */}
        <div className="flex-shrink-0 border-b border-border/60 bg-gradient-to-br from-background via-background to-background p-4 sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 rounded-t-3xl" />
          
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 flex-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow">
                <Edit2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <DialogTitle className="text-lg font-semibold sm:text-xl">Edit expense</DialogTitle>
            </div>
          </div>
        </div>

        {/* Scrollable Form content */}
        <form onSubmit={submit} className="flex-1 overflow-y-auto space-y-4 p-4 sm:p-6">
          {/* Title Field */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Groceries"
              className="h-12 sm:h-11 rounded-2xl sm:rounded-xl border-border bg-secondary/50 text-base placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-300"
              autoFocus
            />
          </div>

          {/* Amount Field */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Amount (Rs)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="h-12 sm:h-11 rounded-2xl sm:rounded-xl border-border bg-secondary/50 text-lg fin-number placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-300"
            />
          </div>

          {/* Category and Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3">
            <div className="space-y-2.5">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 sm:h-11 rounded-2xl sm:rounded-xl border-border bg-secondary/50 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5">
              <Label className="text-sm font-medium">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 sm:h-11 rounded-2xl sm:rounded-xl border-border bg-secondary/50 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Bike Subtype - Conditional */}
          {isBike && (
            <div className="space-y-2.5">
              <Label className="text-sm font-medium">Type</Label>
              <Select value={bikeSubType} onValueChange={setBikeSubType}>
                <SelectTrigger className="h-12 sm:h-11 rounded-2xl sm:rounded-xl border-border bg-secondary/50 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-300">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border">
                  {BIKE_SUBTYPES.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes Textarea */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note about this expense..."
              className="resize-none rounded-2xl sm:rounded-xl border-border bg-secondary/50 text-base placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-300"
            />
          </div>

          {/* Spacing for buttons */}
          <div className="h-2" />
        </form>

        {/* Fixed Footer with buttons */}
        <div className="flex-shrink-0 border-t border-border/60 bg-background/80 backdrop-blur-sm p-4 sm:p-6">
          <div className="flex flex-col-reverse sm:flex-row gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-12 sm:h-11 rounded-2xl sm:rounded-xl border-border font-medium transition-all duration-300 hover:bg-secondary/60"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={submit}
              disabled={submitting}
              className="h-12 sm:h-11 rounded-2xl sm:rounded-xl bg-gradient-primary font-semibold text-primary-foreground shadow-glow hover:shadow-glow/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              {submitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Update expense
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
