import type { MonthlyBudget } from "@/types/expense";
import { requireUserId, getBudgetStorageKey } from "./userScope";

const readBudgets = (userId: string): MonthlyBudget[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(getBudgetStorageKey(userId));
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

const writeBudgets = (userId: string, budgets: MonthlyBudget[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getBudgetStorageKey(userId), JSON.stringify(budgets));
};

export const getBudgets = async () => {
  const userId = await requireUserId();
  return readBudgets(userId);
};

export const getBudget = async (month: string) => {
  const userId = await requireUserId();
  return readBudgets(userId).find((budget) => budget.month === month)?.amount ?? null;
};

export const setBudget = async (budget: MonthlyBudget) => {
  const userId = await requireUserId();
  const budgets = readBudgets(userId).filter((item) => item.month !== budget.month);
  budgets.push(budget);
  writeBudgets(userId, budgets);
  return budget;
};
