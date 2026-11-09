import { describe, it, expect } from "vitest";
import {
  defaultRewardRules,
  intervalSeconds,
  mergeIntervals,
  petLevel,
  sessionIntervals,
  timeReward,
  validRewardRules,
} from "./rewardService";
describe("valid study reward arithmetic", () => {
  it("pays a single cumulative ladder, not overlapping milestones", () => {
    expect([10, 25, 50, 60].map((minutes) => timeReward(minutes * 60))).toEqual(
      [10, 30, 65, 80],
    );
    expect(
      timeReward(24 * 60) + timeReward(25 * 60) - timeReward(24 * 60),
    ).toBe(30);
    expect(timeReward(120 * 60)).toBe(160);
  });
  it("deduplicates overlapping intervals without rounding each session up", () => {
    const merged = mergeIntervals([
      { start: 0, end: 600000 },
      { start: 300000, end: 900000 },
      { start: 900000, end: 900500 },
    ]);
    expect(merged).toEqual([{ start: 0, end: 900500 }]);
    expect(intervalSeconds(merged)).toBe(900);
  });
  it("caps records at their real duration/end and excludes pauses", () => {
    const now = 500000;
    const session = {
      id: "x",
      subjectId: "x",
      topic: "x",
      startedAt: 1000,
      duration: 120,
      endedAt: 200000,
      questions: 0,
      correct: 0,
      summary: "Real",
      date: "2026-11-08",
      validIntervals: [
        { start: 1000, end: 61000 },
        { start: 100000, end: 300000 },
      ],
    };
    expect(sessionIntervals(session, now)).toEqual([
      { start: 1000, end: 61000 },
      { start: 100000, end: 160000 },
    ]);
  });
  it("grows levels only through XP and rejects non-monotone reward configurations", () => {
    expect(petLevel(0)).toEqual({ level: 1, progress: 0, required: 100 });
    expect(petLevel(100)).toEqual({ level: 2, progress: 0, required: 200 });
    expect(validRewardRules({ ...defaultRewardRules, minutes25: 1 })).toBe(
      false,
    );
  });
});
