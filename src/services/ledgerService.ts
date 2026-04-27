import { supabase } from "../lib/supabaseClient";

export const getLedger = async () => {
  const { data, error } = await supabase
    .from("ledger_entries")
    .select("*")
    .order("date", { ascending: false });

  return { data, error };
};

export const addLedgerEntry = async (entry: any) => {
  const { data, error } = await supabase
    .from("ledger_entries")
    .insert([entry])
    .select();

  return { data, error };
};

export const deleteLedgerEntry = async (id: string) => {
  const { error } = await supabase
    .from("ledger_entries")
    .delete()
    .eq("id", id);

  return { error };
};