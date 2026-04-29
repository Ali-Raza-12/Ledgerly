import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/Loader";
import { CategoryIcon } from "@/components/CategoryIcon";
import { BIKE_SUBTYPES } from "@/lib/categories";
import { todayISO, monthKey } from "@/lib/format";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BikeSubType, Category, ExpenseInput } from "@/types/expense";
import { addExpense } from "@/services/expenseService";
import { getCategories } from "@/services/categoryService";

export function AddExpense() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [bikeSub, setBikeSub] = useState<BikeSubType>("petrol");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");

  const selectedCat = categories.find((category) => category.id === categoryId);
  const isBike = selectedCat?.type === "bike";

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await getCategories();
      if (error) {
        toast.error("Failed to fetch categories");
        setLoadingCategories(false);
        return;
      }

      const nextCategories = data || [];
      setCategories(nextCategories);
      setCategoryId((current) => {
        if (current && nextCategories.some((category) => category.id === current)) {
          return current;
        }
        return nextCategories[0]?.id || "";
      });
      setLoadingCategories(false);
    };

    fetchCategories();
  }, []);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const amt = parseFloat(amount);
    if (!title.trim() || !amt || amt <= 0) {
      toast.error("Enter a title and amount");
      return;
    }

    if (!selectedCat) {
      toast.error("Select a category before saving");
      return;
    }

    const expenseData: ExpenseInput = {
      title: title.trim(),
      amount: amt,
      category: categoryId,
      type: isBike ? "bike" : "normal",
      bikeSubType: isBike ? bikeSub : undefined,
      date,
      month: monthKey(date),
      note: note.trim() || undefined,
    };

    const { data, error } = await addExpense(expenseData);

    if (error) {
      toast.error("Failed to add expense");
      console.error(error);
      return;
    }

    if (data?.[0]) {
      toast.success("Expense added");
      navigate("/");
    }
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New expense</h1>
          <p className="text-xs text-muted-foreground">Quick add for the date you choose</p>
        </div>
      </div>

      {loadingCategories ? (
        <Loader label="Loading categories" sublabel="Preparing your expense form" />
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="glass-card rounded-3xl p-6 text-center">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Amount</Label>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-3xl text-muted-foreground">Rs</span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full max-w-[260px] border-0 bg-transparent text-center text-5xl font-semibold outline-none placeholder:text-muted-foreground/40 fin-number"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lunch, Petrol, Movie"
              className="h-12 rounded-2xl border-border bg-secondary"
            />
          </div>

          <div className="space-y-3">
            <Label>Category</Label>
            <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {categories.map((category) => {
                const active = category.id === categoryId;
                return (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => setCategoryId(category.id)}
                    className={cn(
                      "shrink-0 flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all",
                      active
                        ? "border-primary/40 bg-primary/10 shadow-glow"
                        : "border-border bg-secondary/50 hover:bg-secondary",
                    )}
                  >
                    <CategoryIcon name={category.icon} color={category.color} size={16} className="h-7 w-7" />
                    <span className="pr-1 text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {isBike && (
            <div className="animate-scale-in space-y-3">
              <Label>Bike sub-type</Label>
              <div className="grid grid-cols-4 gap-2">
                {BIKE_SUBTYPES.map((subType) => {
                  const active = subType.id === bikeSub;
                  return (
                    <button
                      type="button"
                      key={subType.id}
                      onClick={() => setBikeSub(subType.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-2xl border py-3 transition-all",
                        active ? "border-primary/40 bg-primary/10" : "border-border bg-secondary/50",
                      )}
                    >
                      <CategoryIcon name={subType.icon} color={subType.color} size={16} className="h-9 w-9" />
                      <span className="text-xs font-medium">{subType.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 rounded-2xl border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                className="resize-none rounded-2xl border-border bg-secondary"
                rows={2}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!selectedCat}
            className="h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow hover:opacity-95"
          >
            <Check className="mr-2 h-5 w-5" />
            Save expense
          </Button>
        </form>
      )}
    </div>
  );
}
