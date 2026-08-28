import {
  useState,
  useCallback,
  useEffect,
} from "react";

import {
  api,
  cacheGet,
  cacheGetStale,
  cacheSet,
  CacheTTL,
  suppressGlobalLoading,
  unsuppressGlobalLoading,
} from "@/services";

import type { Debtor } from "../types/income.types";

const PAGE_SIZE = 20;
const CUSTOMER_PAGE_SIZE = 20;

const CACHE_KEY = "debtors:list";
const STALE_TTL = CacheTTL.LONG;

const AVATAR_COLORS = [
  "#2563EB",
  "#EA580C",
  "#16A34A",
  "#9333EA",
  "#CA8A04",
  "#DC2626",
];

/* =========================================================
   TYPES
========================================================= */

type ReceivableCustomer = {
  customerId: string | number;
  customerName: string;
  balance: number;
};

type CustomerApiItem = {
  id: string | number;
  name?: string;
  phone?: string | null;
};

/* =========================================================
   HELPERS
========================================================= */

function getInitials(
  name: string
): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* =========================================================
   LOAD ALL CUSTOMER PHONES
========================================================= */

/**
 * Receivables API gives us:
 *
 * customerId
 * customerName
 * balance
 *
 * Customer API gives us:
 *
 * id
 * name
 * phone
 *
 * We merge them by customer ID.
 */
async function loadCustomerPhones(): Promise<
  Map<string, string>
> {
  const phoneMap =
    new Map<string, string>();

  try {
    /* ===============================================
       FIRST PAGE
    =============================================== */

    const firstResponse =
      await api.customers.list({
        page: 1,
        pageSize:
          CUSTOMER_PAGE_SIZE,
      });

    const firstItems =
      (firstResponse.items ??
        []) as CustomerApiItem[];

    /* ===============================================
       MAP FIRST PAGE
    =============================================== */

    firstItems.forEach(
      (customer) => {
        phoneMap.set(
          String(customer.id),
          customer.phone ?? ""
        );
      }
    );

    /* ===============================================
       FIND TOTAL PAGES
    =============================================== */

    const total =
      Number(
        firstResponse.total ??
          firstItems.length
      );

    const totalPages =
      Math.ceil(
        total /
          CUSTOMER_PAGE_SIZE
      );

    /* ===============================================
       NO MORE PAGES
    =============================================== */

    if (totalPages <= 1) {
      return phoneMap;
    }

    /* ===============================================
       LOAD REMAINING PAGES
    =============================================== */

    const pageNumbers =
      Array.from(
        {
          length:
            totalPages - 1,
        },
        (_, index) =>
          index + 2
      );

    const responses =
      await Promise.all(
        pageNumbers.map(
          (page) =>
            api.customers.list({
              page,
              pageSize:
                CUSTOMER_PAGE_SIZE,
            })
        )
      );

    /* ===============================================
       MERGE PHONES
    =============================================== */

    responses.forEach(
      (response) => {
        const items =
          (response.items ??
            []) as CustomerApiItem[];

        items.forEach(
          (customer) => {
            phoneMap.set(
              String(customer.id),
              customer.phone ?? ""
            );
          }
        );
      }
    );
  } catch (error) {
    console.warn(
      "[DEBTORS] Failed to load customer phones:",
      error
    );
  }

  return phoneMap;
}

/* =========================================================
   MAP DEBTOR
========================================================= */

function mapDebtor(
  customer: ReceivableCustomer,
  phoneMap: Map<string, string>,
  index: number
): Debtor {
  const customerId =
    String(
      customer.customerId
    );

  const balance =
    Number(
      customer.balance ?? 0
    );

  return {
    id: customerId,

    code:
      `CUS-${customerId}`,

    name:
      customer.customerName ??
      "",

    initials:
      getInitials(
        customer.customerName ??
          ""
      ),

    avatarColor:
      AVATAR_COLORS[
        index %
          AVATAR_COLORS.length
      ],

    /*
     * REAL CUSTOMER PHONE
     *
     * Comes from /customers
     */
    phone:
      phoneMap.get(
        customerId
      ) ?? "",

    /*
     * Remaining debt only.
     */
    amount:
      Math.max(
        0,
        balance
      ),

    dueDate:
      new Date().toLocaleDateString(),
  };
}

/* =========================================================
   UNIQUE
========================================================= */

function uniqueDebtors(
  debtors: Debtor[]
): Debtor[] {
  const seen =
    new Set<string>();

  return debtors.filter(
    (debtor) => {
      if (
        seen.has(
          debtor.id
        )
      ) {
        return false;
      }

      seen.add(
        debtor.id
      );

      return true;
    }
  );
}

/* =========================================================
   ONLY REAL DEBTORS
========================================================= */

