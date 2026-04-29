import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { formatCurrency, formatDate } from "@/lib/format";
import { AddLedgerDialog } from "@/components/AddLedgerDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Trash2,
  Wallet,
  HandCoins,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LedgerEntry, PersonBalance } from "@/types/ledger";
import { getLedger, deleteLedgerEntry } from "@/services/ledgerService";
import { Loader } from "@/components/Loader";
import { toast } from "sonner";

const buildBalances = (entries: LedgerEntry[]) => {
  const map = new Map<string, PersonBalance>();

  for (const entry of entries) {
    const key = entry.person.trim().toLowerCase();
    const existing = map.get(key) || {
      person: entry.person,
      net: 0,
      totalLent: 0,
      totalBorrowed: 0,
      entries: [],
    };

    let delta = 0;

    if (entry.entryType === "loan") {
      delta = entry.direction === "lent" ? entry.amount : -entry.amount;

      if (entry.direction === "lent") existing.totalLent += entry.amount;
      else existing.totalBorrowed += entry.amount;
    } else {
      delta = entry.direction === "lent" ? -entry.amount : entry.amount;
    }

    existing.net += delta;
    existing.entries.push(entry);
    map.set(key, existing);
  }

  return [...map.values()].sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
};

export function Lending() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [openPerson, setOpenPerson] = useState<string | null>(null);

  useEffect(() => {
    const loadLedger = async () => {
      const { data, error } = await getLedger();

      if (error) {
        console.error(error);
        toast.error("Failed to load lending data");
        setLoading(false);
        return;
      }

      setEntries(data || []);
      setLoading(false);
    };

    loadLedger();
  }, []);

  const balances = useMemo(() => buildBalances(entries), [entries]);

  const totals = useMemo(() => {
    let youAreOwed = 0;
    let youOwe = 0;
    for (const balance of balances) {
      if (balance.net > 0) youAreOwed += balance.net;
      else youOwe += Math.abs(balance.net);
    }
    return { youAreOwed, youOwe, net: youAreOwed - youOwe };
  }, [balances]);

  const filtered = useMemo(() => {
    if (!q.trim()) return balances;
    const search = q.toLowerCase();
    return balances.filter((balance) => balance.person.toLowerCase().includes(search));
  }, [balances, q]);

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm("Delete this ledger entry?")) {
      return;
    }

    try {
      const { error } = await deleteLedgerEntry(id);
      if (error) throw error;

      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      toast.success("Entry deleted");
    } catch (err) {
      console.error("Error deleting entry:", err);
      toast.error("Failed to delete entry");
    }
  };

  if (loading) {
    return <Loader label="Loading lending" sublabel="Fetching balances and history" />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Lending"
        subtitle="Money you gave or received"
        action={
          <AddLedgerDialog
            onSuccess={(entry) => setEntries((prev) => [entry, ...prev])}
            trigger={
              <Button size="sm" className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Plus className="mr-1 h-4 w-4" /> Record
              </Button>
            }
          />
        }
      />

      <section className="relative mb-5 overflow-hidden rounded-3xl glass-card p-6">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Net balance</p>
              <p
                className={cn(
                  "mt-2 fin-number text-4xl font-semibold",
                  totals.net > 0 ? "text-primary" : totals.net < 0 ? "text-warning" : "",
                )}
              >
                {totals.net >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(totals.net))}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {totals.net > 0
                  ? "You're owed this much overall"
                  : totals.net < 0
                  ? "You owe this much overall"
                  : "All settled"}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </span>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">You're owed</p>
          </div>
          <p className="mt-2 fin-number text-xl font-semibold">{formatCurrency(totals.youAreOwed)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15">
              <ArrowDownLeft className="h-4 w-4 text-warning" />
            </span>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">You owe</p>
          </div>
          <p className="mt-2 fin-number text-xl font-semibold">{formatCurrency(totals.youOwe)}</p>
        </div>
      </section>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a person..."
          className="h-12 rounded-2xl border-border bg-secondary pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center">
          <HandCoins className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="mb-4 text-muted-foreground">
            {q.trim() ? "No people match your search." : "No lending records yet."}
          </p>
          <AddLedgerDialog
            onSuccess={(entry) => setEntries((prev) => [entry, ...prev])}
            trigger={
              <Button className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Plus className="mr-1 h-4 w-4" /> Add first entry
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((person) => (
            <PersonCard
              key={person.person.toLowerCase()}
              person={person}
              open={openPerson === person.person.toLowerCase()}
              onToggle={() =>
                setOpenPerson(openPerson === person.person.toLowerCase() ? null : person.person.toLowerCase())
              }
              onDelete={handleDeleteEntry}
              onEntryAdded={(entry) => setEntries((prev) => [entry, ...prev])}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PersonCard({
  person,
  open,
  onToggle,
  onDelete,
  onEntryAdded,
}: {
  person: PersonBalance;
  open: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
  onEntryAdded: (entry: LedgerEntry) => void;
}) {
  const settled = person.net === 0;
  const owesYou = person.net > 0;
  const initial = person.person.charAt(0).toUpperCase();

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/30"
      >
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl text-base font-semibold",
            owesYou
              ? "bg-primary/15 text-primary"
              : settled
              ? "bg-secondary text-muted-foreground"
              : "bg-warning/15 text-warning",
          )}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{person.person}</p>
          <p className="text-xs text-muted-foreground">
            {settled ? (
              <span className="inline-flex items-center gap-1 text-primary">
                <CheckCircle2 className="h-3 w-3" /> Settled
              </span>
            ) : owesYou ? (
              "Owes you"
            ) : (
              "You owe"
            )}
          </p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "fin-number font-semibold",
              owesYou ? "text-primary" : settled ? "text-muted-foreground" : "text-warning",
            )}
          >
            {settled ? formatCurrency(0) : `${owesYou ? "+" : "-"}${formatCurrency(Math.abs(person.net))}`}
          </p>
          {open ? (
            <ChevronDown className="mt-1 inline-block h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="mt-1 inline-block h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="animate-fade-in space-y-3 border-t border-border p-3">
          <div className="grid grid-cols-2 gap-2">
            <AddLedgerDialog
              defaultPerson={person.person}
              defaultEntryType="loan"
              onSuccess={onEntryAdded}
              trigger={
                <Button variant="outline" size="sm" className="h-9 rounded-xl border-border">
                  <Plus className="mr-1 h-3.5 w-3.5" /> New loan
                </Button>
              }
            />
            <AddLedgerDialog
              defaultPerson={person.person}
              defaultEntryType="settlement"
              defaultDirection={person.net > 0 ? "lent" : "borrowed"}
              onSuccess={onEntryAdded}
              trigger={
                <Button variant="outline" size="sm" className="h-9 rounded-xl border-border">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Settle
                </Button>
              }
            />
          </div>

          <div className="space-y-1">
            {person.entries.map((entry) => {
              const isLoan = entry.entryType === "loan";
              const isYouGave =
                (isLoan && entry.direction === "lent") ||
                (!isLoan && entry.direction === "borrowed");
              const tone = isLoan
                ? entry.direction === "lent"
                  ? "text-primary"
                  : "text-warning"
                : "text-muted-foreground";
              const label = isLoan
                ? entry.direction === "lent"
                  ? "You gave"
                  : "You received"
                : entry.direction === "lent"
                ? "They paid back"
                : "You paid back";

              return (
                <div
                  key={entry.id}
                  className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-secondary/40"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                      isYouGave ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning",
                    )}
                  >
                    {isYouGave ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {label}
                      {!isLoan && (
                        <span className="ml-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          settlement
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDate(entry.date, { day: "numeric", month: "short", year: "numeric" })}
                      {entry.note ? ` - ${entry.note}` : ""}
                    </p>
                  </div>
                  <p className={cn("fin-number text-sm font-semibold", tone)}>{formatCurrency(entry.amount)}</p>
                  <button
                    type="button"
                    onClick={() => onDelete(entry.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-colors group-hover:opacity-100 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
