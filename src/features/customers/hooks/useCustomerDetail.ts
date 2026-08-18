import { useCallback, useEffect, useState } from "react";
import { api, cacheGet, cacheSet, cacheClearKeySync, CacheTTL, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import { resolveMediaUrl } from "@/services/http";
import { CustomerStatus } from "../types/customer.types";

const ERROR_MESSAGE = "មិនអាចទាញយកទិន្នន័យបាន";

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
  customerType: string;
  note: string;
  orders: { id: string; code: string; date: string; status: string; total: number; itemCount: number }[];
  imageUrl?: string | null;
  _photoPath?: string | null;
}

const AVATAR_COLORS = ["#2563EB", "#EA580C", "#16A34A", "#9333EA", "#CA8A04", "#DC2626"];

function getInitials(name: string) {
  return name.trim().split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const STALE_TTL = CacheTTL.LONG;

export function useCustomerDetail(customerId: string) {
  const [customer, setCustomer] = useState<FeatureCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    (isRefresh: boolean) => {
      if (!customerId) {
        setCustomer(null);
        setError(null);
        setIsLoading(false);
        setIsRefreshing(false);
        return () => {};
      }
      let cancelled = false;
      setError(null);
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const cacheKey = `customer:${customerId}`;
      cacheClearKeySync(cacheKey);
      cacheGet<FeatureCustomer>(cacheKey).then((cached) => {
        if (cached && !cancelled) {
          setCustomer(cached);
          setIsLoading(false);
        }
      });

      // Suppress global overlay for refresh (pull-to-refresh uses its own UI)
      if (isRefresh) suppressGlobalLoading();

      api.customers
        .get(customerId)
        .then((c) => {
          if (cancelled) return;
          return api.customers.getOrders(customerId).then((orders) => {
            if (cancelled) return;
            const mapped: FeatureCustomer = {
              id: c.id,
              code: `CUS-${c.id}`,
              name: c.name,
              initials: getInitials(c.name),
              avatarColor: AVATAR_COLORS[parseInt(c.id) % AVATAR_COLORS.length] ?? "#2563EB",
              phone: c.phone ?? "",
              location: c.address ?? "",
              status: c.status === "inactive" ? CustomerStatus.Inactive : CustomerStatus.Active,
              totalOrders: c.totalOrders,
              totalSpent: c.balance,
              memberSince: formatDate(c.createdAt),
              customerType: "អតិថិជន",
              note: "-",
              imageUrl: resolveMediaUrl(c.photoPath),
              _photoPath: c.photoPath ?? null,
              orders: orders
                .filter((o, idx, arr) => arr.findIndex((x) => x.id === o.id) === idx)
                .map((o) => ({
                  id: o.id,
                  code: o.code,
                  date: new Date(o.createdAt).toLocaleString(),
                  status: o.status,
                  total: o.totalAmount,
                  itemCount: o.items.length,
                })),
            };
            cacheSet(cacheKey, mapped, STALE_TTL).catch(() => {});
            setCustomer(mapped);
            setError(null);
          });
        })
        .catch(() => {
          if (cancelled) return;
          if (!isRefresh) setCustomer(null);
          setError(ERROR_MESSAGE);
        })
        .finally(() => {
          if (cancelled) return;
          if (isRefresh) {
            unsuppressGlobalLoading();
            setIsRefreshing(false);
          } else {
            setIsLoading(false);
          }
        });

      return () => { cancelled = true; };
    },
    [customerId]
  );

  useEffect(() => load(false), [load]);

  const refresh = useCallback(() => {
    load(true);
  }, [load]);

  return { customer, isLoading, isRefreshing, error, refresh };
}

export function clearCustomerDetailCache(customerId: string): void {
  cacheClearKeySync(`customer:${customerId}`);
}
