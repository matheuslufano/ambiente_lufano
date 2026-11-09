export interface StudyPlan {
  id: string;
  subjectId: string;
  from: string;
  to: string;
  minutes: number;
}
export interface SubjectGroup {
  id: string;
  name: string;
}
export interface StudyCycleItem {
  id: string;
  subjectId: string;
  minutes: number;
}
export interface StudyPost {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}
export interface StudyShortcut {
  id: string;
  label: string;
  url: string;
  icon: "questions" | "courses" | "youtube" | "drive" | "site";
}
export interface Subject {
  id: string;
  name: string;
  color: string;
  topics: string[];
  targetHours: number;
  targetQuestions: number;
  groupId: string;
  syllabusText?: string;
}
export interface Goal {
  institution: string;
  title: string;
  role: string;
  board: string;
  year: number;
  salary: string;
  examDate: string;
  emblem?: InstitutionEmblem;
}
export interface InstitutionEmblem {
  title: string;
  url: string;
  source: string;
  license: string;
  author: string;
}
export interface StudySession {
  validIntervals?: import("./types/pet").StudyInterval[];
  endedAt?: number;
  id: string;
  subjectId: string;
  topic: string;
  startedAt: number;
  duration: number;
  questions: number;
  correct: number;
  summary: string;
  date: string;
}
export interface ActiveSession {
  segments?: import("./types/pet").StudyInterval[];
  subjectId: string;
  topic: string;
  startedAt: number;
  accumulated: number;
  runningSince: number | null;
}
export interface MockExam {
  id: string;
  title: string;
  total: number;
  correct: number;
  completedAt: number;
}
export interface CalendarActivity {
  id: string;
  date: string;
  subjectId: string;
  topic: string;
  time: string;
  minutes: number;
}
export interface Flashcard {
  id: string;
  subjectId: string;
  question: string;
  answer: string;
  due: number;
  interval: number;
}
export interface AudioNote {
  id: string;
  title: string;
  subjectId: string;
  date: string;
  blob: Blob;
}
export interface Preferences {
  name: string;
  theme: "light" | "dark" | "auto";
  dailyHours: number;
  reduceMotion: boolean;
  wallpaper: "desk" | "sage" | "sand" | "blue";
  focusMinutes: number;
}
export type VisualAssetKind = "avatar" | "wallpaper" | "emblem";
export interface VisualAsset {
  id: VisualAssetKind;
  blob: Blob;
  name: string;
}
