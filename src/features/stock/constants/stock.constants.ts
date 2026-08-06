export const STOCK_CATEGORIES = ["Beverage", "Food", "Snack"] as const;

export const EXPIRY_THRESHOLDS = {
  warningDays: 7,
  criticalDays: 15,
} as const;

export const STOCK_TABS = [
  { key: "add", label: "Add Stock" },
  { key: "history", label: "History" },
  { key: "list", label: "Stock List" },
  { key: "low", label: "Low Stock" },
] as const;
