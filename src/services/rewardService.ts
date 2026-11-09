import type { StudySession } from "../types";
import type { RewardRules, StudyInterval } from "../types/pet";
export const defaultRewardRules: RewardRules = {
  minutes10: 10,
  minutes25: 30,
  minutes50: 65,
  minutes60: 80,
  questions10: 10,
  mockExam: 50,
  dailyGoal: 40,
};
/** A non-additive hourly ladder: 10/25/50/60 minutes pay 10/30/65/80, never all four. */
export function timeReward(seconds: number, rules = defaultRewardRules) {
  const minutes = Math.floor(Math.max(0, seconds) / 60),
    rest = minutes % 60;
  return (
    Math.floor(minutes / 60) * rules.minutes60 +
    (rest >= 50
      ? rules.minutes50
      : rest >= 25
        ? Math.max(rules.minutes25, Math.floor(rest / 10) * rules.minutes10)
        : Math.floor(rest / 10) * rules.minutes10)
  );
}
export function validRewardRules(r: RewardRules) {
  return (
    Object.values(r).every(
      (value) => Number.isSafeInteger(value) && value >= 0 && value <= 10000,
    ) &&
    r.minutes25 >= 2 * r.minutes10 &&
    r.minutes50 >= Math.max(4 * r.minutes10, r.minutes25) &&
    r.minutes60 >= r.minutes50
  );
}
export function mergeIntervals(intervals: StudyInterval[]): StudyInterval[] {
  const sorted = intervals
    .filter(
      (i) =>
        Number.isFinite(i.start) && Number.isFinite(i.end) && i.end > i.start,
    )
    .map((i) => ({ ...i }))
    .sort((a, b) => a.start - b.start);
  const merged: StudyInterval[] = [];
  for (const interval of sorted) {
    const previous = merged.at(-1);
    if (previous && interval.start <= previous.end)
      previous.end = Math.max(previous.end, interval.end);
    else merged.push(interval);
  }
  return merged;
}
export function intervalSeconds(intervals: StudyInterval[]) {
  return Math.floor(
    mergeIntervals(intervals).reduce((sum, i) => sum + i.end - i.start, 0) /
      1000,
  );
}
/** Legacy records cannot reconstruct pauses; cap inferred intervals at their stored net duration. */
export function sessionIntervals(
  session: StudySession,
  now = Date.now(),
): StudyInterval[] {
  const limit = Math.max(0, Math.floor(session.duration)) * 1000;
  let remaining = limit;
  return mergeIntervals(
    session.validIntervals?.length
      ? session.validIntervals
      : [{ start: session.startedAt, end: session.startedAt + limit }],
  ).flatMap((i) => {
    const start = Math.max(session.startedAt, i.start),
      end = Math.min(i.end, session.endedAt ?? now, now, start + remaining);
    if (end <= start || remaining <= 0) return [];
    remaining -= end - start;
    return [{ start, end }];
  });
}
export function secondsByDay(
  intervals: StudyInterval[],
): Record<string, number> {
  const days: Record<string, number> = {};
  for (const interval of mergeIntervals(intervals)) {
    let start = interval.start;
    while (start < interval.end) {
      const date = new Date(start),
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const midnight = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1,
      ).getTime();
      const end = Math.min(midnight, interval.end);
      days[key] = (days[key] || 0) + (end - start) / 1000;
      start = end;
    }
  }
  return days;
}
export function petLevel(xp: number) {
  let level = 1,
    used = 0;
  while (xp - used >= level * 100 && level < 1000) {
    used += level * 100;
    level++;
  }
  return { level, progress: xp - used, required: level * 100 };
}
