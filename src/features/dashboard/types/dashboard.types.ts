export type DashboardStat = {
  key: string;
  icon: string;
  iconBg: string;
  title: string;
  value: string;
  unit: string;
};

export type QuickAction = {
  key: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
};

export type RecentActivity = {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  time: string;
};

export type RevenuePeriod = 'day' | 'week' | 'month';
export type ChartRange = '7d' | '30d' | '90d';
export type ExportType = 'excel' | 'pdf';
export type ExportPeriod = 'day' | 'week' | 'month' | 'year';

export type RevenueData = {
  period: RevenuePeriod;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  ordersCount: number;
  averageOrderValue: number;
};

export type ChartPoint = {
  date: string;
  revenue: number;
};

export type ReceivableCustomer = {
  customerId: string;
  customerName: string;
  balance: number;
};

export type ReceivablesData = {
  totalReceivable: number;
  overdueCount: number;
  customers: ReceivableCustomer[];
};