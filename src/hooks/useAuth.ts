import { useEffect, useState, useCallback } from "react";
import { api, onUnauthorized, restoreAccessToken, cacheGet, cacheSet, cacheClearKeySync, CacheTTL } from "@/services";
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

    async function loadUser() {
      try {
        // Ensure the in-memory access token is populated before any API call.
        // This prevents a race where /auth/me fires before restoreAccessToken()
        // has finished on app reload.
        await restoreAccessToken();

        if (cancelled) return;

        // Try cache first for instant UI
        const cached = await cacheGet<User>(USER_CACHE_KEY);
        if (cached && !cancelled) {
          setUser(cached);
          setIsLoading(false);
        }

        // Validate with API
        if (__DEV__) console.log('[AUTH] GET /auth/me');
        const u = await api.auth.me();
        if (!cancelled) {
          setUser(u);
          cacheSet(USER_CACHE_KEY, u, CacheTTL.LONG).catch(() => {});
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadUser();

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
