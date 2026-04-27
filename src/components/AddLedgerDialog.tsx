import { useState } from "react";
import {
  Dialog,
  DialogContent,
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
import { ArrowDownLeft, ArrowUpRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LedgerDirection, LedgerEntryType } from "@/types/ledger";

interface Props {
  trigger: React.ReactNode;
  defaultPerson?: string;
  defaultEntryType?: LedgerEntryType;
  defaultDirection?: LedgerDirection;
}

export function AddLedgerDialog({
  trigger,
  defaultPerson = "",
  defaultEntryType = "loan",
  defaultDirection = "lent",
}: Props) {
  const addEntry = async (
    entry: Omit<Parameters<typeof addLedgerEntry>[0], "id">,
  ) => {
    const { error } = await addLedgerEntry(entry);
    if (error) {
      toast.error("Failed to save entry");
      console.error(error);
      return false;
    }

    toast.success(
      entry.entryType === "loan" ? "Recorded" : "Settlement saved",
    );
    return true;
  };

  const [open, setOpen] = useState(false);
  const [person, setPerson] = useState(defaultPerson);
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<LedgerDirection>(defaultDirection);
  const [entryType, setEntryType] = useState<LedgerEntryType>(defaultEntryType);
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");

  const reset = () => {
    setPerson(defaultPerson);
    setAmount("");
    setDirection(defaultDirection);
    setEntryType(defaultEntryType);
    setDate(todayISO());
    setNote("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!person.trim() || !amt || amt <= 0) {
      toast.error("Enter a name and amount");
      return;
    }

    const saved = await addEntry({
      person: person.trim(),
      amount: amt,
      direction,
      entryType,
      date,
      note: note.trim() || undefined,
    });

    if (!saved) return;

    reset();
    setOpen(false);
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
          <DialogTitle>Record entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {/* Entry type tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl">
            <TabButton
              active={entryType === "loan"}
              onClick={() => setEntryType("loan")}
            >
              New loan
            </TabButton>
            <TabButton
              active={entryType === "settlement"}
              onClick={() => setEntryType("settlement")}
            >
              Settlement
            </TabButton>
          </div>

          {/* Direction */}
          <div className="grid grid-cols-2 gap-2">
            <DirBtn
              active={direction === "lent"}
              onClick={() => setDirection("lent")}
              icon={<ArrowUpRight className="h-4 w-4" />}
              label={entryType === "loan" ? "I gave" : "They paid me"}
              tone="primary"
            />
            <DirBtn
              active={direction === "borrowed"}
              onClick={() => setDirection("borrowed")}
              icon={<ArrowDownLeft className="h-4 w-4" />}
              label={entryType === "loan" ? "I received" : "I paid them"}
              tone="warning"
            />
          </div>

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
            className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow"
          >
            <Check className="h-4 w-4 mr-2" /> Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function DirBtn({
  active,
  onClick,
  icon,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tone: "primary" | "warning";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-3 rounded-xl border transition-all text-sm font-medium",
        active
          ? tone === "primary"
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-warning/40 bg-warning/10 text-warning"
          : "border-border bg-secondary/50 text-muted-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
