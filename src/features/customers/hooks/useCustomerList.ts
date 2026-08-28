import { useState, useCallback, useEffect } from "react";
import {
  api,
  cacheGet,
  cacheSet,
  cacheClearKeySync,
  CacheTTL,
  suppressGlobalLoading,
  unsuppressGlobalLoading,
} from "@/services";
import { resolveMediaUrl } from "@/services/http";
import { CustomerStatus } from "../types/customer.types";

export interface CustomerOrder {
  id: string;
  code: string;
  date: string;
  status: string;
  total: number;
  itemCount: number;
}

export interface FeatureCustomer {
  id: string;
  code: string;
  name: string;
  initials: string;
  avatarColor: string;
  phone: string;
  location: string;
  status: CustomerStatus;

  // Customer statistics
  totalOrders: number;
  totalSpent: number;

  memberSince: string;
  note: string;

  orders: CustomerOrder[];

  imageUrl?: string | null;
  _photoPath?: string | null;
}

const AVATAR_COLORS = [
  "#2563EB",
  "#EA580C",
  "#16A34A",
  "#9333EA",
  "#CA8A04",
  "#DC2626",
];

const PAGE_SIZE = 20;
const STALE_TTL = CacheTTL.LONG;

function cacheKeyForPage(page: number) {
  return `customers:list:p${page}`;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso?: string) {
  if (!iso) return "-";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
}

/**
 * Calculate customer statistics from actual orders.
 *
 * Total Orders:
 *   Number of orders belonging to this customer.
 *
 * Total Spent:
 *   Sum of order.totalAmount.
 *
 * We intentionally DO NOT use customer.balance here.
 */
