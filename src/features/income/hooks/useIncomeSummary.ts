import { useEffect, useState } from "react";
import { api } from "@/services";
import type { IncomeOverview } from "../types/income.types";
import { useDebtors } from "./useDebtors";

export function useIncomeSummary(): { overview: IncomeOverview; isLoading: boolean } {
  const { allDebtors, totalDebt, debtorCount } = useDebtors();
  const [overview, setOverview] = useState<IncomeOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.reports
      .revenue("thisMonth")
      .then((res) => {
        setOverview({
          todayIncome: 0,
          todayDate: new Date().toLocaleDateString(),
          monthIncome: res.totalRevenue,
          monthLabel: `ខែ ${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
          monthGrowthPercent: 0,
          yearIncome: res.totalRevenue,
          yearLabel: `ឆ្នាំ ${new Date().getFullYear()}`,
          yearGrowthPercent: 0,
          totalDebt,
          debtorCount,
          weeklyChart: [],
          topDebtors: allDebtors.slice(0, 3),
        });
      })
      .catch(() => {
        setOverview({
          todayIncome: 0,
          todayDate: new Date().toLocaleDateString(),
          monthIncome: 0,
          monthLabel: "",
          monthGrowthPercent: 0,
          yearIncome: 0,
          yearLabel: "",
          yearGrowthPercent: 0,
          totalDebt: 0,
          debtorCount: 0,
          weeklyChart: [],
          topDebtors: [],
        });
      })
      .finally(() => setIsLoading(false));
  }, [allDebtors, totalDebt, debtorCount]);

  return { overview: overview ?? { todayIncome: 0, todayDate: "", monthIncome: 0, monthLabel: "", monthGrowthPercent: 0, yearIncome: 0, yearLabel: "", yearGrowthPercent: 0, totalDebt: 0, debtorCount: 0, weeklyChart: [], topDebtors: [] }, isLoading };
}
