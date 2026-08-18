import { useState, useCallback, useEffect } from "react";
import { api } from "@/services";
import type { Paginated } from "@/types/api";

export interface UsePaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  refresh: () => void;
  fetchNextPage: () => void;
  loadPage: (page: number) => void;
}

export function usePaginated<T>(
  fetcher: (params: { page: number; pageSize: number }) => Promise<Paginated<T>>,
  initialPageSize = 20,
): UsePaginatedResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (p: number) => {
      if (p === 1) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsFetchingMore(true);
      }
      try {
        const result = await fetcher({ page: p, pageSize: initialPageSize });
        if (p === 1) {
          setItems(result.items);
        } else {
          setItems((prev) => [...prev, ...result.items]);
        }
        setTotal(result.total);
        setPage(p);
        setError(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [fetcher, initialPageSize],
  );

  const refresh = useCallback(() => {
    loadPage(1);
  }, [loadPage]);

  const fetchNextPage = useCallback(() => {
    const totalPages = Math.ceil(total / initialPageSize);
    if (page < totalPages) {
      loadPage(page + 1);
    }
  }, [page, total, initialPageSize, loadPage]);

  const hasMore = page * initialPageSize < total;

  useEffect(() => {
    loadPage(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items,
    page,
    pageSize: initialPageSize,
    total,
    totalPages: Math.ceil(total / initialPageSize),
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    refresh,
    fetchNextPage,
    loadPage,
  };
}
