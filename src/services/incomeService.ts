import { monthKey } from "@/lib/format";
import type { Income, IncomeInput } from "@/types/income";
import { supabase } from "../lib/supabaseClient";

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
  const { data, error } = await supabase
    .from("incomes")
    .select("*")
    .order("date", { ascending: false });

  return { data: data?.map((income) => normalizeIncome(income as IncomeRow)) ?? null, error };
};

export const addIncome = async (income: IncomeInput) => {
  const payload = {
    ...income,
    month: income.month ?? monthKey(income.date),
  };

  const { data, error } = await supabase
    .from("incomes")
    .insert([payload])
    .select();

  return { data: data?.map((item) => normalizeIncome(item as IncomeRow)) ?? null, error };
};

export const deleteIncome = async (id: string) => {
  const { error } = await supabase
    .from("incomes")
    .delete()
    .eq("id", id);

  return { error };
};
