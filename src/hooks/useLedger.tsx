import { createContext, useCallback, useContext, useMemo, ReactNode } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { LedgerEntry, PersonBalance } from "@/types/ledger";

interface LedgerContextValue {
  entries: LedgerEntry[];
  addEntry: (e: Omit<LedgerEntry, "id" | "createdAt">) => void;
  deleteEntry: (id: string) => void;
  balances: PersonBalance[];
  totals: { youAreOwed: number; youOwe: number; net: number };
  getPerson: (person: string) => PersonBalance | undefined;
}

const Ctx = createContext<LedgerContextValue | null>(null);

const normalize = (name: string) => name.trim();
const keyOf = (name: string) => name.trim().toLowerCase();

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useLocalStorage<LedgerEntry[]>("et:ledger:v1", []);

  const addEntry = useCallback(
    (e: Omit<LedgerEntry, "id" | "createdAt">) => {
      const newE: LedgerEntry = {
        ...e,
        person: normalize(e.person),
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setEntries((prev) => [newE, ...prev]);
    },
    [setEntries]
  );

  const deleteEntry = useCallback(
    (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)),
    [setEntries]
  );

  const balances = useMemo<PersonBalance[]>(() => {
    const map = new Map<string, PersonBalance>();
    for (const e of entries) {
      const k = keyOf(e.person);
      const existing = map.get(k) || {
        person: e.person,
        net: 0,
        totalLent: 0,
        totalBorrowed: 0,
        entries: [] as LedgerEntry[],
      };

      // Effect on "they owe you" balance (positive = they owe you):
      // loan + lent     => +amount (they owe you more)
      // loan + borrowed => -amount (you owe them more)
      // settlement + lent     => -amount (they paid you back)
      // settlement + borrowed => +amount (you paid them back)
      let delta = 0;
      if (e.entryType === "loan") {
        delta = e.direction === "lent" ? e.amount : -e.amount;
        if (e.direction === "lent") existing.totalLent += e.amount;
        else existing.totalBorrowed += e.amount;
      } else {
        delta = e.direction === "lent" ? -e.amount : e.amount;
      }
      existing.net += delta;
      existing.entries.push(e);
      map.set(k, existing);
    }
    return [...map.values()]
      .map((p) => ({ ...p, entries: [...p.entries].sort((a, b) => b.date.localeCompare(a.date)) }))
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  }, [entries]);

  const totals = useMemo(() => {
    let youAreOwed = 0;
    let youOwe = 0;
    for (const b of balances) {
      if (b.net > 0) youAreOwed += b.net;
      else if (b.net < 0) youOwe += -b.net;
    }
    return { youAreOwed, youOwe, net: youAreOwed - youOwe };
  }, [balances]);

  const getPerson = useCallback(
    (person: string) => balances.find((b) => keyOf(b.person) === keyOf(person)),
    [balances]
  );

  const value = useMemo(
    () => ({ entries, addEntry, deleteEntry, balances, totals, getPerson }),
    [entries, addEntry, deleteEntry, balances, totals, getPerson]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLedger() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLedger must be used within LedgerProvider");
  return ctx;
}
