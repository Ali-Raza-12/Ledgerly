import { getExpenses } from "./expenseService";
import { getIncomes } from "./incomeService";
import { getLedger } from "./ledgerService";

export const getCashflowData = async () => {
  const [expenses, incomes, ledger] = await Promise.all([
    getExpenses(),
    getIncomes(),
    getLedger(),
  ]);

  return {
    expenses: expenses.data || [],
    incomes: incomes.data || [],
    ledger: ledger.data || [],
  };
};