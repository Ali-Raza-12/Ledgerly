import type { MonthlyBudget } from "@/types/expense";

const STORAGE_KEY = "monthly-budgets";

const readBudgets = (): MonthlyBudget[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is MonthlyBudget =>
        typeof item?.month === "string" && typeof item?.amount === "number",
    );
  } catch {
    return [];
  }
};

const writeBudgets = (budgets: MonthlyBudget[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
};

export const getBudgets = () => readBudgets();

export const getBudget = (month: string) =>
  readBudgets().find((budget) => budget.month === month)?.amount ?? null;

export const setBudget = (budget: MonthlyBudget) => {
  const budgets = readBudgets().filter((item) => item.month !== budget.month);
  budgets.push(budget);
  writeBudgets(budgets);
  return budget;
};
