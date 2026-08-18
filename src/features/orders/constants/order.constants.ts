import { Order, OrderStatus } from "../types/types";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.New]: "ថ្មី",
  [OrderStatus.Pending]: "រង់ចាំ",
  [OrderStatus.Confirmed]: "បញ្ជាក់",
  [OrderStatus.Shipping]: "កំពុងដឹក",
  [OrderStatus.Completed]: "បញ្ចប់",
  [OrderStatus.Cancelled]: "លុបចោល",
};

export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  [OrderStatus.New]: { bg: "bg-gray-50", text: "text-gray-600" },
  [OrderStatus.Pending]: { bg: "bg-orange-50", text: "text-orange-600" },
  [OrderStatus.Confirmed]: { bg: "bg-blue-50", text: "text-blue-600" },
  [OrderStatus.Shipping]: { bg: "bg-purple-50", text: "text-purple-600" },
  [OrderStatus.Completed]: { bg: "bg-green-50", text: "text-green-600" },
  [OrderStatus.Cancelled]: { bg: "bg-red-50", text: "text-red-600" },
};

// Only these 4 statuses appear as filter tabs; counts are computed live, not hardcoded here.
export const ORDER_FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "ថ្មីៗ" },
  { key: OrderStatus.Shipping, label: "កំពុងដឹក" },
  { key: OrderStatus.Completed, label: "បានបញ្ចប់" },
  { key: OrderStatus.Cancelled, label: "លុបចោល" },
];