function filterRealDebtors(
  debtors: Debtor[]
): Debtor[] {
  return debtors.filter(
    (debtor) =>
      Number(
        debtor.amount ?? 0
      ) > 0
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useDebtors() {
  const [
    allDebtors,
    setAllDebtors,
  ] = useState<Debtor[]>([]);

  const [
    totalDebt,
    setTotalDebt,
  ] = useState(0);

  const [
    debtorCount,
    setDebtorCount,
  ] = useState(0);

  const [
    displayedPage,
    setDisplayedPage,
  ] = useState(1);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isFetchingMore,
    setIsFetchingMore,
  ] = useState(false);

  const [
    stale,
    setStale,
  ] = useState(false);

  /* =======================================================
     LOAD PAGE
  ======================================================= */

  const loadPage =
    useCallback(
      async (
        page: number,
        append = false
      ) => {
        if (append) {
          setIsFetchingMore(true);
        } else {
          setIsLoading(true);

          /*
           * Remove old debtor data.
           */
          setAllDebtors([]);
        }

        try {
          /* ===============================================
             LOAD RECEIVABLES + CUSTOMER PHONES
          =============================================== */

          const [
            receivables,
            phoneMap,
          ] =
            await Promise.all([
              api.reports.receivables(),

              loadCustomerPhones(),
            ]);

          /* ===============================================
             RECEIVABLE CUSTOMERS
          =============================================== */

          const receivableCustomers =
            (receivables.customers ??
              []) as ReceivableCustomer[];

          /* ===============================================
             MAP DEBTORS
          =============================================== */

          const mapped =
            receivableCustomers.map(
              (
                customer,
                index
              ) =>
                mapDebtor(
                  customer,
                  phoneMap,
                  index
                )
            );

          /* ===============================================
             REMOVE DUPLICATES
          =============================================== */

          const unique =
            uniqueDebtors(
              mapped
            );

          /* ===============================================
             ONLY CUSTOMERS WITH DEBT
          =============================================== */

          const debtors =
            filterRealDebtors(
              unique
            );

          /* ===============================================
             PAGINATION
          =============================================== */

          const start =
            (page - 1) *
            PAGE_SIZE;

          const end =
            page *
            PAGE_SIZE;

          const pageData =
            debtors.slice(
              start,
              end
            );

          /* ===============================================
             UPDATE LIST
          =============================================== */

          if (page === 1) {
            setAllDebtors(
              pageData
            );
          } else {
            setAllDebtors(
              (previous) => {
                const existingIds =
                  new Set(
                    previous.map(
                      (item) =>
                        item.id
                    )
                  );

                const newItems =
                  pageData.filter(
                    (item) =>
                      !existingIds.has(
                        item.id
                      )
                  );

                return [
                  ...previous,
                  ...newItems,
                ];
              }
            );
          }

          /* ===============================================
             TOTAL DEBT
          =============================================== */

          const calculatedTotal =
            debtors.reduce(
              (
                total,
                debtor
              ) =>
                total +
                Number(
                  debtor.amount ??
                    0
                ),
              0
            );

          setTotalDebt(
            calculatedTotal
          );

          /* ===============================================
             DEBTOR COUNT
          =============================================== */

          setDebtorCount(
            debtors.length
          );

          setDisplayedPage(
            page
          );

          setStale(false);

          /* ===============================================
             SAVE CACHE
          =============================================== */

          if (page === 1) {
            await cacheSet(
              CACHE_KEY,
              debtors,
              STALE_TTL
            ).catch(
              () => {}
            );
          }

          /* ===============================================
             DEBUG
          =============================================== */

          if (__DEV__) {
            console.log(
              "[DEBTORS] Loaded:"
            );

            console.log(
              debtors.map(
                (debtor) => ({
                  id: debtor.id,
                  name: debtor.name,
                  phone: debtor.phone,
                  debt: debtor.amount,
                })
              )
            );

            console.log(
              "[DEBTORS] Total debt:",
              calculatedTotal
            );
          }
        } catch (error) {
          console.error(
            "[DEBTORS] Failed:",
            error
          );

          if (!append) {
            setAllDebtors([]);
            setTotalDebt(0);
            setDebtorCount(0);
          }
        } finally {
          setIsLoading(false);
          setIsFetchingMore(false);
        }
      },
      []
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    const initialize =
      async () => {
        /* ===============================================
           CACHE
        =============================================== */

        const [
          cached,
        ] =
          await cacheGetStale<
            Debtor[]
          >(
            CACHE_KEY
          );

        if (
          cached &&
          !cancelled
        ) {
          const unique =
            uniqueDebtors(
              cached
            );

          const debtors =
            filterRealDebtors(
              unique
            );

          setAllDebtors(
            debtors.slice(
              0,
              PAGE_SIZE
            )
          );

          const cachedTotal =
            debtors.reduce(
              (
                total,
                debtor
              ) =>
                total +
                Number(
                  debtor.amount ??
                    0
                ),
              0
            );

          setTotalDebt(
            cachedTotal
          );

          setDebtorCount(
            debtors.length
          );

          setIsLoading(false);
          setStale(true);
        }

        if (cancelled) {
          return;
        }

        if (cached) {
          suppressGlobalLoading();
        }

        try {
          await loadPage(
            1
          );
        } finally {
          if (cached) {
            unsuppressGlobalLoading();
          }
        }
      };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [loadPage]);


  const hasMore =
    allDebtors.length <
    debtorCount;

  const loadMore =
    useCallback(() => {
      if (
        isFetchingMore ||
        !hasMore
      ) {
        return;
      }

      const nextPage =
        displayedPage + 1;

      cacheGet<
        Debtor[]
      >(
        CACHE_KEY
      ).then(
        (cached) => {
          if (
            cached &&
            cached.length >=
              nextPage *
                PAGE_SIZE
          ) {
            const cleanCache =
              filterRealDebtors(
                uniqueDebtors(
                  cached
                )
              );

            const nextPageData =
              cleanCache
                .slice(
                  (nextPage - 1) *
                    PAGE_SIZE,

                  nextPage *
                    PAGE_SIZE
                )
                .filter(
                  (item) =>
                    !allDebtors.some(
                      (existing) =>
                        existing.id ===
                        item.id
                    )
                );

            setAllDebtors(
              (previous) => [
                ...previous,
                ...nextPageData,
              ]
            );

            setDisplayedPage(
              nextPage
            );

            setIsFetchingMore(
              false
            );

            return;
          }

          loadPage(
            nextPage,
            true
          );
        }
      );
    }, [
      isFetchingMore,
      hasMore,
      displayedPage,
      allDebtors,
      loadPage,
    ]);

  return {
    allDebtors,
    totalDebt,
    debtorCount,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore,
    stale,
  };
}
export function getDebtors() {
  return [];
}