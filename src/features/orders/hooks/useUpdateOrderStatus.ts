export function useUpdateOrderStatus() {
  const mutate = () => Promise.resolve();
  return { mutate, isLoading: false };
}
