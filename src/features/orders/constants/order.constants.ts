export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DONE: "done",
  CANCELLED: "cancelled",
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  done: "Done",
  cancelled: "Cancelled",
};

export const ORDER_FILTER_TABS = ["all", "pending", "confirmed", "done"] as const;
