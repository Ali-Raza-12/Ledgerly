import type { LedgerEntry, LedgerEntryInput } from "@/types/ledger";
import { supabase } from "../lib/supabaseClient";
import { mapUserScopeError, requireUserId } from "./userScope";

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
  try {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from("ledger_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    return {
      data: data?.map((entry) => normalizeLedgerEntry(entry as LedgerEntryRow)) ?? null,
      error: mapUserScopeError(error),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to load ledger entries."),
    };
  }
};

export const addLedgerEntry = async (entry: LedgerEntryInput) => {
  try {
    const userId = await requireUserId();
    const payload = {
      person_name: entry.person,
      direction: entry.direction,
      amount: entry.amount,
      entry_type: entry.entryType,
      date: entry.date,
      note: entry.note,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from("ledger_entries")
      .insert([payload])
      .select();

    return {
      data: data?.map((item) => normalizeLedgerEntry(item as LedgerEntryRow)) ?? null,
      error: mapUserScopeError(error),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to save ledger entry."),
    };
  }
};

export const deleteLedgerEntry = async (id: string) => {
  try {
    const userId = await requireUserId();
    const { error } = await supabase
      .from("ledger_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    return { error: mapUserScopeError(error) };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error("Failed to delete ledger entry.") };
  }
};
