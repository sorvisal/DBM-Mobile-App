import { useSyncExternalStore } from "react";
import { Customer, CustomerStatus } from "../types/customer.types";

let customers: Customer[] = [
  {
    id: "1",
    code: "CUS-001",
    name: "ហេង សុភា",
    initials: "HS",
    avatarColor: "#2563EB",
    phone: "012 345 678",
    location: "ភ្នំពេញ",
    status: CustomerStatus.Active,
    totalOrders: 12,
    totalSpent: 350.0,
    memberSince: "15/01/2024",
    customerType: "អតិថិជនប្រចាំ",
    note: "-",
    orders: [
      { id: "o1", code: "ORD-250525-001", date: "25/05/2025 10:30 AM", status: "កំពុងដឹក", total: 120.0, itemCount: 3 },
      { id: "o2", code: "ORD-250525-002", date: "20/05/2025 11:20 AM", status: "កំពុងដឹក", total: 85.5, itemCount: 2 },
      { id: "o3", code: "ORD-250525-003", date: "18/05/2025 09:45 AM", status: "បានបញ្ចប់", total: 150.75, itemCount: 4 },
      { id: "o4", code: "ORD-250524-004", date: "15/05/2025 03:10 PM", status: "បានបញ្ចប់", total: 60.0, itemCount: 1 },
      { id: "o5", code: "ORD-250524-005", date: "10/05/2025 09:15 AM", status: "បោះបង់", total: 45.0, itemCount: 1 },
      { id: "o6", code: "ORD-250520-006", date: "05/05/2025 02:20 PM", status: "បានបញ្ចប់", total: 200.0, itemCount: 5 },
    ],
  },
  {
    id: "2",
    code: "CUS-002",
    name: "លី ដារា",
    initials: "LD",
    avatarColor: "#EA580C",
    phone: "098 765 432",
    location: "សៀមរាប",
    status: CustomerStatus.Active,
    totalOrders: 8,
    totalSpent: 210.0,
    memberSince: "03/03/2024",
    customerType: "អតិថិជនប្រចាំ",
    note: "-",
    orders: [
      { id: "o7", code: "ORD-250521-001", date: "21/05/2025 01:00 PM", status: "បានបញ្ចប់", total: 90.0, itemCount: 2 },
    ],
  },
  {
    id: "3",
    code: "CUS-003",
    name: "ស្រី ចន្ថា",
    initials: "SR",
    avatarColor: "#16A34A",
    phone: "097 111 222",
    location: "បាត់ដំបង",
    status: CustomerStatus.Active,
    totalOrders: 15,
    totalSpent: 480.0,
    memberSince: "20/11/2023",
    customerType: "អតិថិជនធំ",
    note: "ទិញញឹកញាប់",
    orders: [
      { id: "o8", code: "ORD-250519-001", date: "19/05/2025 04:00 PM", status: "កំពុងដឹក", total: 130.0, itemCount: 3 },
    ],
  },
  {
    id: "4",
    code: "CUS-004",
    name: "ផៅ ពិដា",
    initials: "PT",
    avatarColor: "#9333EA",
    phone: "088 333 444",
    location: "កំពត",
    status: CustomerStatus.Inactive,
    totalOrders: 3,
    totalSpent: 95.0,
    memberSince: "10/02/2025",
    customerType: "អតិថិជនថ្មី",
    note: "-",
    orders: [],
  },
  {
    id: "5",
    code: "CUS-005",
    name: "គង់ គុសល",
    initials: "KK",
    avatarColor: "#CA8A04",
    phone: "060 555 666",
    location: "ព្រៃវែង",
    status: CustomerStatus.Active,
    totalOrders: 6,
    totalSpent: 175.0,
    memberSince: "05/06/2024",
    customerType: "អតិថិជនប្រចាំ",
    note: "-",
    orders: [],
  },
];

let listeners: Array<() => void> = [];

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function getCustomers() {
  return customers;
}

export function addCustomer(customer: Customer) {
  customers = [customer, ...customers];
  emitChange();
}

export function deleteCustomer(customerId: string) {
  customers = customers.filter((c) => c.id !== customerId);
  emitChange();
}
export function updateCustomer(customerId: string, patch: Partial<Customer>) {
  customers = customers.map((c) => (c.id === customerId ? { ...c, ...patch } : c));
  emitChange();
}
export function subscribeToCustomers(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function useCustomerList() {
  const allCustomers = useSyncExternalStore(subscribeToCustomers, getCustomers, getCustomers);

  const stats = {
    totalCustomers: allCustomers.length,
    activeCustomers: allCustomers.filter((c) => c.status === CustomerStatus.Active).length,
    totalOrders: allCustomers.reduce((sum, c) => sum + c.totalOrders, 0),
    totalSpent: allCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
  };

  return { customers: allCustomers, stats, isLoading: false };
}