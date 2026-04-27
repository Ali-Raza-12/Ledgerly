import { supabase } from "../lib/supabaseClient";

export const getIncomes = async () => {
  const { data, error } = await supabase
    .from("incomes")
    .select("*")
    .order("date", { ascending: false });

  return { data, error };
};

export const addIncome = async (income: any) => {
  const { data, error } = await supabase
    .from("incomes")
    .insert([income])
    .select();

  return { data, error };
};

export const deleteIncome = async (id: string) => {
  const { error } = await supabase
    .from("incomes")
    .delete()
    .eq("id", id);

  return { error };
};