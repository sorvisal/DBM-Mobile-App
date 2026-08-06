export interface DashboardStats {
  totalStock: number;
  totalOrders: number;
  totalCustomers: number;
  totalIncome: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export interface DashboardSummary {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
}
