import { useCallback, useEffect, useState } from "react";
import { api } from "@/services";
import { Debtor } from "../types/income.types";

export type DebtorProduct = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl?: string;
};

export type DebtorOrder = {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  products: DebtorProduct[];
};

export type DebtorCustomer = {
  id: string;
  code?: string;
  name: string;
  phone?: string;
  address?: string;
  status?: string;
};

export type DebtorDetail = {
  debtor: Debtor;
  customer?: DebtorCustomer;
  orders: DebtorOrder[];
  totalDebt: number;
};

type UseDebtorDetailResult = {
  data: DebtorDetail | null;
  orders: DebtorOrder[];
  totalDebt: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useDebtorDetail(
  debtor: Debtor | null
): UseDebtorDetailResult {
  const [data, setData] =
    useState<DebtorDetail | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // =========================================================
  // LOAD DETAIL
  // =========================================================

  const load = useCallback(async () => {
    if (!debtor) {
      setData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // =====================================================
      // CUSTOMER
      // =====================================================

      const customer =
        await api.customers.get(debtor.id);

      // =====================================================
      // CUSTOMER ORDERS
      // =====================================================

      const customerOrders =
        await api.customers.getOrders(debtor.id);

      // =====================================================
      // MAP ORDERS
      // =====================================================

      const debtorOrders: DebtorOrder[] =
        await Promise.all(
          customerOrders.map(async (order) => {
            const total =
              Number(order.totalAmount ?? 0);

            const paidAmount =
              Number(order.paidAmount ?? 0);

            const remainingAmount =
              Math.max(
                total - paidAmount,
                0
              );

            // =================================================
            // LOAD PRODUCT IMAGES
            //
            // Same logic as useOrderDetail.ts
            // =================================================

            const products: DebtorProduct[] =
              await Promise.all(
                (order.lines ?? []).map(
                  async (line) => {
                    let imageUrl = "";

                    try {
                      const product =
                        await api.products.get(
                          String(line.productId)
                        );

                      imageUrl =
                        product.imageUrl ?? "";

                      if (__DEV__) {
                        console.log(
                          "[DEBTOR DETAIL] Product:",
                          line.productId,
                          "Image:",
                          imageUrl
                        );
                      }
                    } catch (productError) {
                      if (__DEV__) {
                        console.warn(
                          "[DEBTOR DETAIL] Failed to load product:",
                          line.productId,
                          productError
                        );
                      }
                    }

                    return {
                      id: `${order.id}-${line.productId}`,

                      name: line.productName,

                      quantity:
                        Number(line.qty ?? 0),

                      price:
                        Number(
                          line.unitPrice ?? 0
                        ),

                      total:
                        Number(
                          line.lineTotal ?? 0
                        ),

                      imageUrl,
                    };
                  }
                )
              );

            return {
              id: order.id,

              orderNumber:
                order.code ||
                `#${order.id}`,

              orderDate:
                order.createdAt,

              status:
                String(
                  order.status ?? ""
                ),

              paymentStatus:
                String(
                  order.paymentStatus ?? ""
                ),

              total,

              paidAmount,

              remainingAmount,

              products,
            };
          })
        );

      // =====================================================
      // ONLY ORDERS WITH DEBT
      // =====================================================

      const unpaidOrders =
        debtorOrders.filter(
          (order) =>
            order.remainingAmount > 0
        );

      // =====================================================
      // TOTAL DEBT
      // =====================================================

      const totalDebt =
        unpaidOrders.reduce(
          (sum, order) =>
            sum +
            order.remainingAmount,
          0
        );

      // =====================================================
      // SAVE DATA
      // =====================================================

      setData({
        debtor,

        customer: {
          id: customer.id,

          name: customer.name,

          phone: customer.phone,

          address: customer.address,

          status: customer.status,
        },

        orders: unpaidOrders,

        totalDebt,
      });
    } catch (err) {
      console.error(
        "[useDebtorDetail] Failed to load:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load debtor detail"
      );

      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [debtor]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    load();
  }, [load]);

  // =========================================================
  // REFRESH
  // =========================================================

  const refresh = useCallback(
    async () => {
      await load();
    },
    [load]
  );

  // =========================================================
  // RETURN
  // =========================================================

  return {
    data,

    orders:
      data?.orders ?? [],

    totalDebt:
      data?.totalDebt ??
      Number(debtor?.amount ?? 0),

    isLoading,

    error,

    refresh,
  };
}