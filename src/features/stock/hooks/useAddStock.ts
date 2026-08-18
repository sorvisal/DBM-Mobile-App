import { useState } from "react";
import { api, invalidateStockCache, invalidateStockHistoryCache } from "@/services";
import type { CreateProductRequest } from "@/types/api";

export function useAddStock() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (values: {
    name: string;
    category: string;
    quantity: string;
    buyPrice: string;
    sellPrice: string;
    expiresAt: string;
    imageUrl: string;
    note?: string;
  }) => {
    setIsLoading(true);
    try {
      const req: CreateProductRequest = {
        name: values.name,
        sku: `SKU-${Date.now()}`,
        categoryId: values.category,
        costPrice: Number(values.buyPrice) || 0,
        salePrice: Number(values.sellPrice) || 0,
        lowStockThreshold: 10,
        stock: Number(values.quantity) || 0,
        expiryDate: values.expiresAt || undefined,
        imageUrl: values.imageUrl || undefined,
      };
      const product = await api.products.create(req);
      await api.stock.createMovement({
        productId: product.id,
        type: "in",
        quantity: Number(values.quantity) || 0,
        note: values.note,
      });
      invalidateStockCache();
      invalidateStockHistoryCache();
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
}
