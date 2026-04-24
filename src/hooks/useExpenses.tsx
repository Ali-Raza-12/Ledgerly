import { createContext, useCallback, useContext, useMemo, ReactNode } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { Category, Expense, MonthlyBudget } from "@/types/expense";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { monthKey, todayISO } from "@/lib/format";

interface ExpensesContextValue {
  expenses: Expense[];
  categories: Category[];
  budgets: MonthlyBudget[];
  addExpense: (e: Omit<Expense, "id" | "month" | "createdAt">) => void;
  deleteExpense: (id: string) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  setBudget: (month: string, amount: number) => void;
  getBudget: (month: string) => number | null;
}

const Ctx = createContext<ExpensesContextValue | null>(null);

const SEED: Omit<Expense, "id" | "createdAt">[] = (() => {
  const today = new Date();
  const day = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    return d.toISOString().slice(0, 10);
  };
  const mk = (date: string) => monthKey(date);
  const items: Omit<Expense, "id" | "createdAt">[] = [
    { title: "Lunch at cafe", amount: 320, category: "food", type: "normal", date: day(0), month: mk(day(0)) },
    { title: "Groceries", amount: 1450, category: "food", type: "normal", date: day(1), month: mk(day(1)) },
    { title: "Petrol fill", amount: 500, category: "bike", type: "bike", bikeSubType: "petrol", date: day(2), month: mk(day(2)) },
    { title: "Electricity bill", amount: 1820, category: "bills", type: "normal", date: day(3), month: mk(day(3)) },
    { title: "Movie night", amount: 600, category: "entertainment", type: "normal", date: day(4), month: mk(day(4)) },
    { title: "T-shirt", amount: 899, category: "shopping", type: "normal", date: day(6), month: mk(day(6)) },
    { title: "Engine oil change", amount: 750, category: "bike", type: "bike", bikeSubType: "oil", date: day(8), month: mk(day(8)) },
    { title: "Uber ride", amount: 240, category: "travel", type: "normal", date: day(10), month: mk(day(10)) },
    { title: "Brake pad fix", amount: 1100, category: "bike", type: "bike", bikeSubType: "repairs", date: day(35), month: mk(day(35)) },
    { title: "Petrol fill", amount: 480, category: "bike", type: "bike", bikeSubType: "petrol", date: day(40), month: mk(day(40)) },
    { title: "Restaurant dinner", amount: 1280, category: "food", type: "normal", date: day(38), month: mk(day(38)) },
    { title: "Internet bill", amount: 999, category: "bills", type: "normal", date: day(42), month: mk(day(42)) },
  ];
  return items;
})();

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(
    "et:expenses:v1",
    SEED.map((e, i) => ({
      ...e,
      id: `seed-${i}`,
      createdAt: new Date().toISOString(),
    }))
  );
  const [categories, setCategories] = useLocalStorage<Category[]>("et:categories:v1", DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useLocalStorage<MonthlyBudget[]>("et:budgets:v1", [
    { month: monthKey(todayISO()), amount: 25000 },
  ]);

  const addExpense = useCallback(
    (e: Omit<Expense, "id" | "month" | "createdAt">) => {
      const newExp: Expense = {
        ...e,
        id: crypto.randomUUID(),
        month: monthKey(e.date),
        createdAt: new Date().toISOString(),
      };
      setExpenses((prev) => [newExp, ...prev]);
    },
    [setExpenses]
  );

  const deleteExpense = useCallback(
    (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id)),
    [setExpenses]
  );

  const addCategory = useCallback(
    (c: Omit<Category, "id">) => {
      const id = c.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36);
      setCategories((prev) => [...prev, { ...c, id }]);
    },
    [setCategories]
  );

  const setBudget = useCallback(
    (month: string, amount: number) => {
      setBudgets((prev) => {
        const exists = prev.find((b) => b.month === month);
        if (exists) return prev.map((b) => (b.month === month ? { ...b, amount } : b));
        return [...prev, { month, amount }];
      });
    },
    [setBudgets]
  );

  const getBudget = useCallback(
    (month: string) => budgets.find((b) => b.month === month)?.amount ?? null,
    [budgets]
  );

  const value = useMemo(
    () => ({ expenses, categories, budgets, addExpense, deleteExpense, addCategory, setBudget, getBudget }),
    [expenses, categories, budgets, addExpense, deleteExpense, addCategory, setBudget, getBudget]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExpenses() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useExpenses must be used within ExpensesProvider");
  return ctx;
}
