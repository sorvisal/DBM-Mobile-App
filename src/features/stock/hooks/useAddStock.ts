import { useState } from "react";
import { api, invalidateStockCache, invalidateStockHistoryCache } from "@/services";
import type { CreateProductRequest } from "@/types/api";
import { mapApiProduct, notifyNewProduct, mergeNewProductIntoCache } from "./useStockList";

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
      if (__DEV__) {
        console.log('[ADD STOCK] sent imageUrl ->', req.imageUrl, '| created product.imageUrl ->', product.imageUrl);
      }
      await api.stock.createMovement({
        productId: product.id,
        type: "in",
        quantity: Number(values.quantity) || 0,
        note: values.note,
      });

      // Clear stale cache entries first (existing behavior — covers dashboard,
      // stock movements, and any other search/page variants of the product list).
      invalidateStockCache();
      invalidateStockHistoryCache();

      // Then push the new product into every currently-mounted useStockList()
      // instance instantly, and merge it into the default list cache too — this
      // must happen AFTER invalidateStockCache(), since that clears the
      // "products:" prefix and would otherwise wipe this merge right away.
      const mapped = mapApiProduct(product, 0);
      notifyNewProduct(mapped);
      await mergeNewProductIntoCache(mapped);
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
}