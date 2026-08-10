import { DailyIncomeSummary } from "../types/income.types";

const DAILY_DATA: Record<string, DailyIncomeSummary> = {
  "25/05/2025": {
    date: "25/05/2025",
    totalIncome: 250.0,
    orderCount: 3,
    orders: [
      { id: "1", code: "ORD-250525-001", time: "10:30 AM", customerCode: "CUS-001", customerName: "ហេង សុភា", amount: 120.0, status: "completed" },
      { id: "2", code: "ORD-250525-002", time: "11:20 AM", customerCode: "CUS-002", customerName: "លី ដារា", amount: 85.5, status: "completed" },
      { id: "3", code: "ORD-250525-003", time: "02:45 PM", customerCode: "CUS-003", customerName: "ស្រុន មករា", amount: 44.5, status: "completed" },
    ],
    cashCollected: 250.0,
    discount: 0,
    otherExpense: 0,
    netTotal: 250.0,
  },
};

export function useDailyIncome(date: string) {
  const summary = DAILY_DATA[date] ?? {
    date,
    totalIncome: 0,
    orderCount: 0,
    orders: [],
    cashCollected: 0,
    discount: 0,
    otherExpense: 0,
    netTotal: 0,
  };

  return { summary, isLoading: false };
}