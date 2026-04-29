import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { monthKey, todayISO } from "@/lib/format";
import { toast } from "sonner";
import { Check, Briefcase, PiggyBank, Gift, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Income, IncomeInput, IncomeSource } from "@/types/income";
import { addIncome } from "@/services/incomeService";

interface Props {
  trigger: React.ReactNode;
  defaultMonth?: string;
  onSuccess?: (income: Income) => void;
}

const SOURCES: { id: IncomeSource; label: string; icon: typeof Briefcase }[] = [
  { id: "salary", label: "Salary", icon: Briefcase },
  { id: "savings", label: "Savings", icon: PiggyBank },
  { id: "bonus", label: "Bonus", icon: Gift },
  { id: "other", label: "Other", icon: Wallet },
];

export function AddIncomeDialog({ trigger, defaultMonth, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const initialDate = (() => {
    if (!defaultMonth) return todayISO();
    const today = todayISO();
    if (today.startsWith(defaultMonth)) return today;
    return `${defaultMonth}-01`;
  })();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<IncomeSource>("salary");
  const [date, setDate] = useState(initialDate);
  const [note, setNote] = useState("");

  const reset = () => {
    setTitle("");
    setAmount("");
    setSource("salary");
    setDate(initialDate);
    setNote("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    const payload: IncomeInput = {
      title: title.trim() || SOURCES.find((s) => s.id === source)!.label,
      amount: amt,
      source,
      date,
      month: monthKey(date),
      note: note.trim() || undefined,
    };

    const { data, error } = await addIncome(payload);

    if (error) {
      toast.error("Failed to add income");
      console.error(error);
      return;
    }

    if (data?.[0]) {
      onSuccess?.(data[0]);
    }

    toast.success("Income added");
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen);
      if (!nextOpen) reset();
    }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="glass-card border-border max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Add money</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {SOURCES.map((item) => {
              const active = item.id === source;
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSource(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border py-3 transition-all",
                    active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label>Amount (Rs)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="h-12 rounded-xl border-border bg-secondary text-lg fin-number"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. April Salary"
                className="h-11 rounded-xl border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl border-border bg-secondary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="resize-none rounded-xl border-border bg-secondary"
            />
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-gradient-primary font-semibold text-primary-foreground shadow-glow"
          >
            <Check className="mr-2 h-4 w-4" /> Save income
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
