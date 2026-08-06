export type IncomeTimeRange = "today" | "week" | "month" | "year" | "custom";

export interface IncomeSummary {
  totalIncome: number;
  outstandingDebt: number;
  changePercent: number;
  range: IncomeTimeRange;
}

export interface DebtorEntry {
  id: string;
  customerName: string;
  amount: number;
  dueDate: string;
}

export interface IncomeOrder {
  id: string;
  orderCode: string;
  amount: number;
  createdAt: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}
