/**
 * Global API Loading Manager
 *
 * Tracks in-flight HTTP requests that should show the full-screen overlay.
 * Uses a request counter (not boolean) to handle concurrent requests.
 *
 * Background/SWR requests call suppressGlobalLoading() before firing so the
 * interceptors skip counting them. Multiple suppressions stack correctly.
 */

let count = 0;
let suppressCount = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

/** Called by the Axios request interceptor when a tracked request starts. */
export function startLoading(): void {
  if (suppressCount > 0) return;
  count++;
  emit();
}

/** Called by the Axios response/error interceptor when a tracked request ends. */
export function finishLoading(): void {
  count = Math.max(0, count - 1);
  emit();
}

/** Current number of tracked in-flight requests. */
export function getLoadingCount(): number {
  return count;
}

/** Whether there is at least one tracked in-flight request. */
export function isGlobalLoading(): boolean {
  return count > 0;
}

/** Subscribe to loading-count changes. Returns an unsubscribe function. */
export function subscribeLoading(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/**
 * Suppress global loading tracking for background requests.
 * Calls stack – each suppress must be paired with an unsuppress.
 */
export function suppressGlobalLoading(): void {
  suppressCount++;
}

/** Undo one suppressGlobalLoading() call. Never goes below 0. */
export function unsuppressGlobalLoading(): void {
  suppressCount = Math.max(0, suppressCount - 1);
}

/** Reset all state – useful for logout / testing. */
export function resetLoadingState(): void {
  count = 0;
  suppressCount = 0;
}
