import type {
  IncomeOrder,
  IncomeOrderStatus,
} from "../types/income.types";

/**
 * Shared order mapping helpers for the income feature.
 *
 * The API order shape is FLAT (see `mapOrder` in src/services/api.ts):
 * customer data is a plain `customerName` string — there is NO nested
 * `customer` object and no `displayName` field on an order.
 *
 * These helpers are used by both `useMonthlyIncome` and `useYearlyIncome`
 * so the two screens never diverge on order handling.
 */

export type IncomeOrderSource = {
  id: string | number;
  code?: string | null;
  customerId?: string | number | null;
  customerName?: string | null;
  status?: string | null;
  totalAmount?: number | null;
  createdAt?: string | null;
};

/**
 * Format API date without timezone conversion.
 *
 * Example:
 *
 * 2026-09-28T03:30:00Z
 *
 * -> 28/09/2026 03:30
 *
 * We intentionally do NOT use `new Date(value)` because timezone conversion
 * can change the displayed calendar date.
 */
export function formatOrderDate(value: unknown): string {
  if (!value) {
    return "-";
  }

  const text = String(value);

  const dateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!dateMatch) {
    return text;
  }

  const [, year, month, day] = dateMatch;

  const timeMatch = text.match(/T(\d{2}):(\d{2})/);

  if (!timeMatch) {
    return `${day}/${month}/${year}`;
  }

  const [, hours, minutes] = timeMatch;

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Extracts `MM/YYYY` from an API date string, e.g. "2026-09-28T03:30:00Z"
 * -> "09/2026". Returns "" when the date cannot be parsed.
 */
export function getOrderMonthKey(value?: string | null): string {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})/);

  if (!match) {
    return "";
  }

  const [, year, month] = match;

  return `${month}/${year}`;
}

/**
 * Extracts the month number (1-12) from an API date string. Returns 0 when
 * the date cannot be parsed.
 */
export function getOrderMonthNumber(value?: string | null): number {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})/);

  if (!match) {
    return 0;
  }

  const month = Number(match[2]);

  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : 0;
}

/**
 * Extracts `YYYY` from an API date string, e.g. "2026-09-28T03:30:00Z"
 * -> "2026". Returns "" when the year cannot be parsed.
 */
export function getOrderYearKey(value?: string | null): string {
  const match = String(value ?? "").match(/^(\d{4})/);

  return match ? match[1] : "";
}

/**
 * Only COMPLETED orders are income. Normalizes loose casings just in case
 * the API ever returns a differently cased value.
 */
export function isCompletedOrder(order: {
  status?: string | null;
}): boolean {
  return String(order.status ?? "").trim().toLowerCase() === "completed";
}

/**
 * Maps a raw (already frontend-mapped) order into the shared `IncomeOrder`
 * shape. Null-safe: an order may come from the API with missing/nullable
 * fields, so every field gets a meaningful default.
 */
export function mapIncomeOrder(order: IncomeOrderSource): IncomeOrder {
  const status: IncomeOrderStatus = isCompletedOrder(order)
    ? "completed"
    : "shipping";

  return {
    id: String(order.id ?? ""),

    code: order.code || `#${order.id}`,

    time: formatOrderDate(order.createdAt),

    customerCode: String(order.customerId ?? ""),

    customerName: order.customerName || "Unknown",

    amount: Number(order.totalAmount ?? 0),

    status,

    createdAt: order.createdAt ?? "",
  };
}

/**
 * Filters + dedupes raw orders to only the completed ones that belong to a
 * given month key (`MM/YYYY`). Used by the monthly screen.
 */
export function filterOrdersByMonth(
  orders: IncomeOrderSource[],
  monthKey: string
): IncomeOrder[] {
  return orders
    .filter((order) => getOrderMonthKey(order.createdAt) === monthKey)
    .filter(isCompletedOrder)
    .filter(
      (order, index, array) =>
        array.findIndex(
          (item) => String(item.id) === String(order.id)
        ) === index
    )
    .map(mapIncomeOrder);
}

/**
 * Filters + dedupes raw orders to only the completed ones that belong to a
 * given year key (`YYYY`). Used by the yearly screen.
 */
export function filterOrdersByYear(
  orders: IncomeOrderSource[],
  yearKey: string
): IncomeOrder[] {
  return orders
    .filter((order) => getOrderYearKey(order.createdAt) === yearKey)
    .filter(isCompletedOrder)
    .filter(
      (order, index, array) =>
        array.findIndex(
          (item) => String(item.id) === String(order.id)
        ) === index
    )
    .map(mapIncomeOrder);
}