import { Order, OrderStatus }  from "../types/types";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "រង់ចាំ",
  [OrderStatus.Confirmed]: "បញ្ជាក់",
  [OrderStatus.Shipping]: "កំពុងដឹក",
  [OrderStatus.Completed]: "បញ្ចប់",
};

export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  [OrderStatus.Pending]: { bg: "bg-orange-50", text: "text-orange-600" },
  [OrderStatus.Confirmed]: { bg: "bg-blue-50", text: "text-blue-600" },
  [OrderStatus.Shipping]: { bg: "bg-purple-50", text: "text-purple-600" },
  [OrderStatus.Completed]: { bg: "bg-green-50", text: "text-green-600" },
};

export const ORDER_FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "ទាំងអស់" },
  { key: OrderStatus.Pending, label: "រង់ចាំ" },
  { key: OrderStatus.Confirmed, label: "បញ្ជាក់" },
  { key: OrderStatus.Shipping, label: "កំពុងដឹក" },
  { key: OrderStatus.Completed, label: "បញ្ចប់" },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    code: "ORD-250525-001",
    status: OrderStatus.Pending,
    customer: { name: "លោក សុភា", phone: "012 345 678" },
    createdAt: "25/05/2025 10:30 AM",
    items: [
      { id: "i1", name: "Milk Bottle 1L", imageUrl: "https://picsum.photos/seed/milk/100", price: 2.0, quantity: 2 },
      { id: "i2", name: "Nivea Men Deodorant", imageUrl: "https://picsum.photos/seed/nivea/100", price: 3.5, quantity: 1 },
      { id: "i3", name: "Fresh Active Spray 200ml", imageUrl: "https://picsum.photos/seed/spray/100", price: 2.0, quantity: 1 },
    ],
    subtotal: 9.5,
    deliveryFee: 0.5,
    total: 10.0,
  },
  {
    id: "2",
    code: "ORD-250525-002",
    status: OrderStatus.Confirmed,
    customer: { name: "លោក ដារា", phone: "093 456 789" },
    createdAt: "25/05/2025 11:00 AM",
    items: [
      { id: "i4", name: "Coca-Cola 330ml", imageUrl: "https://picsum.photos/seed/coke/100", price: 0.5, quantity: 6 },
    ],
    subtotal: 3.0,
    deliveryFee: 0.5,
    total: 3.5,
  },
  {
    id: "3",
    code: "ORD-250525-003",
    status: OrderStatus.Shipping,
    customer: { name: "អ្នកនាង សុវណ្ណ", phone: "070 123 456" },
    createdAt: "24/05/2025 02:45 PM",
    items: [
      { id: "i5", name: "Pepsi 330ml", imageUrl: "https://picsum.photos/seed/pepsi/100", price: 0.5, quantity: 12 },
    ],
    subtotal: 6.0,
    deliveryFee: 0.5,
    total: 6.5,
    delivery: {
      driverName: "គង់ សុគន្ធ",
      driverPhone: "093 456 789",
      vehiclePlate: "1B-2345",
      confirmedAt: "25/05/2025 02:00 PM",
    },
  },
  {
    id: "4",
    code: "ORD-250525-004",
    status: OrderStatus.Pending,
    customer: { name: "លោក ចន្ទ្រា", phone: "081 222 333" },
    createdAt: "24/05/2025 03:18 PM",
    items: [
      { id: "i6", name: "ទឹកសុទ្ធ 1.5L", imageUrl: "https://picsum.photos/seed/water/100", price: 1.0, quantity: 4 },
    ],
    subtotal: 4.0,
    deliveryFee: 0.5,
    total: 4.5,
  },
  {
    id: "5",
    code: "ORD-250525-005",
    status: OrderStatus.Completed,
    customer: { name: "អ្នកនាង សុភាព", phone: "012 987 654" },
    createdAt: "23/05/2025 09:15 AM",
    items: [
      { id: "i7", name: "Sprite 330ml", imageUrl: "https://picsum.photos/seed/sprite/100", price: 0.5, quantity: 8 },
    ],
    subtotal: 4.0,
    deliveryFee: 0.5,
    total: 4.5,
    delivery: {
      driverName: "សុខ វិចិត្រ",
      driverPhone: "086 111 222",
      vehiclePlate: "2C-9981",
      confirmedAt: "23/05/2025 09:30 AM",
      deliveredAt: "23/05/2025 02:15 PM",
    },
  },
];