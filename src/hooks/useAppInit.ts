import { useEffect, useCallback } from "react";
import { initCache } from "@/services";

export function useAppInit() {
  useEffect(() => {
    initCache().catch(() => {});
  }, []);
}
