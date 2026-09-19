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

/*
 * Customer phone scan is the heaviest part of this feature (it paginates
 * through ALL /customers pages). Cache the resulting map in memory and bound
 * the number of simultaneous page requests so a large customer list does not
 * fire dozens of parallel requests that slow the API down.
 */
const PHONE_CACHE_TTL = 2 * 60_000;
const PHONE_PAGE_CONCURRENCY = 4;

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

type PhoneMap = Map<string, string>;

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

/**
 * Run `fn` over `items` with at most `limit` concurrent promises.
 * Prevents a huge customer list from saturating the API with N parallel
 * /customers requests at once.
 */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
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

/* Single-flight + short TTL memory cache so switching between Income
   sub-screens does not re-scan every /customers page. */
let phoneMapInFlight: Promise<PhoneMap> | null = null;
let phoneMapMemory: PhoneMap | null = null;
let phoneMapMemoryTs = 0;

async function loadCustomerPhones(): Promise<PhoneMap> {
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
       LOAD REMAINING PAGES (bounded concurrency)
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
      await mapWithConcurrency(
        pageNumbers,
        PHONE_PAGE_CONCURRENCY,
        (page) =>
          api.customers.list({
            page,
            pageSize:
              CUSTOMER_PAGE_SIZE,
          })
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

/** Deduplicated phone map loader – shares one scan across simultaneous callers. */
function resolvePhoneMap(): Promise<PhoneMap> {
  if (phoneMapInFlight) {
    return phoneMapInFlight;
  }

  if (
    phoneMapMemory &&
    Date.now() - phoneMapMemoryTs <
      PHONE_CACHE_TTL
  ) {
    return Promise.resolve(phoneMapMemory);
  }

  phoneMapInFlight = loadCustomerPhones()
    .then((map) => {
      phoneMapMemory = map;
      phoneMapMemoryTs = Date.now();
      return map;
    })
    .finally(() => {
      phoneMapInFlight = null;
    });

  return phoneMapInFlight;
}

/* =========================================================
   MAP DEBTOR
========================================================= */

function mapDebtor(
  customer: ReceivableCustomer,
  phoneMap: PhoneMap,
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
   FETCH DEBTORS (single-flight)
========================================================= */

/*
 * /reports/receivables is slow. Make sure only ONE full fetch runs at a time:
 * - Multiple mounted useDebtors instances (overview/monthly/yearly/debtors
 *   screens) all share this single in-flight request.
 * - The HTTP layer additionally dedupes the individual GET calls.
 */

let debtorsInFlight: Promise<Debtor[]> | null = null;

async function fetchDebtors(): Promise<Debtor[]> {
  if (debtorsInFlight) {
    return debtorsInFlight;
  }

  debtorsInFlight = (async () => {
    const [
      receivables,
      phoneMap,
    ] =
      await Promise.all([
        api.reports.receivables(),

        resolvePhoneMap(),
      ]);

    const receivableCustomers =
      (receivables.customers ??
        []) as ReceivableCustomer[];

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

    const debtors =
      filterRealDebtors(
        uniqueDebtors(
          mapped
        )
      );

    await cacheSet(
      CACHE_KEY,
      debtors,
      STALE_TTL
    ).catch(
      () => {}
    );

    return debtors;
  })().finally(() => {
    debtorsInFlight = null;
  });

  return debtorsInFlight;
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
     HYDRATE
  ======================================================= */

  /**
   * Applies a full debtor list for the requested page. Keeps whatever is
   * currently on screen when `append` is true; never blanks existing data
   * (so cached content stays visible while a refresh runs / fails).
   */
  const hydrate =
    useCallback(
      (
        debtors: Debtor[],
        page: number,
        append: boolean
      ) => {
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

        if (append) {
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
        } else {
          setAllDebtors(
            pageData
          );
        }

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

        setDebtorCount(
          debtors.length
        );

        setDisplayedPage(
          page
        );

        setStale(false);
      },
      []
    );

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
        }

        try {
          /* ===============================================
             USE FRESH CACHE FIRST
          =============================================== */

          const [
            cached,
            cachedIsStale,
          ] =
            await cacheGetStale<
              Debtor[]
            >(
              CACHE_KEY
            );

          if (
            cached &&
            cached.length > 0 &&
            !cachedIsStale
          ) {
            hydrate(
              cached,
              page,
              append
            );
            return;
          }

          /* ===============================================
             NETWORK (single-flight)
          =============================================== */

          const debtors =
            await fetchDebtors();

          hydrate(
            debtors,
            page,
            append
          );
        } catch (error) {
          /*
           * Keep whatever is already rendered (fresh cache, stale cache,
           * or the previous page) instead of blanking the whole screen
           * when /reports/receivables is slow.
           */
          console.error(
            "[DEBTORS] Failed:",
            error
          );
          setStale(true);
        } finally {
          setIsLoading(false);
          setIsFetchingMore(false);
        }
      },
      [hydrate]
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
           CACHE (show immediately if available)
        =============================================== */

        const [
          cached,
          cachedIsStale,
        ] =
          await cacheGetStale<
            Debtor[]
          >(
            CACHE_KEY
          );

        if (
          cached &&
          cached.length > 0 &&
          !cancelled
        ) {
          hydrate(
            cached,
            1,
            false
          );

          setIsLoading(false);
          setStale(cachedIsStale);
        }

        if (cancelled) {
          return;
        }

        /*
         * Fresh cache: there is nothing to revalidate, so skip the network
         * entirely. /reports/receivables is only requested when it is
         * actually needed (no cache, or stale cache).
         */
        if (
          cached &&
          cached.length > 0 &&
          !cachedIsStale
        ) {
          return;
        }

        /* ===============================================
           STALE-WHILE-REVALIDATE
        =============================================== */

        let suppressed =
          false;

        if (
          cached &&
          cached.length > 0
        ) {
          suppressGlobalLoading();
          suppressed = true;
        }

        try {
          const debtors =
            await fetchDebtors();

          if (!cancelled) {
            hydrate(
              debtors,
              1,
              false
            );
          }
        } catch (error) {
          if (!cancelled) {
            console.error(
              "[DEBTORS] Failed:",
              error
            );
            setStale(true);
          }
        } finally {
          if (suppressed) {
            unsuppressGlobalLoading();
          }

          if (!cancelled) {
            setIsLoading(false);
          }
        }
      };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [hydrate]);


  const hasMore =
    allDebtors.length <
    debtorCount;

  /* =======================================================
     REFRESH (background)
  ======================================================= */

  /**
   * Force a fresh fetch of the latest debtor list (bypassing the cache) and
   * rehydrate every page the user has already loaded so the visible list stays
   * consistent. Keeps current data on screen while the request runs and never
   * blanks existing data on failure.
   */
  const refresh =
    useCallback(async () => {
      const page = Math.max(
        1,
        displayedPage
      );

      try {
        setIsLoading(true);

        const debtors =
          await fetchDebtors();

        for (
          let p = 1;
          p <= page;
          p += 1
        ) {
          hydrate(
            debtors,
            p,
            p > 1
          );
        }

        setStale(false);
      } catch (error) {
        console.error(
          "[DEBTORS] Refresh failed:",
          error
        );

        setStale(true);
      } finally {
        setIsLoading(false);
      }
    }, [
      displayedPage,
      hydrate,
    ]);

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
            hydrate(
              cached,
              nextPage,
              true
            );
            setIsFetchingMore(false);
            return;
          }

          loadPage(
            nextPage,
            true
          );
        }
      ).catch(
        () => {
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
      hydrate,
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
    refresh,
  };
}
export function getDebtors() {
  return [];
}