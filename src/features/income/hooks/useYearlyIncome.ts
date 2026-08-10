import { YearlyIncomeSummary } from "../types/income.types";
import { getDebtors } from "./useDebtors";

const YEARLY_DATA: Record<string, Omit<YearlyIncomeSummary, "debtors" | "totalDebt">> = {
  "2025": {
    year: "ឆ្នាំ 2025",
    totalIncome: 52000.0,
    orderCount: 640,
    growthPercent: 18.3,
    monthlyChart: [
      { label: "ម.ក", amount: 3200 },
      { label: "ក.ម", amount: 3600 },
      { label: "មិ.ន", amount: 4100 },
      { label: "មេ.ស", amount: 3900 },
      { label: "ឧ.ស", amount: 4500 },
      { label: "មិ.ថ", amount: 4300 },
      { label: "ក.ដ", amount: 4700 },
      { label: "សី.ហ", amount: 4600 },
      { label: "កញ.ញ", amount: 5100 },
      { label: "ត.ល", amount: 5300 },
      { label: "វិ.ច", amount: 4900 },
      { label: "ធ.ន", amount: 3800 },
    ],
  },
};

export function useYearlyIncome(year: string) {
  const debtors = getDebtors();
  const base = YEARLY_DATA[year] ?? {
    year,
    totalIncome: 0,
    orderCount: 0,
    growthPercent: 0,
    monthlyChart: [],
  };

  const summary: YearlyIncomeSummary = {
    ...base,
    debtors,
    totalDebt: debtors.reduce((sum, d) => sum + d.amount, 0),
  };

  return { summary, isLoading: false };
}