import { useSyncExternalStore } from "react";
import { Debtor } from "../types/income.types";

let debtors: Debtor[] = [
  { id: "1", code: "CUS-001", name: "ហេង សុភា", initials: "HS", avatarColor: "#2563EB", phone: "012 345 678", amount: 500.0, dueDate: "25/05/2025" },
  { id: "2", code: "CUS-002", name: "លី ដារា", initials: "LD", avatarColor: "#EA580C", phone: "098 765 432", amount: 250.0, dueDate: "30/05/2025" },
  { id: "3", code: "CUS-003", name: "ស្រី ចន្ថា", initials: "SR", avatarColor: "#16A34A", phone: "097 111 222", amount: 180.0, dueDate: "28/05/2025" },
  { id: "4", code: "CUS-004", name: "ផៅ ពិដា", initials: "PT", avatarColor: "#9333EA", phone: "088 333 444", amount: 270.0, dueDate: "26/05/2025" },
];

let listeners: Array<() => void> = [];

function emitChange() {
  listeners.forEach((l) => l());
}

export function getDebtors() {
  return debtors;
}

export function subscribeToDebtors(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function useDebtors() {
  const allDebtors = useSyncExternalStore(subscribeToDebtors, getDebtors, getDebtors);
  const totalDebt = allDebtors.reduce((sum, d) => sum + d.amount, 0);

  return { debtors: allDebtors, totalDebt, debtorCount: allDebtors.length, isLoading: false };
}