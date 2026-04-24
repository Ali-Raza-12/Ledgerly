import { useMemo, useState } from "react";
import { useLedger } from "@/hooks/useLedger";
import { PageHeader } from "@/components/PageHeader";
import { formatCurrency } from "@/lib/format";
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
import type { PersonBalance } from "@/types/ledger";

export function Lending() {
  const { balances, totals, deleteEntry } = useLedger();
  const [q, setQ] = useState("");
  const [openPerson, setOpenPerson] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!q.trim()) return balances;
    const s = q.toLowerCase();
    return balances.filter((b) => b.person.toLowerCase().includes(s));
  }, [balances, q]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Lending"
        subtitle="Money you gave or received"
        action={
          <AddLedgerDialog
            trigger={
              <Button size="sm" className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Plus className="h-4 w-4 mr-1" /> Record
              </Button>
            }
          />
        }
      />

      {/* Net summary hero */}
      <section className="relative overflow-hidden glass-card rounded-3xl p-6 mb-5">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Net balance</p>
              <p
                className={cn(
                  "fin-number text-4xl font-semibold mt-2",
                  totals.net > 0 ? "text-primary" : totals.net < 0 ? "text-warning" : ""
                )}
              >
                {totals.net >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(totals.net))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totals.net > 0
                  ? "You're owed this much overall"
                  : totals.net < 0
                  ? "You owe this much overall"
                  : "All settled"}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 mb-5">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </span>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">You're owed</p>
          </div>
          <p className="fin-number text-xl font-semibold mt-2">{formatCurrency(totals.youAreOwed)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-warning/15 flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4 text-warning" />
            </span>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">You owe</p>
          </div>
          <p className="fin-number text-xl font-semibold mt-2">{formatCurrency(totals.youOwe)}</p>
        </div>
      </section>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a person…"
          className="pl-10 h-12 rounded-2xl bg-secondary border-border"
        />
      </div>

      {/* People list */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center">
          <HandCoins className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-4">No lending records yet.</p>
          <AddLedgerDialog
            trigger={
              <Button className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Plus className="h-4 w-4 mr-1" /> Add first entry
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <PersonCard
              key={p.person.toLowerCase()}
              person={p}
              open={openPerson === p.person.toLowerCase()}
              onToggle={() =>
                setOpenPerson(openPerson === p.person.toLowerCase() ? null : p.person.toLowerCase())
              }
              onDelete={deleteEntry}
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
}: {
  person: PersonBalance;
  open: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
}) {
  const settled = person.net === 0;
  const owesYou = person.net > 0;
  const initial = person.person.charAt(0).toUpperCase();

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <div
          className={cn(
            "h-11 w-11 rounded-xl flex items-center justify-center font-semibold text-base",
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
              "You owe"
            )}
          </p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "fin-number font-semibold",
              owesYou ? "text-primary" : settled ? "text-muted-foreground" : "text-warning"
            )}
          >
            {settled ? formatCurrency(0) : `${owesYou ? "+" : "-"}${formatCurrency(Math.abs(person.net))}`}
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
          <div className="grid grid-cols-2 gap-2">
            <AddLedgerDialog
              defaultPerson={person.person}
              defaultEntryType="loan"
              trigger={
                <Button variant="outline" size="sm" className="rounded-xl h-9 border-border">
                  <Plus className="h-3.5 w-3.5 mr-1" /> New loan
                </Button>
              }
            />
            <AddLedgerDialog
              defaultPerson={person.person}
              defaultEntryType="settlement"
              defaultDirection={person.net > 0 ? "lent" : "borrowed"}
              trigger={
                <Button variant="outline" size="sm" className="rounded-xl h-9 border-border">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Settle
                </Button>
              }
            />
          </div>

          <div className="space-y-1">
            {person.entries.map((e) => {
              const isLoan = e.entryType === "loan";
              const isYouGave = (isLoan && e.direction === "lent") || (!isLoan && e.direction === "borrowed");
              const tone = isLoan
                ? e.direction === "lent"
                  ? "text-primary"
                  : "text-warning"
                : "text-muted-foreground";
              const label = isLoan
                ? e.direction === "lent"
                  ? "You gave"
                  : "You received"
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
                      isYouGave ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
                    )}
                  >
                    {isYouGave ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {label}
                      {!isLoan && <span className="ml-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">settlement</span>}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {new Date(e.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      {e.note ? ` • ${e.note}` : ""}
                    </p>
                  </div>
                  <p className={cn("fin-number text-sm font-semibold", tone)}>{formatCurrency(e.amount)}</p>
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
