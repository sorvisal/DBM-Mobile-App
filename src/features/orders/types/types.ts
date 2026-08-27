export enum OrderStatus {
  New = "new",
  Pending = "pending",
  Approved = "approved",
  Confirmed = "confirmed",
  Shipping = "shipping",
  Completed = "completed",
  Cancelled = "cancelled",
}

export type OrderItem = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  qty: number;
};

export type OrderCustomer = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
};

export type OrderDelivery = {
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  confirmedAt?: string;
  deliveredAt?: string;
};

export type Order = {
  id: string;
  code: string;
  status: OrderStatus;
  customer: OrderCustomer;
  createdAt: string;
  lines: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  delivery?: OrderDelivery;
  paymentMethod?: string;
  address?: string;
  note?: string;
  paymentStatus?: string;
  paidAmount?: number;
  remainingAmount?: number;
};