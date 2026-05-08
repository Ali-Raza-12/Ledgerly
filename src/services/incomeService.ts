import { monthKey } from "@/lib/format";
import type { Income, IncomeInput } from "@/types/income";
import { supabase } from "../lib/supabaseClient";
import { mapUserScopeError, requireUserId } from "./userScope";

interface IncomeRow {
  id: string;
  title: string;
  amount: number;
  source: Income["source"];
  date: string;
  month?: string | null;
  note?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
}

const normalizeIncome = (income: IncomeRow): Income => ({
  id: income.id,
  title: income.title,
  amount: income.amount,
  source: income.source,
  date: income.date,
  month: income.month ?? monthKey(income.date),
  note: income.note ?? undefined,
  createdAt: income.createdAt ?? income.created_at ?? income.date,
});

export const getIncomes = async () => {
  try {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    return {
      data: data?.map((income) => normalizeIncome(income as IncomeRow)) ?? null,
      error: mapUserScopeError(error),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to load incomes."),
    };
  }
};

export const addIncome = async (income: IncomeInput) => {
  try {
    const userId = await requireUserId();
    const { month, ...incomeWithoutMonth } = income;
    const payload = {
      ...incomeWithoutMonth,
      month: month ?? monthKey(income.date),
      user_id: userId,
    };

    const { data, error } = await supabase
      .from("incomes")
      .insert([payload])
      .select();

    return {
      data: data?.map((item) => normalizeIncome(item as IncomeRow)) ?? null,
      error: mapUserScopeError(error),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to save income."),
    };
  }
};

export const deleteIncome = async (id: string) => {
  try {
    const userId = await requireUserId();
    const { error } = await supabase
      .from("incomes")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    return { error: mapUserScopeError(error) };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error("Failed to delete income.") };
  }
};
