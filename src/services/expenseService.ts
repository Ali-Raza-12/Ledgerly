import { monthKey } from "@/lib/format";
import type { Expense, ExpenseInput } from "@/types/expense";
import { supabase } from "../lib/supabaseClient";

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
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  return { data: data?.map((expense) => normalizeExpense(expense as ExpenseRow)) ?? null, error };
};

export const addExpense = async (expense: ExpenseInput) => {
  const payload = {
    ...expense,
    month: expense.month ?? monthKey(expense.date),
  };

  const { data, error } = await supabase
    .from("expenses")
    .insert([payload])
    .select();

  return { data: data?.map((item) => normalizeExpense(item as ExpenseRow)) ?? null, error };
};

export const deleteExpense = async (id: string) => {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  return { error };
};
