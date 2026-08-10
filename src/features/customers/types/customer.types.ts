export enum CustomerStatus {
  Active = "active",
  Inactive = "inactive",
}

export type CustomerOrderSummary = {
  id: string;
  code: string;
  date: string;
  status: string;
  total: number;
  itemCount: number;
};

export type Customer = {
  id: string;
  code: string;
  name: string;
  initials: string;
  avatarColor: string;
  phone: string;
  location: string;
  status: CustomerStatus;
  totalOrders: number;
  totalSpent: number;
  memberSince: string;
  customerType: string;
  note: string;
  orders: CustomerOrderSummary[];
};