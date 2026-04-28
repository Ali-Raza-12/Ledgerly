import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { formatCurrency, monthKey, monthLabel, todayISO } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AddIncomeDialog } from "@/components/AddIncomeDialog";
import { SimpleLoanDialog, type LoanAction } from "@/components/SimpleLoanDialog";
import { LoansPanel } from "@/components/LoansPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Trash2,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Briefcase,
  HandCoins,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCashflowData } from "@/services/cashFlowService";
import { deleteExpense } from "@/services/expenseService";
import { deleteIncome } from "@/services/incomeService";
import { deleteLedgerEntry } from "@/services/ledgerService";
import type { Expense } from "@/types/expense";
import type { Income } from "@/types/income";
import type { LedgerEntry } from "@/types/ledger";
import { Loader } from "@/components/Loader";
import { toast } from "sonner";

interface UnifiedTxn {
  id: string;
  kind: "income" | "expense" | "given" | "received";
  title: string;
  subtitle?: string;
  amount: number;
  signed: number;
  date: string;
  month: string;
  category?: string;
  meta?: string;
}

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const isSame = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSame(d, today)) return "Today";
  if (isSame(d, yest)) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
};

export function Balance() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const current = monthKey(todayISO());
  const [month, setMonth] = useState<string>(current);
  const [hidden, setHidden] = useState(true);
  const [tab, setTab] = useState<"all" | "loans">("all");

  const fetchData = async () => {
    const { expenses: exp, incomes: inc, ledger } = await getCashflowData();
    setExpenses(exp);
    setIncomes(inc);
    setLedgerEntries(ledger);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Build unified transactions list
  const txns = useMemo(() => {
    const out: UnifiedTxn[] = [];

    for (const i of incomes) {
      out.push({
        id: `inc-${i.id}`,
        kind: "income",
        title: i.title,
        subtitle: i.source,
        amount: i.amount,
        signed: i.amount,
        date: i.date,
        month: monthKey(i.date),
        category: i.source,
      });
    }

    for (const e of expenses) {
      out.push({
        id: `exp-${e.id}`,
        kind: "expense",
        title: e.title,
        subtitle: e.category,
        amount: e.amount,
        signed: -e.amount,
        date: e.date,
        month: monthKey(e.date),
        category: e.category,
      });
    }

    for (const l of ledgerEntries) {
      const moneyOut =
        (l.entryType === "loan" && l.direction === "lent") ||
        (l.entryType === "settlement" && l.direction === "borrowed");
      out.push({
        id: `lg-${l.id}`,
        kind: moneyOut ? "given" : "received",
        title:
          l.entryType === "loan"
            ? moneyOut
              ? `Gave to ${l.person}`
              : `Borrowed from ${l.person}`
            : moneyOut
            ? `Paid back ${l.person}`
            : `${l.person} paid back`,
        subtitle: l.note,
        amount: l.amount,
        signed: moneyOut ? -l.amount : l.amount,
        date: l.date,
        month: monthKey(l.date),
        category: l.person,
        meta: l.entryType,
      });
    }

    return out.sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, incomes, ledgerEntries]);

  const months = useMemo(() => {
    const set = new Set<string>(txns.map((t) => t.month).filter(Boolean));
    return [...set].sort().reverse();
  }, [txns]);

  const monthOptions = useMemo(() => {
    const set = new Set<string>([current, ...months]);
    return [...set].sort().reverse();
  }, [months, current]);

  const monthTxns = useMemo(() => txns.filter((t) => t.month === month), [txns, month]);

  const grouped = useMemo(() => {
    const map = new Map<string, UnifiedTxn[]>();
    for (const t of monthTxns) {
      const arr = map.get(t.date) || [];
      arr.push(t);
      map.set(t.date, arr);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [monthTxns]);

  const totals = useMemo(() => {
    const income = monthTxns.filter((t) => t.kind === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTxns.filter((t) => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
    const given = monthTxns.filter((t) => t.kind === "given").reduce((s, t) => s + t.amount, 0);
    const received = monthTxns.filter((t) => t.kind === "received").reduce((s, t) => s + t.amount, 0);
    return { income, expense, given, received, balance: income - expense + received - given };
  }, [monthTxns]);

  const mask = (txt: string) => (hidden ? "•••••" : txt);
  const balance = totals.balance;
  const balancePositive = balance >= 0;

  const onDeleteTxn = async (t: UnifiedTxn) => {
    const rawId = t.id.replace(/^(inc|exp|lg)-/, "");
    try {
      if (t.id.startsWith("inc-")) {
        await deleteIncome(rawId);
        setIncomes((prev) => prev.filter((i) => i.id !== rawId));
      } else if (t.id.startsWith("exp-")) {
        await deleteExpense(rawId);
        setExpenses((prev) => prev.filter((e) => e.id !== rawId));
      } else if (t.id.startsWith("lg-")) {
        await deleteLedgerEntry(rawId);
        setLedgerEntries((prev) => prev.filter((l) => l.id !== rawId));
      }
      toast.success("Deleted");
    } catch (err) {
      console.error("Error deleting transaction:", err);
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return <Loader label="Loading balance" sublabel="Crunching your monthly cashflow" />;
  }

  return (
    <div className="animate-fade-in pb-12">
      <PageHeader
        title="Balance"
        subtitle="Your money, all in one place"
        action={
          <button
            onClick={() => setHidden((v) => !v)}
            className="h-9 w-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-secondary/70 transition-colors"
            aria-label={hidden ? "Show amounts" : "Hide amounts"}
          >
            {hidden ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-primary" />
            )}
          </button>
        }
      />

      {/* Month selector */}
      <div className="mb-4">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="h-11 rounded-xl bg-secondary border-border w-full sm:w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((m) => (
              <SelectItem key={m} value={m}>
                {monthLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hero balance */}
      <section className="relative overflow-hidden glass-card rounded-3xl p-6 mb-5">
        <div
          className={cn(
            "absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl pointer-events-none",
            balancePositive ? "bg-primary/20" : "bg-destructive/20"
          )}
        />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Net balance
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{monthLabel(month)}</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <h2
              className={cn(
                "fin-number text-4xl lg:text-5xl font-semibold",
                !balancePositive && "text-destructive"
              )}
            >
              {hidden
                ? "•••••"
                : `${balance < 0 ? "-" : ""}${formatCurrency(Math.abs(balance))}`}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-5">
            <MiniStat
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="Income"
              value={mask(formatCurrency(totals.income))}
              tone="primary"
            />
            <MiniStat
              icon={<TrendingDown className="h-3.5 w-3.5" />}
              label="Spent"
              value={mask(formatCurrency(totals.expense))}
              tone="destructive"
            />
            <MiniStat
              icon={<ArrowUpRight className="h-3.5 w-3.5" />}
              label="Loans given"
              value={mask(formatCurrency(totals.given))}
              tone="warning"
            />
            <MiniStat
              icon={<ArrowDownLeft className="h-3.5 w-3.5" />}
              label="Loans received"
              value={mask(formatCurrency(totals.received))}
              tone="primary"
            />
          </div>
        </div>
      </section>

      {/* Quick actions — plain language, 4 clear buttons */}
      <section className="mb-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 px-1">
          Quick add
        </p>
        <div className="grid grid-cols-2 gap-2">
          <AddIncomeDialog
            defaultMonth={month}
            onSuccess={(i) => setIncomes((prev) => [i, ...prev])}
            trigger={
              <ActionButton
                icon={<TrendingUp className="h-4 w-4" />}
                label="Add income"
                tone="primary"
              />
            }
          />
          <Link to="/add" className="contents">
            <ActionButton
              icon={<Receipt className="h-4 w-4" />}
              label="Add expense"
              tone="destructive"
            />
          </Link>
          <LoanQuickAction
            action="gave"
            label="I gave money"
            hint="Lent to someone"
            icon={<ArrowUpRight className="h-4 w-4" />}
            tone="warning"
            onSaved={fetchData}
          />
          <LoanQuickAction
            action="got_back"
            label="I got money back"
            hint="They paid you"
            icon={<ArrowDownLeft className="h-4 w-4" />}
            tone="primary"
            onSaved={fetchData}
          />
          <LoanQuickAction
            action="borrowed"
            label="I borrowed"
            hint="Took from someone"
            icon={<HandCoins className="h-4 w-4" />}
            tone="primary"
            onSaved={fetchData}
          />
          <LoanQuickAction
            action="paid_back"
            label="I paid back"
            hint="Returned money"
            icon={<ArrowUpRight className="h-4 w-4" />}
            tone="warning"
            onSaved={fetchData}
          />
        </div>
      </section>

      {/* Sub-tabs: All Transactions / Loans */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "loans")}>
        <TabsList className="grid grid-cols-2 w-full bg-secondary border border-border rounded-2xl p-1 h-12">
          <TabsTrigger
            value="all"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm h-full"
          >
            <Receipt className="h-4 w-4 mr-2" /> All transactions
          </TabsTrigger>
          <TabsTrigger
            value="loans"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm h-full"
          >
            <HandCoins className="h-4 w-4 mr-2" /> Loans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-semibold">Transactions</h3>
            <span className="text-xs text-muted-foreground">{monthTxns.length} total</span>
          </div>

          {grouped.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center">
              <Wallet className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground mb-4">
                Nothing recorded for {monthLabel(month)} yet.
              </p>
              <div className="flex justify-center gap-2">
                <AddIncomeDialog
                  defaultMonth={month}
                  onSuccess={(i) => setIncomes((prev) => [i, ...prev])}
                  trigger={
                    <Button
                      size="sm"
                      className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add income
                    </Button>
                  }
                />
                <Button asChild variant="outline" size="sm" className="rounded-xl border-border">
                  <Link to="/add">Add expense</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {grouped.map(([date, items]) => {
                const dayNet = items.reduce((s, t) => s + t.signed, 0);
                return (
                  <div key={date}>
                    <div className="flex items-center justify-between px-2 mb-2">
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground">
                        {dayLabel(date)}
                      </h4>
                      <span
                        className={cn(
                          "text-xs fin-number",
                          dayNet > 0
                            ? "text-primary"
                            : dayNet < 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                      >
                        {hidden
                          ? "•••"
                          : `${dayNet > 0 ? "+" : dayNet < 0 ? "-" : ""}${formatCurrency(
                              Math.abs(dayNet)
                            )}`}
                      </span>
                    </div>
                    <div className="glass-card rounded-3xl p-2 space-y-1">
                      {items.map((t) => (
                        <TxnRow
                          key={t.id}
                          txn={t}
                          hidden={hidden}
                          onDelete={() => onDeleteTxn(t)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="loans" className="mt-5">
          <LoansPanel ledger={ledgerEntries} hidden={hidden} onChanged={fetchData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "primary" | "destructive" | "warning";
}) {
  const toneCls =
    tone === "primary"
      ? "bg-primary/15 text-primary"
      : tone === "destructive"
      ? "bg-destructive/15 text-destructive"
      : "bg-warning/15 text-warning";
  return (
    <button
      type="button"
      className="glass-card rounded-2xl p-3 flex items-center gap-3 hover:bg-secondary/30 transition-colors text-left w-full"
    >
      <span className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", toneCls)}>
        {icon}
      </span>
      <span className="text-sm font-medium truncate">{label}</span>
    </button>
  );
}

function LoanQuickAction({
  action,
  label,
  hint,
  icon,
  tone,
  onSaved,
}: {
  action: LoanAction;
  label: string;
  hint: string;
  icon: React.ReactNode;
  tone: "primary" | "warning";
  onSaved: () => void;
}) {
  const toneCls =
    tone === "primary" ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning";
  return (
    <SimpleLoanDialog
      action={action}
      onSaved={onSaved}
      trigger={
        <button
          type="button"
          className="glass-card rounded-2xl p-3 flex items-center gap-3 hover:bg-secondary/30 transition-colors text-left w-full"
        >
          <span
            className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
              toneCls
            )}
          >
            {icon}
          </span>
          <span className="min-w-0">
            <span className="text-sm font-medium block truncate">{label}</span>
            <span className="text-[10px] text-muted-foreground block truncate">{hint}</span>
          </span>
        </button>
      }
    />
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "destructive" | "warning";
}) {
  const toneCls =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : "bg-warning/10 text-warning";
  return (
    <div className="rounded-xl bg-secondary/40 border border-border p-2.5">
      <div className="flex items-center gap-2">
        <span className={cn("h-6 w-6 rounded-md flex items-center justify-center", toneCls)}>
          {icon}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="fin-number text-sm font-semibold mt-1.5 truncate">{value}</p>
    </div>
  );
}

function TxnRow({
  txn,
  hidden,
  onDelete,
}: {
  txn: UnifiedTxn;
  hidden: boolean;
  onDelete: () => void;
}) {
  const positive = txn.signed > 0;
  const config = (() => {
    switch (txn.kind) {
      case "income":
        return { icon: <Briefcase className="h-4 w-4" />, tone: "bg-primary/15 text-primary" };
      case "expense":
        return {
          icon: <ShoppingBag className="h-4 w-4" />,
          tone: "bg-destructive/15 text-destructive",
        };
      case "given":
        return { icon: <ArrowUpRight className="h-4 w-4" />, tone: "bg-warning/15 text-warning" };
      case "received":
        return {
          icon: <ArrowDownLeft className="h-4 w-4" />,
          tone: "bg-primary/15 text-primary",
        };
    }
  })();

  return (
    <div className="group flex items-center gap-3 p-2.5 rounded-2xl hover:bg-secondary/40 transition-colors">
      <span
        className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", config.tone)}
      >
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{txn.title}</p>
        {txn.subtitle && (
          <p className="text-xs text-muted-foreground truncate capitalize">{txn.subtitle}</p>
        )}
      </div>
      <p
        className={cn(
          "fin-number font-semibold text-sm",
          positive ? "text-primary" : "text-destructive"
        )}
      >
        {hidden ? "•••" : `${positive ? "+" : "-"}${formatCurrency(txn.amount)}`}
      </p>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive transition-colors"
        aria-label="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
