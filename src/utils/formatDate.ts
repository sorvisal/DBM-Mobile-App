export function formatDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString();
}

export function formatDateTime(date: Date | string | number): string {
  return new Date(date).toLocaleString();
}
