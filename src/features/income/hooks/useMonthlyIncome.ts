import { MonthlyIncomeSummary } from "../types/income.types";
import { getDebtors } from "./useDebtors";

const MONTHLY_DATA: Record<string, Omit<MonthlyIncomeSummary, "debtors" | "totalDebt">> = {
  "5/2025": {
    month: "ខែ 5/2025",
    totalIncome: 4500.0,
    orderCount: 58,
    dailyChart: [
      { label: "01-05", amount: 200 },
      { label: "05-05", amount: 320 },
      { label: "10-05", amount: 450 },
      { label: "15-05", amount: 600 },
      { label: "20-05", amount: 520 },
      { label: "25-05", amount: 680 },
      { label: "31-05", amount: 550 },
    ],
  },
};

export function useMonthlyIncome(month: string) {
  const debtors = getDebtors();
  const base = MONTHLY_DATA[month] ?? {
    month,
    totalIncome: 0,
    orderCount: 0,
    dailyChart: [],
  };

  const summary: MonthlyIncomeSummary = {
    ...base,
    debtors,
    totalDebt: debtors.reduce((sum, d) => sum + d.amount, 0),
  };

  return { summary, isLoading: false };
}