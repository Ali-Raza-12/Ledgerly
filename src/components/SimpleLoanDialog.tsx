import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addLedgerEntry } from "@/services/ledgerService";
import { todayISO } from "@/lib/format";
import { toast } from "sonner";
import { Check } from "lucide-react";
import type { LedgerDirection, LedgerEntryType } from "@/types/ledger";

/**
 * Plain-language actions. No "loan vs settlement" jargon shown to the user.
 *
 *  gave         → New loan, I gave money       (direction: lent,     entryType: loan)
 *  got_back     → Settlement, they paid me     (direction: lent,     entryType: settlement)
 *  borrowed     → New loan, I borrowed         (direction: borrowed, entryType: loan)
 *  paid_back    → Settlement, I paid them      (direction: borrowed, entryType: settlement)
 */
export type LoanAction = "gave" | "got_back" | "borrowed" | "paid_back";

const ACTION_META: Record<
  LoanAction,
  {
    title: string;
    description: string;
    cta: string;
    direction: LedgerDirection;
    entryType: LedgerEntryType;
  }
> = {
  gave: {
    title: "I gave money",
    description: "Record money you lent to someone. They will owe you this amount.",
    cta: "Save loan given",
    direction: "lent",
    entryType: "loan",
  },
  got_back: {
    title: "I got money back",
    description: "Record a payback you received. Their debt to you decreases.",
    cta: "Save payback",
    direction: "lent",
    entryType: "settlement",
  },
  borrowed: {
    title: "I borrowed money",
    description: "Record money you took from someone. You will owe this amount.",
    cta: "Save loan taken",
    direction: "borrowed",
    entryType: "loan",
  },
  paid_back: {
    title: "I paid back",
    description: "Record a payback you made. Your debt to them decreases.",
    cta: "Save payback",
    direction: "borrowed",
    entryType: "settlement",
  },
};

interface Props {
  trigger: React.ReactNode;
  action: LoanAction;
  defaultPerson?: string;
  onSaved?: () => void;
}

export function SimpleLoanDialog({ trigger, action, defaultPerson = "", onSaved }: Props) {
  const meta = ACTION_META[action];

  const [open, setOpen] = useState(false);
  const [person, setPerson] = useState(defaultPerson);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setPerson(defaultPerson);
    setAmount("");
    setDate(todayISO());
    setNote("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!person.trim() || !amt || amt <= 0) {
      toast.error("Enter a name and a valid amount");
      return;
    }

    setSaving(true);
    const { error } = await addLedgerEntry({
      person: person.trim(),
      amount: amt,
      direction: meta.direction,
      entryType: meta.entryType,
      date,
      note: note.trim() || undefined,
    });
    setSaving(false);

    if (error) {
      toast.error("Failed to save");
      return;
    }

    toast.success("Saved");
    reset();
    setOpen(false);
    onSaved?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="glass-card border-border max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription className="text-xs">{meta.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="person">Person</Label>
            <Input
              id="person"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              placeholder="e.g. Ali, Sarah"
              className="h-11 rounded-xl bg-secondary border-border"
              autoFocus={!defaultPerson}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amt">Amount (Rs)</Label>
              <Input
                id="amt"
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="h-11 rounded-xl bg-secondary border-border fin-number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d">Date</Label>
              <Input
                id="d"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="n">Note (optional)</Label>
            <Textarea
              id="n"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Reason or reminder…"
              className="rounded-xl bg-secondary border-border resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow"
          >
            <Check className="h-4 w-4 mr-2" /> {meta.cta}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
