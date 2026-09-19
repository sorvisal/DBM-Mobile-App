import { useEffect, useRef } from "react";

export function useActiveRefresh(
  refresh: () => void | Promise<void>,
  isActive?: boolean
) {
  const wasActiveRef = useRef<boolean | null>(null);

  useEffect(() => {
    const wasActive = wasActiveRef.current;
    const active = Boolean(isActive);

    wasActiveRef.current = active;

    if (active && wasActive === false) {
      Promise.resolve(refresh()).catch(
        (error) => {
          if (__DEV__) {
            console.error(
              "[AUTO REFRESH]",
              error
            );
          }
        }
      );
    }
  }, [isActive, refresh]);
}