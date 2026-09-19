import { useCallback, useState } from "react";
import {
  api,
  invalidateOrderCache,
  invalidateOrderDetailCache,
  isInsufficientStockError,
  parseInsufficientStockErrors,
  type InsufficientStockIssue,
} from "@/services";
import type { Order } from "../types/types";

export type ReorderFailure = {
  reason: "insufficient_stock" | "error";
  issues: InsufficientStockIssue[];
  message?: string;
};

export type ReorderResult =
  | { ok: true; orderId: string }
  | { ok: false; failure: ReorderFailure };

const DEFAULT_ERROR_MESSAGE =
  "មានបញ្ហាក្នុងការបង្កើតការបញ្ជាទិញម្តងទៀត។ សូមព្យាយាមម្តងទៀត។";

/**
 * Reorder an existing order.
 *
 * - Reads CURRENT product stock/price from the catalog (never reuses the old
 *   order totals).
 * - Validates current stock BEFORE creating anything.
 * - Creates a brand-new order via `api.orders.create` — the old order is never
 *   modified and its payment/debt information is left untouched.
 */
export function useReorderOrder() {
  const [isReordering, setIsReordering] = useState(false);

  const reorder = useCallback(
    async (order: Order): Promise<ReorderResult> => {
      if (!order || order.lines.length === 0) {
        return {
          ok: false,
          failure: {
            reason: "error",
            issues: [],
            message:
              "មិនមានទំនិញក្នុងការបញ្ជាទិញទេ។ មិនអាចបញ្ជាទិញម្តងទៀតបានទេ។",
          },
        };
      }

      setIsReordering(true);

      try {
        // 1. Load current product data (stock + name) per line.
        const products = await Promise.all(
          order.lines.map((line) =>
            api.products
              .get(String(line.id))
              .catch(() => null)
          )
        );

        // 2. Validate current stock BEFORE creating the new order.
        const issues: InsufficientStockIssue[] = [];
        const missingProducts: string[] = [];

        order.lines.forEach(
          (line, index) => {
            const product = products[index];

            if (!product) {
              missingProducts.push(
                line.name
              );
              return;
            }

            const available = Number(
              product.stock ?? 0
            );

            const requested = Number(
              line.qty ?? 0
            );

            if (
              requested > available
            ) {
              issues.push({
                productName:
                  product.name ||
                  line.name,
                available,
                requested,
              });
            }
          }
        );

        if (issues.length > 0) {
          return {
            ok: false,
            failure: {
              reason:
                "insufficient_stock",
              issues,
            },
          };
        }

        if (missingProducts.length > 0) {
          return {
            ok: false,
            failure: {
              reason: "error",
              issues: [],
              message: `ទំនិញអាចត្រូវបានលុបចេញ ឬមិនអាចយកមកវិញបានទេ៖ ${missingProducts.join(
                ", "
              )}។`,
            },
          };
        }

        // 3. Create the new order. The backend prices each line using CURRENT
        //    product prices (only productId + qty are sent).
        const result =
          await api.orders.create({
            customerId: Number(
              order.customer.id
            ),
            lines: order.lines.map(
              (line) => ({
                productId: Number(
                  line.id
                ),
                qty: Number(line.qty),
              })
            ),
            deliveryAddress:
              order.address ?? "",
            description:
              order.note ?? "",
          });

        // Refresh order lists/dashboard, drop any cache for the new order so
        // its detail screen fetches fresh data. The old order is untouched.
        invalidateOrderCache();
        invalidateOrderDetailCache(
          result.id
        );

        return {
          ok: true,
          orderId: result.id,
        };
      } catch (error) {
        // The stock may have changed between our check and the create call.
        // Surface the backend's stock validation as the same Snackbar UI
        // instead of a raw Axios 400.
        if (
          isInsufficientStockError(
            error
          )
        ) {
          const issues =
            parseInsufficientStockErrors(
              error
            );

          if (issues.length > 0) {
            return {
              ok: false,
              failure: {
                reason:
                  "insufficient_stock",
                issues,
              },
            };
          }
        }

        if (__DEV__) {
          console.error(
            "[REORDER] Failed to create new order:",
            error
          );
        }

        return {
          ok: false,
          failure: {
            reason: "error",
            issues: [],
            message: DEFAULT_ERROR_MESSAGE,
          },
        };
      } finally {
        setIsReordering(false);
      }
    },
    []
  );

  return { reorder, isReordering };
}