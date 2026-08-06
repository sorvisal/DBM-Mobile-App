export function formatCurrency(amount: number, currency = "USD"): string {
  return amount.toLocaleString("en-US", { style: "currency", currency });
}
