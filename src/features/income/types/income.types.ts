export type IncomeOrderStatus = "completed" | "shipping" | "cancelled";

export type IncomeOrder = {
  id: string;
  code: string;
  time: string;
  customerCode: string;
  customerName: string;
  amount: number;
  status: IncomeOrderStatus;
};

export type Debtor = {
  id: string;
  code: string;
  name: string;
  initials: string;
  avatarColor: string;
  phone: string;
  amount: number;
  dueDate: string;
};

export type ChartPoint = {
  label: string;
  amount: number;
};

export type DailyIncomeSummary = {
  date: string;
  totalIncome: number;
  orderCount: number;
  orders: IncomeOrder[];
  cashCollected: number;
  discount: number;
  otherExpense: number;
  netTotal: number;
};

export type MonthlyIncomeSummary = {
  month: string;
  totalIncome: number;
  orderCount: number;
  dailyChart: ChartPoint[];
  debtors: Debtor[];
  totalDebt: number;
};

export type IncomeOverview = {
  todayIncome: number;
  todayDate: string;
  monthIncome: number;
  monthLabel: string;
  monthGrowthPercent: number;
  yearIncome: number;
  yearLabel: string;
  yearGrowthPercent: number;
  totalDebt: number;
  debtorCount: number;
  weeklyChart: ChartPoint[];
  topDebtors: Debtor[];
};
export type YearlyIncomeSummary = {
  year: string;
  totalIncome: number;
  orderCount: number;
  monthlyChart: ChartPoint[];
  debtors: Debtor[];
  totalDebt: number;
  growthPercent: number;
};