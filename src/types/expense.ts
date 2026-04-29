export type ExpenseType = "normal" | "bike";

export type BikeSubType = "petrol" | "oil" | "maintenance" | "repairs";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: ExpenseType;
  bikeSubType?: BikeSubType;
  date: string; // ISO yyyy-mm-dd
  month: string; // yyyy-mm
  note?: string;
  createdAt: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  category: string;
  type: ExpenseType;
  bikeSubType?: BikeSubType;
  date: string;
  month?: string;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide name
  color: string; // tailwind color token like "primary" | "accent" etc, or hex
  type: ExpenseType;
}

export interface MonthlyBudget {
  month: string; // yyyy-mm
  amount: number;
}
