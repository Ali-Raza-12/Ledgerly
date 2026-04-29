export type LedgerDirection = "lent" | "borrowed"; // lent = you gave; borrowed = you received

export type LedgerEntryType = "loan" | "settlement";

export interface LedgerEntry {
  id: string;
  person: string; // person name (case-insensitive grouping)
  direction: LedgerDirection;
  amount: number;
  date: string; // yyyy-mm-dd
  note?: string;
  entryType: LedgerEntryType; // loan = new debt; settlement = paid back
  createdAt: string;
}

export interface LedgerEntryInput {
  person: string;
  direction: LedgerDirection;
  amount: number;
  date: string;
  note?: string;
  entryType: LedgerEntryType;
}

export interface PersonBalance {
  person: string;
  net: number; // positive => they owe you; negative => you owe them
  totalLent: number;
  totalBorrowed: number;
  entries: LedgerEntry[];
}
