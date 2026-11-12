import type {
  LevelGoals,
  MockExam,
  ProfileFrame,
  StudySession,
} from "../types";

export const defaultLevelGoals: LevelGoals = {
  questions: 100,
  studyHours: 10,
  exams: 2,
};

export interface ProfileFrameTier {
  id: ProfileFrame;
  name: string;
  level: number;
  multiplier: number;
  imageUrl: string;
}

const summonerBorderLevels = [
  1, 30, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375,
  400, 425, 450, 475, 500,
];

export const profileFrameTiers: ProfileFrameTier[] = summonerBorderLevels.map(
  (level, index) => ({
    id: `level-${level}`,
    name: `Nível ${level}`,
    level,
    multiplier: index,
    imageUrl: `https://wiki.leagueoflegends.com/en-us/images/Level_${level}_Summoner_Icon_Border.png`,
  }),
);

export function getProfileMetrics(sessions: StudySession[], exams: MockExam[]) {
  const sessionQuestions = sessions.reduce(
    (sum, session) => sum + session.questions,
    0,
  );
  const examQuestions = exams.reduce((sum, exam) => sum + exam.total, 0);
  const correct =
    sessions.reduce((sum, session) => sum + session.correct, 0) +
    exams.reduce((sum, exam) => sum + exam.correct, 0);
  const questions = sessionQuestions + examQuestions;
  return {
    questions,
    correct,
    incorrect: questions - correct,
    studyHours:
      sessions.reduce((sum, session) => sum + session.duration, 0) / 3600,
    exams: exams.length,
  };
}

export function getUnlockedProfileFrames(
  metrics: LevelGoals,
  goals: LevelGoals,
) {
  return profileFrameTiers
    .filter(
      (tier) =>
        tier.multiplier === 0 ||
        (metrics.questions >= goals.questions * tier.multiplier &&
          metrics.studyHours >= goals.studyHours * tier.multiplier &&
          metrics.exams >= goals.exams * tier.multiplier),
    )
    .map((tier) => tier.id);
}
