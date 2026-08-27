import { useCallback, useEffect, useRef, useState } from "react";
import {
  api,
  cacheGet,
  cacheSet,
  cacheClearKeySync,
  CacheTTL,
  suppressGlobalLoading,
  unsuppressGlobalLoading,
} from "@/services";
import { normalizeOrderStatus } from "../constants/order.constants";
import type { Order } from "../types/types";

const STALE_TTL = CacheTTL.MEDIUM;

async function mapApiOrder(
  o: import("@/types/api").Order
): Promise<Order> {
  const apiLines = o.lines ?? [];

  /**
   * Load product information using productId
   * because the Order API does not return product imageUrl
   * inside each order line.
   */
  const lines = await Promise.all(
    apiLines.map(async (i) => {
      let imageUrl = "";

      try {
        const product = await api.products.get(String(i.productId));

        imageUrl = product.imageUrl ?? "";

        if (__DEV__) {
          console.log(
            "[ORDER DETAIL] Product:",
            i.productId,
            "Image:",
            imageUrl
          );
        }
      } catch (error) {
        if (__DEV__) {
          console.warn(
            "[ORDER DETAIL] Failed to load product:",
            i.productId,
            error
          );
        }
      }

      return {
        id: i.productId,
        name: i.productName,
        imageUrl,
        price: i.unitPrice,
        qty: i.qty,
      };
    })
  );

  /**
   * Remove duplicate products by product ID.
   */
  const uniqueLines = lines.filter(
    (item, idx, arr) =>
      arr.findIndex((x) => x.id === item.id) === idx
  );

  const subtotal = uniqueLines.reduce(
    (sum, line) => sum + line.price * line.qty,
    0
  );

  return {
    id: o.id,
    code: o.code,
    status: normalizeOrderStatus(o.status),

    customer: {
      id: String(o.customerId),
      name: o.customerName,
    },

    createdAt: o.createdAt,

    lines: uniqueLines,

    subtotal,

    deliveryFee: 0.5,

    total: o.totalAmount,

    paidAmount: o.paidAmount ?? 0,

    remainingAmount:
      o.totalAmount - (o.paidAmount ?? 0),

    paymentMethod:
      o.paymentMethod ?? undefined,

    address:
      o.deliveryAddress ?? undefined,

    /**
     * Backend returns Order Note as "description".
     * Support "note" too if another API response provides it.
     */
    note:
      o.note ??
      o.description ??
      undefined,

    paymentStatus:
      o.paymentStatus,

    delivery: o.driverName
      ? {
          driverName: o.driverName,

          driverPhone:
            o.driverPhone ?? undefined,

          confirmedAt:
            o.confirmedAt ?? undefined,

          deliveredAt:
            o.completedAt ?? undefined,
        }
      : undefined,
  };
}

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshKey = useRef(0);

  const refresh = useCallback(() => {
    refreshKey.current += 1;
  }, []);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    setIsLoading(true);

    const cacheKey = `order:${orderId}`;

    (async () => {
      /**
       * Restore cached order first.
       */
      const cached = await cacheGet<Order>(cacheKey);

      if (cached && !cancelled) {
        setOrder(cached);
        setIsLoading(false);
      }

      if (!cancelled) {
        /**
         * Suppress global loading overlay
         * when cached data is already visible.
         */
        if (cached) {
          suppressGlobalLoading();
        }

        try {
          /**
           * Get latest order from API.
           */
          const o = await api.orders.get(orderId);

          if (cancelled) return;

          /**
           * Map order + load product images.
           */
          const mapped = await mapApiOrder(o);

          if (cancelled) return;

          /**
           * Save mapped order to cache.
           */
          cacheSet(
            cacheKey,
            mapped,
            STALE_TTL
          ).catch(() => {});

          setOrder(mapped);

          /**
           * Order API only provides customer ID + name.
           * Fetch customer separately for phone/address.
           */
          if (
            mapped.customer.id &&
            !cancelled
          ) {
            const customer =
              await api.customers
                .get(mapped.customer.id)
                .catch(() => null);

            if (cancelled || !customer) {
              return;
            }

            const enriched: Order = {
              ...mapped,

              customer: {
                id: mapped.customer.id,

                name: mapped.customer.name,

                phone:
                  customer.phone,

                address:
                  customer.address,
              },
            };

            /**
             * Update cache with customer information.
             */
            cacheSet(
              cacheKey,
              enriched,
              STALE_TTL
            ).catch(() => {});

            setOrder(enriched);
          }
        } catch (error) {
          if (__DEV__) {
            console.error(
              "[ORDER DETAIL] Failed to load order:",
              error
            );
          }

          if (!cancelled) {
            setOrder(null);
          }
        } finally {
          if (cached) {
            unsuppressGlobalLoading();
          }

          if (!cancelled) {
            setIsLoading(false);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, refreshKey.current]);

  return {
    order,
    isLoading,
    refresh,
  };
}

export function clearOrderDetailCache(
  orderId: string
): void {
  cacheClearKeySync(
    `order:${orderId}`
  );
}