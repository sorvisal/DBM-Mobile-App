import { useEffect, useState } from "react";
import { api } from "@/services";
import type { Product } from "@/types/api";

export function useProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await api.products.list({
          page: 1,
          pageSize: 100,
        });

        if (!mounted) return;

        setProducts(result.items ?? []);
      } catch (err) {
        console.error(
          "[PRODUCT LIST] Failed to load products:",
          err
        );

        if (mounted) {
          setError("មិនអាចទាញយកផលិតផលបានទេ");
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    products,
    isLoading,
    error,
  };
}