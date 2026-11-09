import { useSyncExternalStore } from "react";
import { pageFromHash } from "../lib/appRoutes";
function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
export function useAppRoute() {
  return useSyncExternalStore(
    subscribe,
    () => pageFromHash(window.location.hash),
    () => "home" as const,
  );
}
