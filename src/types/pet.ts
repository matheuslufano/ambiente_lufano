export type PetSceneId = "bedroom" | "study-room" | "library" | "garden";
export type PetAction =
  | "idle"
  | "reading"
  | "happy"
  | "hungry"
  | "feeding"
  | "coffee"
  | "playing"
  | "sleeping"
  | "celebrating"
  | "affection";
export interface StudyInterval {
  start: number;
  end: number;
}
export interface RewardRules {
  minutes10: number;
  minutes25: number;
  minutes50: number;
  minutes60: number;
  questions10: number;
  mockExam: number;
  dailyGoal: number;
}
export interface PetRecord {
  id: "lufi";
  name: string;
  coins: number;
  xp: number;
  hunger: number;
  happiness: number;
  energy: number;
  updatedAt: number;
  scene: PetSceneId;
  owned: string[];
  equipped: string | null;
  rewardedIntervals: StudyInterval[];
  rewardedQuestions: number;
  dailyGoals: Record<string, number>;
  lastPlayAt: number;
  restingSince: number | null;
  rules: RewardRules;
}
export interface PetReward {
  id: string;
  kind: "study" | "daily" | "mock";
  date: string;
  coins: number;
  xp: number;
  validSeconds: number;
  message: string;
}
export interface PetFood {
  id: string;
  name: string;
  price: number;
  hunger: number;
  energy: number;
  level: number;
}
export interface PetAccessory {
  id: string;
  name: string;
  price: number;
  level: number;
}