function calculateCustomerStats(orders: any[]) {
  const validOrders = (orders ?? []).filter(
    (order) => order && order.id != null
  );

  const totalOrders = validOrders.length;

  const totalSpent = validOrders.reduce((sum, order) => {
    const amount = Number(order.totalAmount ?? 0);

    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  return {
    totalOrders,
    totalSpent,
  };
}

function mapOrders(orders: any[]): CustomerOrder[] {
  return (orders ?? [])
    .filter((order) => order && order.id != null)
    .filter(
      (order, index, array) =>
        array.findIndex((item) => item.id === order.id) === index
    )
    .map((order) => ({
      id: String(order.id),
      code: String(order.code ?? ""),
      date: order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : "-",
      status: String(order.status ?? ""),
      total: Number(order.totalAmount ?? 0),
      itemCount: Array.isArray(order.lines) ? order.lines.length : 0,
    }));
}

/**
 * Map customer returned by the Customer API.
 *
 * NOTE:
 * totalOrders and totalSpent are NOT taken from the customer balance.
 * They are calculated later after getOrders().
 */
function mapCustomer(
  customer: {
    id: string | number;
    name: string;
    phone?: string;
    address?: string;
    status: string;
    balance?: number;
    totalOrders?: number;
    createdAt: string;
    photoPath?: string | null;
    description?: string;
  },
  index: number
): FeatureCustomer {
  return {
    id: String(customer.id),

    code: `CUS-${customer.id}`,

    name: customer.name ?? "",

    initials: getInitials(customer.name ?? ""),

    avatarColor:
      AVATAR_COLORS[index % AVATAR_COLORS.length],

    phone: customer.phone ?? "",

    location: customer.address ?? "",

    status:
      customer.status === "inactive"
        ? CustomerStatus.Inactive
        : CustomerStatus.Active,

    // These are calculated from orders later.
    totalOrders: 0,
    totalSpent: 0,

    memberSince: formatDate(customer.createdAt),

    note:
      customer.description?.trim()
        ? String(customer.description)
        : "-",

    orders: [],

    imageUrl: resolveMediaUrl(customer.photoPath),

    _photoPath: customer.photoPath ?? null,
  };
}

type NewCustomerListener = (
  customer: FeatureCustomer
) => void;

const newCustomerListeners =
  new Set<NewCustomerListener>();

/**
 * Load all orders for a customer and calculate:
 *
 * totalOrders
 * totalSpent
 */
async function enrichCustomerWithOrders(
  customer: FeatureCustomer
): Promise<FeatureCustomer> {
  try {
    const response = await api.customers.getOrders(
      customer.id
    );

    /**
     * Depending on your api.ts implementation,
     * getOrders() may return:
     *
     * [
     *   ...
     * ]
     *
     * OR:
     *
     * {
     *   items: [...]
     * }
     *
     * OR:
     *
     * {
     *   data: [...]
     * }
     */
    const rawOrders =
      Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.items)
        ? (response as any).items
        : Array.isArray((response as any)?.data)
        ? (response as any).data
        : [];

    const orders = mapOrders(rawOrders);

    const stats = calculateCustomerStats(
      rawOrders
    );

    return {
      ...customer,

      // Correct customer statistics
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,

      orders,
    };
  } catch (error) {
    console.warn(
      `[CUSTOMER] Failed to load orders for customer ${customer.id}`,
      error
    );

    /**
     * If orders cannot be loaded, don't use balance
     * as a fake Total Spend.
     */
    return {
      ...customer,
      totalOrders: 0,
      totalSpent: 0,
      orders: [],
    };
  }
}

export function useCustomerList() {
  const [allCustomers, setAllCustomers] =
    useState<FeatureCustomer[]>([]);

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isFetchingMore, setIsFetchingMore] =
    useState(false);

  const [stale, setStale] = useState(false);

  /**
   * Load one page of customers.
   */
  const loadPage = useCallback(
    async (pageNumber: number, append = false) => {
      if (append) {
        setIsFetchingMore(true);
      } else {
        setIsLoading(true);
        setAllCustomers([]);
      }

      try {
        console.log(
          `[CUSTOMER] Loading page ${pageNumber}`
        );

        const response =
          await api.customers.list({
            page: pageNumber,
            pageSize: PAGE_SIZE,
          });

        const baseCustomers =
          (response.items ?? [])
            .map((customer, index) =>
              mapCustomer(
                customer,
                (pageNumber - 1) *
                  PAGE_SIZE +
                  index
              )
            )
            .filter(
              (
                customer,
                index,
                array
              ) =>
                array.findIndex(
                  (item) =>
                    item.id === customer.id
                ) === index
            );

        /**
         * IMPORTANT:
         *
         * Fetch orders for every customer
         * and calculate real statistics.
         */
        const enrichedCustomers =
          await Promise.all(
            baseCustomers.map(
              enrichCustomerWithOrders
            )
          );

        console.log(
          "[CUSTOMER] Enriched customers:",
          enrichedCustomers.map(
            (customer) => ({
              id: customer.id,
              name: customer.name,
              totalOrders:
                customer.totalOrders,
              totalSpent:
                customer.totalSpent,
            })
          )
        );

        await cacheSet(
          cacheKeyForPage(pageNumber),
          enrichedCustomers,
          STALE_TTL
        ).catch(() => {});

        if (pageNumber === 1) {
          setAllCustomers(
            enrichedCustomers
          );

          setTotal(
            response.total ??
              enrichedCustomers.length
          );
        } else {
          setAllCustomers((previous) => {
            const existingIds =
              new Set(
                previous.map(
                  (customer) =>
                    customer.id
                )
              );

            return [
              ...previous,
              ...enrichedCustomers.filter(
                (customer) =>
                  !existingIds.has(
                    customer.id
                  )
              ),
            ];
          });
        }

        setPage(pageNumber);
        setStale(false);
      } catch (error) {
        console.error(
          "[CUSTOMER] Failed to load customers:",
          error
        );

        if (!append) {
          setAllCustomers([]);
        }
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    []
  );

  /**
   * Prefetch remaining pages.
   */
  const prefetchRemainingPages =
    useCallback(
      async (
        currentTotal: number,
        fromPage: number
      ) => {
        const totalPages = Math.ceil(
          currentTotal / PAGE_SIZE
        );

        const promises: Promise<void>[] = [];

        for (
          let pageNumber =
            fromPage + 1;
          pageNumber <= totalPages;
          pageNumber++
        ) {
          promises.push(
            cacheGet<FeatureCustomer[]>(
              cacheKeyForPage(
                pageNumber
              )
            ).then(async (cached) => {
              if (cached) return;

              try {
                const response =
                  await api.customers.list({
                    page: pageNumber,
                    pageSize:
                      PAGE_SIZE,
                  });

                const baseCustomers =
                  (response.items ?? [])
                    .map(
                      (
                        customer,
                        index
                      ) =>
                        mapCustomer(
                          customer,
                          (pageNumber -
                            1) *
                            PAGE_SIZE +
                            index
                        )
                    );

                const enriched =
                  await Promise.all(
                    baseCustomers.map(
                      enrichCustomerWithOrders
                    )
                  );

                await cacheSet(
                  cacheKeyForPage(
                    pageNumber
                  ),
                  enriched,
                  STALE_TTL
                ).catch(() => {});
              } catch {
                // Ignore prefetch errors.
              }
            })
          );
        }

        await Promise.allSettled(
          promises
        );
      },
      []
    );

  /**
   * Initial load.
   */
  useEffect(() => {
    let cancelled = false;

    /**
     * Clear customer cache so the
     * statistics are always recalculated.
     */
    cacheClearKeySync(
      cacheKeyForPage(1)
    );

    for (
      let pageNumber = 2;
      pageNumber <= 10;
      pageNumber++
    ) {
      cacheClearKeySync(
        cacheKeyForPage(
          pageNumber
        )
      );
    }

    (async () => {
      const cached =
        await cacheGet<FeatureCustomer[]>(
          cacheKeyForPage(1)
        );

      if (cached && !cancelled) {
        /**
         * Show cache immediately.
         */
        const ensured =
          cached.map((customer) => ({
            ...customer,

            imageUrl:
              customer.imageUrl ??
              resolveMediaUrl(
                customer._photoPath
              ),
          }));

        const seen =
          new Set<string>();

        const unique =
          ensured.filter(
            (customer) => {
              if (
                seen.has(
                  customer.id
                )
              ) {
                return false;
              }

              seen.add(
                customer.id
              );

              return true;
            }
          );

        setAllCustomers(unique);

        setTotal(unique.length);

        setIsLoading(false);

        setStale(true);
      }

      if (!cancelled) {
        if (cached) {
          suppressGlobalLoading();
        }

        try {
          await loadPage(1);
        } catch {
          // Error handled by loadPage.
        } finally {
          if (cached) {
            unsuppressGlobalLoading();
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadPage]);

  /**
   * New customer listener.
   */
  useEffect(() => {
    const listener:
      NewCustomerListener =
      (newCustomer) => {
        setAllCustomers(
          (previous) => {
            if (
              previous.some(
                (customer) =>
                  customer.id ===
                  newCustomer.id
              )
            ) {
              return previous;
            }

            return [
              newCustomer,
              ...previous,
            ];
          }
        );

        setTotal(
          (previous) =>
            previous + 1
        );
      };

    newCustomerListeners.add(
      listener
    );

    return () => {
      newCustomerListeners.delete(
        listener
      );
    };
  }, []);

  const hasMore =
    allCustomers.length < total;

  /**
   * Load next page.
   */
  const loadMore = useCallback(() => {
    if (
      isFetchingMore ||
      !hasMore
    ) {
      return;
    }

    const nextPage =
      page + 1;

    cacheGet<FeatureCustomer[]>(
      cacheKeyForPage(
        nextPage
      )
    ).then(async (cached) => {
      if (cached) {
        setAllCustomers(
          (previous) => {
            const existingIds =
              new Set(
                previous.map(
                  (customer) =>
                    customer.id
                )
              );

            return [
              ...previous,
              ...cached.filter(
                (customer) =>
                  !existingIds.has(
                    customer.id
                  )
              ),
            ];
          }
        );

        setPage(nextPage);

        setIsFetchingMore(false);

        prefetchRemainingPages(
          total,
          nextPage
        );

        return;
      }

      await loadPage(
        nextPage,
        true
      );
    });
  }, [
    isFetchingMore,
    hasMore,
    page,
    total,
    loadPage,
    prefetchRemainingPages,
  ]);

  /**
   * Global customer statistics.
   *
   * These now use real order data.
   */
  const stats = {
    totalCustomers: total,

    activeCustomers:
      allCustomers.filter(
        (customer) =>
          customer.status ===
          CustomerStatus.Active
      ).length,

    totalOrders:
      allCustomers.reduce(
        (sum, customer) =>
          sum +
          customer.totalOrders,
        0
      ),

    totalSpent:
      allCustomers.reduce(
        (sum, customer) =>
          sum +
          customer.totalSpent,
        0
      ),
  };

  return {
    allCustomers,

    stats,

    isLoading,

    isFetchingMore,

    hasMore,

    loadMore,

    stale,

    refresh: () =>
      loadPage(1),
  };
}

/**
 * Add customer.
 */
export async function addCustomer(values: {
  name: string;
  phone?: string;
  address?: string;
  status?: "active" | "inactive";
  description?: string;
}) {
  await api.customers.create({
    name: values.name,
    phone: values.phone,
    address: values.address,
    status:
      values.status ?? "active",
    description:
      values.description?.trim()
        ? values.description
        : undefined,
  });

  cacheClearKeySync(
    cacheKeyForPage(1)
  );
}

/**
 * Update customer.
 */
export async function updateCustomer(
  id: string,
  patch: {
    name?: string;
    phone?: string;
    address?: string;
    status?: "active" | "inactive";
    description?: string;
  }
) {
  await api.customers.update(
    id,
    patch
  );

  cacheClearKeySync(
    cacheKeyForPage(1)
  );
}

/**
 * Delete customer.
 */
export async function deleteCustomer(
  id: string
) {
  await api.customers.remove(id);

  cacheClearKeySync(
    cacheKeyForPage(1)
  );
}