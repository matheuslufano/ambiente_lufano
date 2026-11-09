import type { StudySession, StudyCycleItem } from "../types";
import { dateKey } from "./time";
export interface SessionFilters {
  subjectId?: string;
  topic?: string;
  from?: string;
  to?: string;
}
/** Filtros inclusivos por data local, compartilhados entre histórico e gráficos. */
export function filterSessions(
  sessions: StudySession[],
  filters: SessionFilters,
) {
  return sessions.filter(
    (s) =>
      (!filters.subjectId || s.subjectId === filters.subjectId) &&
      (!filters.topic ||
        s.topic
          .toLocaleLowerCase()
          .includes(filters.topic.toLocaleLowerCase())) &&
      (!filters.from || s.date >= filters.from) &&
      (!filters.to || s.date <= filters.to),
  );
}
export function periodBounds(cursor: Date, period: "week" | "month") {
  const from = new Date(
    cursor.getFullYear(),
    cursor.getMonth(),
    period === "month" ? 1 : cursor.getDate(),
  );
  if (period === "week")
    from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
  const to = new Date(from);
  if (period === "week") to.setDate(to.getDate() + 6);
  else to.setMonth(to.getMonth() + 1, 0);
  return { from: dateKey(from), to: dateKey(to) };
}
/** Distribui tempo real entre etapas repetidas da mesma matéria sem contá-lo duas vezes. */
export function cycleProgress(
  items: StudyCycleItem[],
  sessions: StudySession[],
  since: number,
) {
  const totals = new Map<string, number>(),
    targets = new Map<string, number>();
  for (const item of items)
    targets.set(
      item.subjectId,
      (targets.get(item.subjectId) || 0) + item.minutes * 60,
    );
  for (const s of sessions.filter((s) => s.startedAt >= since))
    totals.set(s.subjectId, (totals.get(s.subjectId) || 0) + s.duration);
  const rounds = targets.size
    ? Math.min(
        ...[...targets].map(([id, target]) =>
          Math.floor((totals.get(id) || 0) / target),
        ),
      )
    : 0;
  const remaining = new Map(
    [...totals].map(([id, total]) => [
      id,
      total - rounds * (targets.get(id) || 0),
    ]),
  );
  return {
    rounds,
    rows: items.map((item) => {
      const seconds = Math.min(
        item.minutes * 60,
        remaining.get(item.subjectId) || 0,
      );
      remaining.set(
        item.subjectId,
        (remaining.get(item.subjectId) || 0) - seconds,
      );
      return { ...item, seconds };
    }),
  };
}

/** Valida metas tanto no formulário quanto na restauração de backup. */
export function validStudyPlans(
  value: unknown,
  subjectIds: string[],
): value is import("../types").StudyPlan[] {
  if (!Array.isArray(value)) return false;
  const validDate = (value: unknown): value is string =>
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    dateKey(new Date(value + "T12:00:00")) === value;
  return (
    value.every(
      (p) =>
        p &&
        typeof p.id === "string" &&
        p.id.trim() &&
        subjectIds.includes(p.subjectId) &&
        Number.isSafeInteger(p.minutes) &&
        p.minutes > 0 &&
        p.minutes <= 44640 &&
        validDate(p.from) &&
        validDate(p.to) &&
        p.from <= p.to,
    ) && new Set(value.map((p) => p.id)).size === value.length
  );
}
