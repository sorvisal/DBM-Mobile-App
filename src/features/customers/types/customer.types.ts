export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  location: string;
  status: CustomerStatus;
  orderCount: number;
  totalSpent: number;
}

export interface CustomerOrder {
  id: string;
  createdAt: string;
  total: number;
  status: string;
}
