import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStudyStore } from "./useStudyStore";
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
