import { useEffect, useMemo, useState } from "react";
import { monthKey } from "@/lib/format";
import { getCashflowData } from "@/services/cashFlowService";
import type { Expense } from "@/types/expense";
import type { Income } from "@/types/income";
import type { LedgerEntry } from "@/types/ledger";

export type TxnKind = "income" | "expense" | "given" | "received";

export interface UnifiedTxn {
  id: string;
  kind: TxnKind;
  title: string;
  subtitle?: string;
  amount: number; // always positive
  signed: number; // +/- effect on balance
  date: string;
  month: string;
  category?: string; // e.g. expense category id, or income source, or person name
  meta?: string; // small tag
}

export function useCashflow() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

  useEffect(() => {
    let active = true;

    const loadCashflow = async () => {
      const data = await getCashflowData();
      if (!active) return;

      setExpenses(data.expenses);
      setIncomes(data.incomes);
      setLedger(data.ledger);
    };

    loadCashflow();

    return () => {
      active = false;
    };
  }, []);

  const txns: UnifiedTxn[] = useMemo(() => {
    const out: UnifiedTxn[] = [];

    for (const i of incomes) {
      out.push({
        id: `inc-${i.id}`,
        kind: "income",
        title: i.title || "Income",
        subtitle: i.source,
        amount: i.amount,
        signed: i.amount,
        date: i.date,
        month: i.month,
        category: i.source,
        meta: i.source,
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
        month: e.month,
        category: e.category,
        meta: e.type === "bike" ? "bike" : undefined,
      });
    }

    for (const l of ledger) {
      // Only loans affect cashflow (settlements are reversed money movement too)
      // Treat any ledger entry as cash movement: lent => money out, borrowed/received => money in
      const isOut =
        (l.entryType === "loan" && l.direction === "lent") ||
        (l.entryType === "settlement" && l.direction === "borrowed");
      const kind: TxnKind = isOut ? "given" : "received";
      out.push({
        id: `lg-${l.id}`,
        kind,
        month: monthKey(l.date),
        title:
          l.entryType === "loan"
            ? isOut
              ? `Gave to ${l.person}`
              : `Got from ${l.person}`
            : isOut
            ? `Paid back ${l.person}`
            : `${l.person} paid back`,
        subtitle: l.note,
        amount: l.amount,
        signed: isOut ? -l.amount : l.amount,
        date: l.date,
        category: l.person,
        meta: l.entryType,
      });
    }

    return out.sort((a, b) =>
      b.date === a.date ? 0 : b.date.localeCompare(a.date)
    );
  }, [expenses, ledger, incomes]);

  const balanceForMonth = (m: string) => {
    return txns
      .filter((t) => t.month === m)
      .reduce((s, t) => s + t.signed, 0);
  };

  const totalsForMonth = (m: string) => {
    let income = 0;
    let expense = 0;
    let given = 0;
    let received = 0;
    for (const t of txns) {
      if (t.month !== m) continue;
      if (t.kind === "income") income += t.amount;
      else if (t.kind === "expense") expense += t.amount;
      else if (t.kind === "given") given += t.amount;
      else if (t.kind === "received") received += t.amount;
    }
    return { income, expense, given, received, balance: income - expense - given + received };
  };

  const months = useMemo(() => {
    const set = new Set<string>(txns.map((t) => t.month));
    return [...set].sort().reverse();
  }, [txns]);

  return { txns, balanceForMonth, totalsForMonth, months };
}
