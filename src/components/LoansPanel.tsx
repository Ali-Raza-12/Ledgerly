import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  HandCoins,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LedgerEntry, PersonBalance } from "@/types/ledger";
import { deleteLedgerEntry } from "@/services/ledgerService";
import { toast } from "sonner";
import { SimpleLoanDialog } from "@/components/SimpleLoanDialog";

interface Props {
  ledger: LedgerEntry[];
  hidden?: boolean;
  onChanged: () => void;
}

function buildBalances(entries: LedgerEntry[]): PersonBalance[] {
  const map = new Map<string, PersonBalance>();
  for (const e of entries) {
    const key = e.person.trim().toLowerCase();
    const existing =
      map.get(key) ||
      ({
        person: e.person,
        net: 0,
        totalLent: 0,
        totalBorrowed: 0,
        entries: [],
      } as PersonBalance);

    let delta = 0;
    if (e.entryType === "loan") {
      delta = e.direction === "lent" ? e.amount : -e.amount;
      if (e.direction === "lent") existing.totalLent += e.amount;
      else existing.totalBorrowed += e.amount;
    } else {
      // settlement reduces the existing balance in the opposite direction
      delta = e.direction === "lent" ? -e.amount : e.amount;
    }
    existing.net += delta;
    existing.entries.push(e);
    map.set(key, existing);
  }
  return [...map.values()].sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}

