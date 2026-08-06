export function useAddStock() {
  const mutate = () => Promise.resolve();
  return { mutate, isLoading: false };
}
