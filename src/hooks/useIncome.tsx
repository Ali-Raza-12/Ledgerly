import { createContext, useCallback, useContext, useMemo, ReactNode } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { Income } from "@/types/income";
import { monthKey } from "@/lib/format";

interface IncomeContextValue {
  incomes: Income[];
  addIncome: (i: Omit<Income, "id" | "month" | "createdAt">) => void;
  deleteIncome: (id: string) => void;
}

const Ctx = createContext<IncomeContextValue | null>(null);

export function IncomeProvider({ children }: { children: ReactNode }) {
  const [incomes, setIncomes] = useLocalStorage<Income[]>("et:incomes:v1", []);

  const addIncome = useCallback(
    (i: Omit<Income, "id" | "month" | "createdAt">) => {
      const ni: Income = {
        ...i,
        id: crypto.randomUUID(),
        month: monthKey(i.date),
        createdAt: new Date().toISOString(),
      };
      setIncomes((prev) => [ni, ...prev]);
    },
    [setIncomes]
  );

  const deleteIncome = useCallback(
    (id: string) => setIncomes((prev) => prev.filter((i) => i.id !== id)),
    [setIncomes]
  );

  const value = useMemo(
    () => ({ incomes, addIncome, deleteIncome }),
    [incomes, addIncome, deleteIncome]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useIncome() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useIncome must be used within IncomeProvider");
  return ctx;
}
