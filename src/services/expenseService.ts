import { supabase } from "../lib/supabaseClient";

export const getExpenses = async () => {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  return { data, error };
};

export const addExpense = async (expense: any) => {
  const { data, error } = await supabase
    .from("expenses")
    .insert([expense])
    .select();

  return { data, error };
};

export const deleteExpense = async (id: string) => {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  return { error };
};