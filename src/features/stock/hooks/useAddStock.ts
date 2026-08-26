//useAddStock.ts
import { useState } from "react";
import {
  api,
  invalidateStockCache,
  invalidateStockHistoryCache,
} from "@/services";

import {
  mapApiProduct,
  notifyNewProduct,
  mergeNewProductIntoCache,
} from "./useStockList";

export function useAddStock() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (values: {
    productId: string;
    quantity: string;
    note?: string;
  }) => {
    setIsLoading(true);

    try {
      const quantity = Number(values.quantity) || 0;

      // Validate Product
      if (!values.productId) {
        throw new Error("សូមជ្រើសរើសផលិតផល");
      }

      // Validate quantity
      if (quantity <= 0) {
        throw new Error("ចំនួនស្តុកត្រូវតែធំជាង 0");
      }

      if (__DEV__) {
        console.log("[ADD STOCK]");
        console.log("Product ID:", values.productId);
        console.log("Quantity:", quantity);
        console.log("Note:", values.note);
      }

      /**
       * IMPORTANT
       * -----------------------------
       * We DO NOT call api.products.create()
       *
       * Product is already created from Admin Web.
       *
       * Mobile App only adds stock using
       * Stock Movement.
       */
      const movement = await api.stock.createMovement({
        productId: values.productId,
        type: "in",
        quantity,
        note: values.note,
      });

      if (__DEV__) {
        console.log("[ADD STOCK] movement created:", movement);
      }

      /**
       * Clear old cache
       */
      invalidateStockCache();
      invalidateStockHistoryCache();

      /**
       * Refresh the selected product so the new stock
       * quantity is reflected correctly.
       */
      try {
        const product = await api.products.get(values.productId);

        if (__DEV__) {
          console.log(
            "[ADD STOCK] updated product:",
            product
          );
        }

        /**
         * Update mounted product lists immediately.
         */
        const mapped = mapApiProduct(product, 0);

        notifyNewProduct(mapped);

        /**
         * Update product cache.
         */
        await mergeNewProductIntoCache(mapped);
      } catch (refreshError) {
        /**
         * Stock movement already succeeded.
         * If refreshing the product fails, don't fail
         * the whole operation.
         */
        if (__DEV__) {
          console.warn(
            "[ADD STOCK] Product refresh failed:",
            refreshError
          );
        }
      }

      return movement;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading,
  };
}