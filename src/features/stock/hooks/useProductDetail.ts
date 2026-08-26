import { useState, useEffect, useCallback } from "react";
import { api } from "@/services";
import type { Product } from "@/types/api";

export function useProductDetail(productId: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    setProduct(null);

    try {
      const data = await api.products.get(id);
      setProduct(data);
    } catch (err) {
      console.error("[PRODUCT DETAIL] Failed to load product:", err);
      setError("មិនអាចទាញយកព័ត៌មានផលិតផលបានទេ");
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setError(null);
      return;
    }

    fetchProduct(productId);
  }, [productId, fetchProduct]);

  return {
    product,
    isLoading,
    error,
    refetch: fetchProduct,
  };
}
