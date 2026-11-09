import { describe, it, expect } from "vitest";
import { cycleProgress, filterSessions, periodBounds, validStudyPlans } from "./studyInsights";
import type { StudySession } from "../types";
const session = (
  subjectId: string,
  duration: number,
  date = "2026-11-08",
): StudySession => ({
  id: subjectId,
  subjectId,
  duration,
  date,
  startedAt: 100,
  topic: "Texto",
  summary: "",
  questions: 0,
  correct: 0,
});
describe("study insights", () => {
  it("filtra limites inclusivos e matéria", () =>
    expect(
      filterSessions([session("a", 60), session("b", 20)], {
        subjectId: "a",
        from: "2026-11-08",
        to: "2026-11-08",
      }),
    ).toHaveLength(1));
  it("inicia semana na segunda e respeita ano bissexto", () => {
    expect(periodBounds(new Date(2026, 10, 8), "week")).toEqual({
      from: "2026-11-02",
      to: "2026-11-08",
    });
    expect(periodBounds(new Date(2024, 1, 14), "month").to).toBe("2024-02-29");
  });
  it("não duplica minutos em etapas repetidas e reconhece voltas", () => {
    const items = [
      { id: "1", subjectId: "a", minutes: 10 },
      { id: "2", subjectId: "a", minutes: 10 },
      { id: "3", subjectId: "b", minutes: 10 },
    ];
    const first = cycleProgress(items, [session("a", 900)], 0);
    expect(first.rows.map((r) => r.seconds)).toEqual([600, 300, 0]);
    const next = cycleProgress(
      items,
      [session("a", 1500), session("b", 600)],
      0,
    );
    expect(next.rounds).toBe(1);
    expect(next.rows.map((r) => r.seconds)).toEqual([300, 0, 0]);
    expect(cycleProgress(items, [session("a", 900)], 101).rows[0].seconds).toBe(
      0,
    );
  });
});

it("rejects invalid plan dates, missing subjects and duplicate IDs", () => {
  const plan = {
    id: "1",
    subjectId: "a",
    minutes: 60,
    from: "2026-11-01",
    to: "2026-11-30",
  };
  expect(validStudyPlans([plan], ["a"])).toBe(true);
  expect(validStudyPlans([{ ...plan, from: "2026-02-30" }], ["a"])).toBe(false);
  expect(validStudyPlans([plan], [])).toBe(false);
  expect(validStudyPlans([plan, plan], ["a"])).toBe(false);
});
