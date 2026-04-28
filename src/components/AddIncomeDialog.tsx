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
import type { IncomeSource } from "@/types/income";
import { addIncome } from "@/services/incomeService";

interface Props {
  trigger: React.ReactNode;
  defaultMonth?: string; // yyyy-mm — used to suggest a date
  onSuccess?: (income: any) => void;
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

    const { data, error } = await addIncome({
      title: title.trim() || SOURCES.find((s) => s.id === source)!.label,
      amount: amt,
      source,
      date,
      note: note.trim() || undefined,
    });

    if (error) {
      toast.error("Failed to add income");
      console.error(error);
      return;
    }

    toast.success("Income added");
    if (data && onSuccess) {
      onSuccess(data[0]);
    }
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="glass-card border-border max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Add money</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {SOURCES.map((s) => {
              const active = s.id === source;
              const Icon = s.icon;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSource(s.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all",
                    active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[11px] font-medium">{s.label}</span>
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
              className="h-12 rounded-xl bg-secondary border-border fin-number text-lg"
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
                className="h-11 rounded-xl bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="rounded-xl bg-secondary border-border resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow"
          >
            <Check className="h-4 w-4 mr-2" /> Save income
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
