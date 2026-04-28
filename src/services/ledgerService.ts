import { supabase } from "../lib/supabaseClient";

export const getLedger = async () => {
  const { data, error } = await supabase
    .from("ledger_entries")
    .select("*")
    .order("date", { ascending: false });

  if (data) {
    // Map database columns to application format
    return {
      data: data.map((entry: any) => ({
        ...entry,
        person: entry.person_name,
        entryType: entry.entry_type,
      })),
      error,
    };
  }

  return { data, error };
};

export const addLedgerEntry = async (entry: any) => {
  const payload = {
    person_name: entry.person,
    direction: entry.direction,
    amount: entry.amount,
    entry_type: entry.entryType,
    date: entry.date,
    note: entry.note,
  };

  const { data, error } = await supabase
    .from("ledger_entries")
    .insert([payload])
    .select();

  if (data) {
    // Map database columns back to application format
    return {
      data: data.map((entry: any) => ({
        ...entry,
        person: entry.person_name,
        entryType: entry.entry_type,
      })),
      error,
    };
  }

  return { data, error };
};

export const deleteLedgerEntry = async (id: string) => {
  const { error } = await supabase
    .from("ledger_entries")
    .delete()
    .eq("id", id);

  return { error };
};