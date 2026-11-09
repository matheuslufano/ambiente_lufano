import { describe, it, expect } from "vitest";
import { elapsedSeconds, formatDuration, remainingSeconds } from "./time";
describe("timer wall-clock persistence", () => {
  it("discounts pauses and survives reload snapshots", () => {
    const snapshot = JSON.parse(
      JSON.stringify({
        subjectId: "x",
        topic: "x",
        startedAt: 1000,
        accumulated: 5000,
        runningSince: 10000,
      }),
    );
    expect(elapsedSeconds(snapshot, 15000)).toBe(10);
    expect(elapsedSeconds({ ...snapshot, runningSince: null }, 999999)).toBe(5);
  });
  it("handles background delay without interval drift", () => {
    expect(remainingSeconds(61000, 60, 46000)).toBe(15);
    expect(remainingSeconds(61000, 60, 90000)).toBe(0);
  });
  it("formats multi-hour sessions", () =>
    expect(formatDuration(7384)).toBe("02:03:04"));
});
