import { IncomeOverview } from "../types/income.types";
import { getDebtors } from "./useDebtors";

export function useIncomeSummary(): { overview: IncomeOverview; isLoading: false } {
  const debtors = getDebtors();

  const overview: IncomeOverview = {
    todayIncome: 250.0,
    todayDate: "25/05/2025",
    monthIncome: 4500.0,
    monthLabel: "ខែ 5/2025",
    monthGrowthPercent: 12.5,
    yearIncome: 52000.0,
    yearLabel: "ឆ្នាំ 2025",
    yearGrowthPercent: 18.3,
    totalDebt: debtors.reduce((sum, d) => sum + d.amount, 0),
    debtorCount: debtors.length,
    weeklyChart: [
      { label: "19/05", amount: 120 },
      { label: "20/05", amount: 180 },
      { label: "21/05", amount: 160 },
      { label: "22/05", amount: 210 },
      { label: "23/05", amount: 240 },
      { label: "24/05", amount: 230 },
      { label: "25/05", amount: 250 },
    ],
    topDebtors: debtors.slice(0, 3),
  };

  return { overview, isLoading: false };
}