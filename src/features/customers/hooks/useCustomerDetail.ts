import { useSyncExternalStore } from "react";
import { getCustomers, subscribeToCustomers } from "./useCustomerList";

export function useCustomerDetail(customerId: string) {
  const allCustomers = useSyncExternalStore(subscribeToCustomers, getCustomers, getCustomers);
  const customer = allCustomers.find((c) => c.id === customerId) ?? null;

  return { customer, isLoading: false };
}