import type { LedgerEntry, LedgerEntryInput } from "@/types/ledger";
import { supabase } from "../lib/supabaseClient";

interface LedgerEntryRow {
  id: string;
  person?: string;
  person_name?: string;
  direction: LedgerEntry["direction"];
  amount: number;
  entryType?: LedgerEntry["entryType"];
  entry_type?: LedgerEntry["entryType"];
  date: string;
  note?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
}

const normalizeLedgerEntry = (entry: LedgerEntryRow): LedgerEntry => ({
  id: entry.id,
  person: entry.person ?? entry.person_name ?? "",
  direction: entry.direction,
  amount: entry.amount,
  date: entry.date,
  note: entry.note ?? undefined,
  entryType: entry.entryType ?? entry.entry_type ?? "loan",
  createdAt: entry.createdAt ?? entry.created_at ?? entry.date,
});

export const getLedger = async () => {
  const { data, error } = await supabase
    .from("ledger_entries")
    .select("*")
    .order("date", { ascending: false });

  return { data: data?.map((entry) => normalizeLedgerEntry(entry as LedgerEntryRow)) ?? null, error };
};

export const addLedgerEntry = async (entry: LedgerEntryInput) => {
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

  return { data: data?.map((item) => normalizeLedgerEntry(item as LedgerEntryRow)) ?? null, error };
};

export const deleteLedgerEntry = async (id: string) => {
  const { error } = await supabase
    .from("ledger_entries")
    .delete()
    .eq("id", id);

  return { error };
};
