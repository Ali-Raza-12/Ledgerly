import { monthKey } from "@/lib/format";
import type { Expense, ExpenseInput } from "@/types/expense";
import { supabase } from "../lib/supabaseClient";
import { mapUserScopeError, requireUserId } from "./userScope";

interface ExpenseRow {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: Expense["type"];
  bikeSubType?: Expense["bikeSubType"] | null;
  bike_sub_type?: Expense["bikeSubType"] | null;
  date: string;
  month?: string | null;
  note?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
}

const normalizeExpense = (expense: ExpenseRow): Expense => ({
  id: expense.id,
  title: expense.title,
  amount: expense.amount,
  category: expense.category,
  type: expense.type,
  bikeSubType: expense.bikeSubType ?? expense.bike_sub_type ?? undefined,
  date: expense.date,
  month: expense.month ?? monthKey(expense.date),
  note: expense.note ?? undefined,
  createdAt: expense.createdAt ?? expense.created_at ?? expense.date,
});

export const getExpenses = async () => {
  try {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    return {
      data: data?.map((expense) => normalizeExpense(expense as ExpenseRow)) ?? null,
      error: mapUserScopeError(error),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to load expenses."),
    };
  }
};

export const addExpense = async (expense: ExpenseInput) => {
  try {
    const userId = await requireUserId();
    const { month, ...expenseWithoutMonth } = expense as any;
    const payload = {
      ...expenseWithoutMonth,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from("expenses")
      .insert([payload])
      .select();

    return {
      data: data?.map((item) => normalizeExpense(item as ExpenseRow)) ?? null,
      error: mapUserScopeError(error),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to save expense."),
    };
  }
};

export const deleteExpense = async (id: string) => {
  try {
    const userId = await requireUserId();
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    return { error: mapUserScopeError(error) };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error("Failed to delete expense.") };
  }
};
