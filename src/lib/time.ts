import type { ActiveSession } from "../types";
/** Wall-clock arithmetic survives background throttling and page reloads. */
export function elapsedSeconds(
  session: ActiveSession,
  now = Date.now(),
): number {
  return Math.max(
    0,
    Math.floor(
      (session.accumulated +
        (session.runningSince === null
          ? 0
          : Math.max(0, now - session.runningSince))) /
        1000,
    ),
  );
}
export function formatDuration(seconds: number): string {
  return [
    Math.floor(seconds / 3600),
    Math.floor(seconds / 60) % 60,
    Math.floor(seconds) % 60,
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function remainingSeconds(
  endAt: number | null,
  saved: number,
  now = Date.now(),
) {
  return endAt === null ? saved : Math.max(0, Math.ceil((endAt - now) / 1000));
}