export function LoansPanel({ ledger, hidden = false, onChanged }: Props) {
  const [q, setQ] = useState("");
  const [openPerson, setOpenPerson] = useState<string | null>(null);
  const [showSettled, setShowSettled] = useState(false);

  const balances = useMemo(() => buildBalances(ledger), [ledger]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? balances.filter((b) => b.person.toLowerCase().includes(s)) : balances;
  }, [balances, q]);

  const owed = filtered.filter((b) => b.net > 0);
  const owe = filtered.filter((b) => b.net < 0);
  const settled = filtered.filter((b) => b.net === 0);

  const totalOwed = owed.reduce((s, b) => s + b.net, 0);
  const totalOwe = owe.reduce((s, b) => s + Math.abs(b.net), 0);

  const handleDelete = async (id: string) => {
    const { error } = await deleteLedgerEntry(id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Entry deleted");
    onChanged();
  };

  const mask = (txt: string) => (hidden ? "•••••" : txt);

  if (balances.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-10 text-center">
        <HandCoins className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground mb-4">No loans recorded yet.</p>
        <p className="text-xs text-muted-foreground">
          Use the action buttons above to record money you gave or borrowed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </span>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Owed to me</p>
          </div>
          <p className="fin-number text-xl font-semibold mt-2 text-primary">
            {mask(formatCurrency(totalOwed))}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">{owed.length} {owed.length === 1 ? "person" : "people"}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-warning/15 flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4 text-warning" />
            </span>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">I owe</p>
          </div>
          <p className="fin-number text-xl font-semibold mt-2 text-warning">
            {mask(formatCurrency(totalOwe))}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">{owe.length} {owe.length === 1 ? "person" : "people"}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a person…"
          className="pl-10 h-11 rounded-2xl bg-secondary border-border"
        />
      </div>

      {/* People who owe me */}
      <Section
        title="People who owe me"
        accent="primary"
        count={owed.length}
        empty="Nobody owes you right now."
      >
        {owed.map((p) => (
          <PersonCard
            key={"owed-" + p.person.toLowerCase()}
            person={p}
            hidden={hidden}
            open={openPerson === "owed-" + p.person.toLowerCase()}
            onToggle={() =>
              setOpenPerson(
                openPerson === "owed-" + p.person.toLowerCase()
                  ? null
                  : "owed-" + p.person.toLowerCase()
              )
            }
            onDelete={handleDelete}
            onSaved={onChanged}
          />
        ))}
      </Section>

      {/* People I owe */}
      <Section
        title="People I owe"
        accent="warning"
        count={owe.length}
        empty="You don't owe anyone right now."
      >
        {owe.map((p) => (
          <PersonCard
            key={"owe-" + p.person.toLowerCase()}
            person={p}
            hidden={hidden}
            open={openPerson === "owe-" + p.person.toLowerCase()}
            onToggle={() =>
              setOpenPerson(
                openPerson === "owe-" + p.person.toLowerCase()
                  ? null
                  : "owe-" + p.person.toLowerCase()
              )
            }
            onDelete={handleDelete}
            onSaved={onChanged}
          />
        ))}
      </Section>

      {/* Settled (collapsed by default) */}
      {settled.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowSettled((v) => !v)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-1 mb-2"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {showSettled ? "Hide" : "Show"} settled ({settled.length})
            {showSettled ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
          {showSettled && (
            <div className="space-y-2">
              {settled.map((p) => (
                <PersonCard
                  key={"settled-" + p.person.toLowerCase()}
                  person={p}
                  hidden={hidden}
                  open={openPerson === "settled-" + p.person.toLowerCase()}
                  onToggle={() =>
                    setOpenPerson(
                      openPerson === "settled-" + p.person.toLowerCase()
                        ? null
                        : "settled-" + p.person.toLowerCase()
                    )
                  }
                  onDelete={handleDelete}
                  onSaved={onChanged}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  accent,
  count,
  empty,
  children,
}: {
  title: string;
  accent: "primary" | "warning";
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">{title}</h3>
        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-medium",
            accent === "primary" ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
          )}
        >
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="text-xs text-muted-foreground/70 px-1 py-2">{empty}</p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}

function PersonCard({
  person,
  hidden,
  open,
  onToggle,
  onDelete,
  onSaved,
}: {
  person: PersonBalance;
  hidden: boolean;
  open: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
  onSaved: () => void;
}) {
  const settled = person.net === 0;
  const owesYou = person.net > 0;
  const initial = person.person.charAt(0).toUpperCase();

  // Smart settle action: if they owe you → "got back". If you owe → "paid back".
  const settleAction = owesYou ? "got_back" : "paid_back";
  const newLoanAction = owesYou ? "gave" : settled ? "gave" : "borrowed";

  const sortedEntries = [...person.entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <div
          className={cn(
            "h-11 w-11 rounded-xl flex items-center justify-center font-semibold text-base shrink-0",
            owesYou
              ? "bg-primary/15 text-primary"
              : settled
              ? "bg-secondary text-muted-foreground"
              : "bg-warning/15 text-warning"
          )}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{person.person}</p>
          <p className="text-xs text-muted-foreground">
            {settled ? (
              <span className="inline-flex items-center gap-1 text-primary">
                <CheckCircle2 className="h-3 w-3" /> Settled
              </span>
            ) : owesYou ? (
              "Owes you"
            ) : (
              "You owe them"
            )}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p
            className={cn(
              "fin-number font-semibold",
              owesYou ? "text-primary" : settled ? "text-muted-foreground" : "text-warning"
            )}
          >
            {hidden
              ? "•••••"
              : settled
              ? formatCurrency(0)
              : `${owesYou ? "+" : "-"}${formatCurrency(Math.abs(person.net))}`}
          </p>
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground inline-block mt-1" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground inline-block mt-1" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-border p-3 space-y-3 animate-fade-in">
          {!settled && (
            <div className="grid grid-cols-2 gap-2">
              <SimpleLoanDialog
                action={settleAction}
                defaultPerson={person.person}
                onSaved={onSaved}
                trigger={
                  <Button size="sm" className="rounded-xl h-9 bg-gradient-primary text-primary-foreground shadow-glow">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Settle
                  </Button>
                }
              />
              <SimpleLoanDialog
                action={newLoanAction}
                defaultPerson={person.person}
                onSaved={onSaved}
                trigger={
                  <Button variant="outline" size="sm" className="rounded-xl h-9 border-border">
                    {owesYou ? <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> : <ArrowDownLeft className="h-3.5 w-3.5 mr-1" />}
                    {owesYou ? "Gave more" : "Borrowed more"}
                  </Button>
                }
              />
            </div>
          )}

          <div className="space-y-1">
            {sortedEntries.map((e) => {
              const isLoan = e.entryType === "loan";
              const moneyOut =
                (isLoan && e.direction === "lent") || (!isLoan && e.direction === "borrowed");
              const label = isLoan
                ? e.direction === "lent"
                  ? "You gave"
                  : "You borrowed"
                : e.direction === "lent"
                ? "They paid back"
                : "You paid back";
              return (
                <div
                  key={e.id}
                  className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/40 transition-colors"
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                      moneyOut ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"
                    )}
                  >
                    {moneyOut ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {label}
                      {!isLoan && (
                        <span className="ml-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          payback
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {new Date(e.date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {e.note ? ` • ${e.note}` : ""}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "fin-number text-sm font-semibold",
                      moneyOut ? "text-warning" : "text-primary"
                    )}
                  >
                    {hidden ? "•••" : formatCurrency(e.amount)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onDelete(e.id)}
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive transition-colors"
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
