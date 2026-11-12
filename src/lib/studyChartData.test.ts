import { describe, expect, it } from "vitest";
import type { StudySession } from "../types";
import { buildStudyChartData } from "./studyChartData";

const subjects = [
  { id: "math", name: "Matemática", color: "#718b65" },
  { id: "law", name: "Direito", color: "#718b65" },
];

function session(id: string, subjectId: string, startedAt: Date): StudySession {
  return {
    id,
    subjectId,
    topic: "Revisão",
    startedAt: startedAt.getTime(),
    endedAt: startedAt.getTime() + 1800_000,
    duration: 1800,
    questions: 10,
    correct: 7,
    summary: "Revisão",
    date: startedAt.toISOString().slice(0, 10),
  };
}

describe("study chart periods", () => {
  const now = new Date(2026, 10, 11, 12);
  const sessions = [
    session("today-math", "math", new Date(2026, 10, 11, 9)),
    session("week-law", "law", new Date(2026, 10, 7, 14)),
    session("last-month", "math", new Date(2026, 9, 20, 10)),
    session("last-year", "law", new Date(2025, 5, 20, 10)),
  ];

  it("groups one day into hourly buckets", () => {
    const result = buildStudyChartData(sessions, subjects, {
      period: "day",
      year: 2026,
      metric: "time",
      grouping: "subjects",
      now,
    });
    expect(result.rows).toHaveLength(24);
    expect(result.rows[9].math).toBe(30);
    expect(result.rows[9].questionStatsBySeries.math).toEqual({
      attempted: 10,
      correct: 7,
      incorrect: 3,
    });
    expect(result.total).toBe(30);
  });

  it("groups weeks into seven days and months into calendar days", () => {
    const week = buildStudyChartData(sessions, subjects, {
      period: "week",
      year: 2026,
      metric: "questions",
      grouping: "subjects",
      now,
    });
    const month = buildStudyChartData(sessions, subjects, {
      period: "month",
      year: 2026,
      metric: "questions",
      grouping: "subjects",
      now,
    });
    expect(week.rows).toHaveLength(7);
    expect(week.total).toBe(20);
    expect(month.rows).toHaveLength(30);
    expect(month.total).toBe(20);
  });

  it("groups a selected year by month and total history by year", () => {
    const year = buildStudyChartData(sessions, subjects, {
      period: "year",
      year: 2025,
      metric: "questions",
      grouping: "subjects",
      now,
    });
    const total = buildStudyChartData(sessions, subjects, {
      period: "total",
      year: 2026,
      metric: "questions",
      grouping: "subjects",
      now,
    });
    expect(year.rows).toHaveLength(12);
    expect(year.total).toBe(10);
    expect(total.rows.map((row) => row.name)).toEqual(["2025", "2026"]);
    expect(total.total).toBe(40);
  });
});
