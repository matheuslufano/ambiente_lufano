import { describe, expect, it } from "vitest";
import {
  defaultLevelGoals,
  getProfileMetrics,
  getUnlockedProfileFrames,
  profileFrameTiers,
} from "./profileFrames";

describe("profile frame milestones", () => {
  it("keeps only the base frame unlocked before reaching goals", () => {
    expect(
      getUnlockedProfileFrames(
        { questions: 99, studyHours: 10, exams: 2 },
        defaultLevelGoals,
      ),
    ).toEqual(["level-1"]);
  });

  it("unlocks the next tier only when every goal is reached", () => {
    expect(
      getUnlockedProfileFrames(
        { questions: 100, studyHours: 10, exams: 2 },
        defaultLevelGoals,
      ),
    ).toEqual(["level-1", "level-30"]);
  });

  it("unlocks higher tiers by meeting every goal multiplier", () => {
    expect(
      getUnlockedProfileFrames(
        { questions: 2000, studyHours: 200, exams: 40 },
        defaultLevelGoals,
      ),
    ).toEqual(profileFrameTiers.map((frame) => frame.id));
    expect(profileFrameTiers.map((frame) => frame.level)).toEqual([
      1, 30, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375,
      400, 425, 450, 475, 500,
    ]);
  });

  it("includes mock exam questions in profile totals and unlock goals", () => {
    const metrics = getProfileMetrics(
      [
        {
          id: "session-1",
          subjectId: "portugues",
          topic: "Revisão",
          startedAt: 1,
          duration: 3600,
          questions: 50,
          correct: 40,
          summary: "Estudo",
          date: "2026-11-11",
        },
      ],
      [
        {
          id: "exam-1",
          title: "Simulado",
          total: 25,
          correct: 20,
          completedAt: 1,
        },
      ],
    );

    expect(metrics).toMatchObject({
      questions: 75,
      correct: 60,
      incorrect: 15,
      studyHours: 1,
      exams: 1,
    });
    expect(
      getUnlockedProfileFrames(metrics, {
        questions: 75,
        studyHours: 1,
        exams: 1,
      }),
    ).toEqual(["level-1", "level-30"]);
  });
});
