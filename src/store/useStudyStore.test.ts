import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStudyStore } from "./useStudyStore";
import { dateKey } from "../lib/time";

describe("manual study records", () => {
  const startedAt = new Date("2025-01-15T09:00:00").getTime();
  const record = {
    subjectId: "portugues",
    topic: "Revisão",
    summary: "Resumo manual",
    questions: 10,
    correct: 8,
    startedAt,
    endedAt: startedAt + 1800000,
    duration: 1800,
    date: dateKey(new Date(startedAt)),
  };
  beforeEach(() => {
    useStudyStore.setState({ sessions: [], active: null });
  });
  it("adds a dated record without replacing an ongoing timer", () => {
    useStudyStore.getState().start("portugues", "Em andamento");
    const active = useStudyStore.getState().active;
    expect(useStudyStore.getState().addManualSession(record)).toBe(true);
    expect(useStudyStore.getState().sessions[0]).toMatchObject(record);
    expect(useStudyStore.getState().active).toEqual(active);
  });
  it("rejects invalid scores, dates and future records without adding sessions", () => {
    const add = useStudyStore.getState().addManualSession;
    expect(add({ ...record, correct: 11 })).toBe(false);
    expect(add({ ...record, date: "2025-01-16" })).toBe(false);
    expect(add({ ...record, endedAt: Date.now() + 3600000 })).toBe(false);
    expect(add({ ...record, summary: " " })).toBe(false);
    expect(useStudyStore.getState().sessions).toEqual([]);
  });
});
describe("study session lifecycle", () => {
  it("supports a general study topic and never replaces an ongoing session with another start", () => {
    useStudyStore.getState().start("informatica", "Estudo geral");
    const original = useStudyStore.getState().active;
    useStudyStore.getState().start("portugues", "Outro assunto");
    expect(useStudyStore.getState().active).toEqual(original);
    expect(original?.topic).toBe("Estudo geral");
  });
  beforeEach(() => {
    useStudyStore.setState({ active: null, sessions: [] });
    vi.useRealTimers();
  });
  it("records elapsed study excluding pauses and rejects duplicate submission", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-08T10:00:00Z"));
    useStudyStore.getState().start("portugues", "Sintaxe");
    vi.advanceTimersByTime(60000);
    useStudyStore.getState().togglePause();
    vi.advanceTimersByTime(300000);
    useStudyStore.getState().togglePause();
    vi.advanceTimersByTime(120000);
    useStudyStore.getState().finish("Revisei orações coordenadas.", 10, 8);
    useStudyStore.getState().finish("Envio repetido.", 10, 8);
    expect(useStudyStore.getState().sessions).toHaveLength(1);
    expect(useStudyStore.getState().sessions[0].duration).toBe(180);
    expect(useStudyStore.getState().sessions[0].validIntervals).toHaveLength(2);
    expect(
      useStudyStore
        .getState()
        .sessions[0].validIntervals?.reduce(
          (sum, interval) => sum + interval.end - interval.start,
          0,
        ),
    ).toBe(180000);
    expect(useStudyStore.getState().active).toBeNull();
  });
  it("requires a summary and coherent question counts", () => {
    useStudyStore.getState().start("portugues", "Sintaxe");
    useStudyStore.getState().finish(" ", 0, 0);
    expect(useStudyStore.getState().sessions).toHaveLength(0);
    useStudyStore.getState().finish("Resumo", 5, 6);
    expect(useStudyStore.getState().sessions).toHaveLength(0);
    useStudyStore.getState().finish("Resumo", 0, 0);
    expect(useStudyStore.getState().sessions).toHaveLength(1);
  });
});

describe("mock exam records", () => {
  beforeEach(() => {
    useStudyStore.setState({ mockExams: [] });
  });

  it("updates a result without changing its completion date and removes it", () => {
    useStudyStore.getState().addMockExam({
      title: "Simulado inicial",
      total: 20,
      correct: 12,
    });
    const exam = useStudyStore.getState().mockExams[0];
    expect(
      useStudyStore.getState().updateMockExam(exam.id, {
        title: "Simulado revisado",
        total: 25,
        correct: 18,
      }),
    ).toBe(true);
    expect(useStudyStore.getState().mockExams[0]).toMatchObject({
      id: exam.id,
      completedAt: exam.completedAt,
      title: "Simulado revisado",
      total: 25,
      correct: 18,
    });
    expect(
      useStudyStore.getState().updateMockExam(exam.id, {
        title: "Invalido",
        total: 10,
        correct: 11,
      }),
    ).toBe(false);
    useStudyStore.getState().removeMockExam(exam.id);
    expect(useStudyStore.getState().mockExams).toEqual([]);
  });
});
