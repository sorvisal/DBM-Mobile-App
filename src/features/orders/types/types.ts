export enum OrderStatus {
  New = "new",
  Pending = "pending",
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
  quantity: number;
};

export type OrderCustomer = {
  name: string;
  phone: string;
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
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  delivery?: OrderDelivery;
  paymentMethod?: string;
  address?: string;
  note?: string;
  paymentStatus?: string;
};