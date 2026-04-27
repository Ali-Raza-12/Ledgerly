export type IncomeSource = "salary" | "savings" | "bonus" | "other";

export interface Income {
  id: string;
  title: string;
  amount: number;
  source: IncomeSource;
  date: string; // yyyy-mm-dd
  month: string; // yyyy-mm
  note?: string;
  createdAt: string;
}
