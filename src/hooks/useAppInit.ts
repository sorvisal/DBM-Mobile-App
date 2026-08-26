import { useEffect } from "react";
import { initCache, restoreAccessToken } from "@/services";

export function useAppInit() {
  useEffect(() => {
    async function initialize() {
      await restoreAccessToken();
      await initCache();
    }

    initialize().catch(console.error);
  }, []);
}