import { useState, useCallback, useEffect, useRef } from "react";
import { api, cacheGet, cacheSet, cacheClearKeySync, CacheTTL, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import { resolveMediaUrl } from "@/services/http";
import { CustomerStatus } from "../types/customer.types";

interface FeatureCustomer {
  id: string;
  code: string;
  name: string;
  initials: string;
  avatarColor: string;
  phone: string;
  location: string;
  status: CustomerStatus;
  totalOrders: number;
  totalSpent: number;
  memberSince: string;
  note: string;
  orders: { id: string; code: string; date: string; status: string; total: number; itemCount: number }[];
  imageUrl?: string | null;
  _photoPath?: string | null;
}

const AVATAR_COLORS = ["#2563EB", "#EA580C", "#16A34A", "#9333EA", "#CA8A04", "#DC2626"];
const PAGE_SIZE = 20;
const STALE_TTL = CacheTTL.LONG;

function cacheKeyForPage(p: number) {
  return `customers:list:p${p}`;
}

function getInitials(name: string) {
  return name.trim().split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function mapCustomer(
  c: { 
    id: string; 
    name: string; 
    phone?: string; 
    address?: string; 
    status: string; 
    balance: number; 
    totalOrders?: number; 
    createdAt: string; 
    photoPath?: string | null;
    description?: string;
  }, 
  index: number
): FeatureCustomer {
  return {
    id: c.id,
    code: `CUS-${c.id}`,
    name: c.name,
    initials: getInitials(c.name),
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    phone: c.phone ?? "",
    location: c.address ?? "",
    status: c.status === "inactive" ? CustomerStatus.Inactive : CustomerStatus.Active,
    totalOrders: c.totalOrders ?? 0,
    totalSpent: c.balance ?? 0,
    memberSince: formatDate(c.createdAt),
    note: c.description?.trim() ? String(c.description) : "-",
    orders: [],
    imageUrl: resolveMediaUrl(c.photoPath),
    _photoPath: c.photoPath ?? null,
  };
}

type NewCustomerListener = (customer: FeatureCustomer) => void;
const newCustomerListeners = new Set<NewCustomerListener>();

export function useCustomerList() {
  const [allCustomers, setAllCustomers] = useState<FeatureCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [stale, setStale] = useState(false);
  const customersRef = useRef(allCustomers);
  customersRef.current = allCustomers;

  const loadPage = useCallback(async (p: number, append = false) => {
    if (append) setIsFetchingMore(true);
    else { setIsLoading(true); setAllCustomers([]); }
    try {
      const res = await api.customers.list({ page: p, pageSize: PAGE_SIZE });
      const mapped = (res.items ?? [])
        .map((c, i) => mapCustomer(c, (p - 1) * PAGE_SIZE + i))
        .filter((c: FeatureCustomer, idx: number, arr: FeatureCustomer[]) => arr.findIndex((x) => x.id === c.id) === idx);
      cacheSet(cacheKeyForPage(p), mapped, STALE_TTL).catch(() => {});
      if (p === 1) {
        setAllCustomers(mapped);
        setTotal(res.total ?? mapped.length);
      } else {
        const existingIds = new Set(allCustomers.map((c) => c.id));
        setAllCustomers((prev) => [...prev, ...mapped.filter((c) => !existingIds.has(c.id))]);
      }
      setPage(p);
      setStale(false);
    } catch {
      if (!append) setAllCustomers([]);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  const prefetchRemainingPages = useCallback(async (currentTotal: number, fromPage: number) => {
    const totalPages = Math.ceil(currentTotal / PAGE_SIZE);
    const promises: Promise<void>[] = [];
    for (let p = fromPage + 1; p <= totalPages; p++) {
      promises.push(
        cacheGet<FeatureCustomer[]>(cacheKeyForPage(p)).then((cached) => {
          if (cached) return;
          api.customers.list({ page: p, pageSize: PAGE_SIZE }).then((res) => {
            const mapped = (res.items ?? []).map((c, i) => mapCustomer(c, (p - 1) * PAGE_SIZE + i));
            cacheSet(cacheKeyForPage(p), mapped, STALE_TTL).catch(() => {});
          }).catch(() => {});
        })
      );
    }
    await Promise.allSettled(promises);
  }, []);

  useEffect(() => {
    let cancelled = false;
    cacheClearKeySync(cacheKeyForPage(1));
    for (let p = 2; p <= 10; p++) cacheClearKeySync(cacheKeyForPage(p));

    (async () => {
      const cached = await cacheGet<FeatureCustomer[]>(cacheKeyForPage(1));
      if (cached && !cancelled) {
        const ensured = cached.map((c) => c.imageUrl ? c : { ...c, imageUrl: resolveMediaUrl(c._photoPath) });
        const seen = new Set<string>();
        const unique = ensured.filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
        setAllCustomers(unique);
        setTotal(unique.length);
        setIsLoading(false);
        setStale(true);
      }

      if (!cancelled) {
        if (cached) suppressGlobalLoading();
        try {
          await loadPage(1);
        } catch {
          // error handled in loadPage
        } finally {
          if (cached) unsuppressGlobalLoading();
        }
      }
    })();

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const listener: NewCustomerListener = (newCustomer) => {
      setAllCustomers((prev) => {
        if (prev.some((c) => c.id === newCustomer.id)) return prev;
        return [newCustomer, ...prev];
      });
      setTotal((prev) => prev + 1);
    };
    newCustomerListeners.add(listener);
    return () => { newCustomerListeners.delete(listener); };
  }, []);

  const hasMore = allCustomers.length < total;
  const loadMore = useCallback(() => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    cacheGet<FeatureCustomer[]>(cacheKeyForPage(nextPage)).then((cached) => {
      if (cached) {
        const ensured = cached.map((c) => c.imageUrl ? c : { ...c, imageUrl: resolveMediaUrl(c._photoPath) });
        const existingIds = new Set(allCustomers.map((c) => c.id));
        setAllCustomers((prev) => [...prev, ...ensured.filter((c) => !existingIds.has(c.id))]);
        setPage(nextPage);
        setIsFetchingMore(false);
        prefetchRemainingPages(total, nextPage);
        return;
      }
      loadPage(nextPage, true);
    });
  }, [isFetchingMore, hasMore, page, total, loadPage, prefetchRemainingPages]);

  const stats = {
    totalCustomers: total,
    activeCustomers: allCustomers.filter((c) => c.status === CustomerStatus.Active).length,
    totalOrders: allCustomers.reduce((sum, c) => sum + c.totalOrders, 0),
    totalSpent: allCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
  };

  return {
    allCustomers,
    stats,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore,
    stale,
    refresh: () => loadPage(1),
  };
}

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
    status: values.status ?? "active",
    description: values.description?.trim() ? values.description : undefined,
  });
  cacheClearKeySync(cacheKeyForPage(1));
}

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
  await api.customers.update(id, patch);
  cacheClearKeySync(cacheKeyForPage(1));
}

export async function deleteCustomer(id: string) {
  await api.customers.remove(id);
  cacheClearKeySync(cacheKeyForPage(1));
}