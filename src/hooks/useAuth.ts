import { useEffect, useState, useCallback } from "react";
import { api, onUnauthorized, cacheGet, cacheSet, cacheClearKeySync, CacheTTL } from "@/services";
import type { User } from "@/types/api";

const USER_CACHE_KEY = "auth:user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onUnauthorized(() => {
      if (!cancelled) setUser(null);
    });

    // Try cache first for instant UI, then validate with API
    cacheGet<User>(USER_CACHE_KEY).then((cached) => {
      if (cached && !cancelled) {
        setUser(cached);
        setIsLoading(false);
      }
    });

    api.auth
      .me()
      .then((u) => {
        if (!cancelled) {
          setUser(u);
          cacheSet(USER_CACHE_KEY, u, CacheTTL.LONG).catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          cacheGet<User>(USER_CACHE_KEY).then((cached) => {
            // If API fails but we had cached user, keep showing them
            // (they may have gone briefly offline)
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await api.auth.me();
      setUser(u);
      cacheSet(USER_CACHE_KEY, u, CacheTTL.LONG).catch(() => {});
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    setUser(null);
    cacheClearKeySync(USER_CACHE_KEY);
  }, []);

  return { user, isLoading, refreshUser, handleLogout };
}

export function useSetUser() {
  const [user, setUser] = useState<User | null>(null);
  const setUserAndPersist = useCallback(async (u: User | null) => {
    setUser(u);
    if (u) {
      cacheSet(USER_CACHE_KEY, u, CacheTTL.LONG).catch(() => {});
    }
  }, []);
  return { user, setUser: setUserAndPersist };
}
