import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/useExpenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoryIcon } from "@/components/CategoryIcon";
import { BIKE_SUBTYPES } from "@/lib/categories";
import { todayISO } from "@/lib/format";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BikeSubType } from "@/types/expense";

export function AddExpense() {
  const { categories, addExpense } = useExpenses();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "food");
  const [bikeSub, setBikeSub] = useState<BikeSubType>("petrol");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");

  const selectedCat = categories.find((c) => c.id === categoryId);
  const isBike = selectedCat?.type === "bike";

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const amt = parseFloat(amount);
    if (!title.trim() || !amt || amt <= 0) {
      toast.error("Enter a title and amount");
      return;
    }
    addExpense({
      title: title.trim(),
      amount: amt,
      category: categoryId,
      type: isBike ? "bike" : "normal",
      bikeSubType: isBike ? bikeSub : undefined,
      date,
      note: note.trim() || undefined,
    });
    toast.success("Expense added");
    navigate("/");
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New expense</h1>
          <p className="text-xs text-muted-foreground">Quick add — saves to current month</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* Amount big input */}
        <div className="glass-card rounded-3xl p-6 text-center">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Amount</Label>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-3xl text-muted-foreground">₹</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="bg-transparent border-0 outline-none text-5xl font-semibold fin-number text-center w-full max-w-[260px] placeholder:text-muted-foreground/40"
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
            className="h-12 rounded-2xl bg-secondary border-border"
          />
        </div>

        <div className="space-y-3">
          <Label>Category</Label>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
            {categories.map((c) => {
              const active = c.id === categoryId;
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    "shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all",
                    active
                      ? "border-primary/40 bg-primary/10 shadow-glow"
                      : "border-border bg-secondary/50 hover:bg-secondary"
                  )}
                >
                  <CategoryIcon name={c.icon} color={c.color} size={16} className="h-7 w-7" />
                  <span className="text-sm font-medium pr-1">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isBike && (
          <div className="space-y-3 animate-scale-in">
            <Label>Bike sub-type</Label>
            <div className="grid grid-cols-4 gap-2">
              {BIKE_SUBTYPES.map((s) => {
                const active = s.id === bikeSub;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setBikeSub(s.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all",
                      active ? "border-primary/40 bg-primary/10" : "border-border bg-secondary/50"
                    )}
                  >
                    <CategoryIcon name={s.icon} color={s.color} size={16} className="h-9 w-9" />
                    <span className="text-xs font-medium">{s.name}</span>
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
              className="h-12 rounded-2xl bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note…"
              className="rounded-2xl bg-secondary border-border resize-none"
              rows={2}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold text-base shadow-glow hover:opacity-95"
        >
          <Check className="h-5 w-5 mr-2" />
          Save expense
        </Button>
      </form>
    </div>
  );
}
