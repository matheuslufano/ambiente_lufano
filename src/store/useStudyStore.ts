import { validStudyPlans } from "../lib/studyInsights";
import { removeNotebookPage } from "../lib/notebookPages";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ActiveSession,
  CalendarActivity,
  Flashcard,
  Goal,
  Preferences,
  StudySession,
  Subject,
  SubjectGroup,
  StudyShortcut,
  MockExam,
  StudyCycleItem,
  StudyPost,
  StudyPlan,
} from "../types";
import { dateKey, elapsedSeconds } from "../lib/time";
import { defaultShortcuts } from "../lib/shortcuts";
import {
  defaultSubjectGroups,
  initialSubjects,
  normalizeCurriculum,
} from "../lib/curriculum";
interface StudyState {
  studyPlans: StudyPlan[];
  setStudyPlans: (plans: StudyPlan[]) => void;
  cycleStartedAt: number;
  restartCycle: () => void;
  studyCycle: StudyCycleItem[];
  setStudyCycle: (items: StudyCycleItem[]) => void;
  studyPosts: StudyPost[];
  saveStudyPost: (post: StudyPost) => void;
  mockExams: MockExam[];
  addMockExam: (exam: Omit<MockExam, "id" | "completedAt">) => void;
  updateMockExam: (
    id: string,
    exam: Pick<MockExam, "title" | "total" | "correct">,
  ) => boolean;
  removeMockExam: (id: string) => void;
  shortcuts: StudyShortcut[];
  setShortcuts: (shortcuts: StudyShortcut[]) => void;
  goal: Goal;
  subjects: Subject[];
  subjectGroups: SubjectGroup[];
  sessions: StudySession[];
  addManualSession: (session: Omit<StudySession, "id">) => boolean;
  activities: CalendarActivity[];
  active: ActiveSession | null;
  preferences: Preferences;
  notes: Record<string, string>;
  flashcards: Flashcard[];
  saveObjective: (
    goal: Goal,
    groups: SubjectGroup[],
    subjects: Subject[],
  ) => void;
  setPreferences: (p: Partial<Preferences>) => void;
  start: (subjectId: string, topic: string) => void;
  togglePause: () => void;
  finish: (summary: string, questions: number, correct: number) => void;
  updateSession: (
    id: string,
    update: Pick<StudySession, "summary" | "questions" | "correct">,
  ) => void;
  removeSession: (id: string) => void;
  addActivity: (a: Omit<CalendarActivity, "id">) => void;
  moveActivity: (id: string, date: string) => void;
  removeActivity: (id: string) => void;
  saveNote: (id: string, html: string) => void;
  deleteNotebookPage: (subjectId: string, contentIndex: number) => void;
  addFlashcard: (card: Omit<Flashcard, "id" | "due" | "interval">) => void;
  reviewFlashcard: (id: string, rating: number) => void;
  deleteFlashcard: (id: string) => void;
}
export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      studyPlans: [],
      cycleStartedAt: Date.now(),
      restartCycle: () => set({ cycleStartedAt: Date.now() }),
      setStudyPlans: (plans) => {
        if (
          !validStudyPlans(
            plans,
            get().subjects.map((s) => s.id),
          )
        )
          return;
        set({ studyPlans: plans });
      },
      studyCycle: [],
      studyPosts: [],
      setStudyCycle: (items) => {
        if (
          items.some(
            (item) =>
              !get().subjects.some(
                (subject) => subject.id === item.subjectId,
              ) ||
              !Number.isInteger(item.minutes) ||
              item.minutes < 1 ||
              item.minutes > 480,
          )
        )
          return;
        set({ studyCycle: items, cycleStartedAt: Date.now() });
      },
      saveStudyPost: (post) => {
        if (!post.title.trim() || !post.body.trim()) return;
        set((state) => ({
          studyPosts: state.studyPosts.some((item) => item.id === post.id)
            ? state.studyPosts.map((item) =>
                item.id === post.id ? post : item,
              )
            : [...state.studyPosts, post],
        }));
      },
      mockExams: [],
      addMockExam: (exam) => {
        if (
          !exam.title.trim() ||
          !Number.isSafeInteger(exam.total) ||
          exam.total < 1 ||
          !Number.isSafeInteger(exam.correct) ||
          exam.correct < 0 ||
          exam.correct > exam.total
        )
          return;
        set((state) => ({
          mockExams: [
            ...state.mockExams,
            { ...exam, id: crypto.randomUUID(), completedAt: Date.now() },
          ],
        }));
      },
      updateMockExam: (id, exam) => {
        if (
          !exam.title.trim() ||
          !Number.isSafeInteger(exam.total) ||
          exam.total < 1 ||
          !Number.isSafeInteger(exam.correct) ||
          exam.correct < 0 ||
          exam.correct > exam.total
        )
          return false;
        let updated = false;
        set((state) => ({
          mockExams: state.mockExams.map((current) => {
            if (current.id !== id) return current;
            updated = true;
            return { ...current, ...exam };
          }),
        }));
        return updated;
      },
      removeMockExam: (id) =>
        set((state) => ({
          mockExams: state.mockExams.filter((exam) => exam.id !== id),
        })),
      shortcuts: defaultShortcuts,
      setShortcuts: (shortcuts) => set({ shortcuts }),
      goal: {
        institution: "Polícia Civil do Tocantins",
        title: "PC - TO",
        role: "Polícia Civil",
        board: "FGV",
        year: 2027,
        salary: "7.917,97",
        examDate: "",
      },
      subjects: initialSubjects,
      subjectGroups: defaultSubjectGroups,
      sessions: [],
      addManualSession: (session) => {
        if (
          !get().subjects.some((subject) => subject.id === session.subjectId) ||
          !session.summary.trim() ||
          !Number.isSafeInteger(session.duration) ||
          session.duration <= 0 ||
          session.duration > 86400 ||
          !Number.isFinite(session.startedAt) ||
          !Number.isFinite(session.endedAt) ||
          session.endedAt! > Date.now() ||
          session.endedAt! <= session.startedAt ||
          session.endedAt! - session.startedAt !== session.duration * 1000 ||
          session.date !== dateKey(new Date(session.startedAt)) ||
          !Number.isSafeInteger(session.questions) ||
          !Number.isSafeInteger(session.correct) ||
          session.questions < 0 ||
          session.correct < 0 ||
          session.correct > session.questions
        )
          return false;
        set((state) => ({
          sessions: [
            ...state.sessions,
            { ...session, id: crypto.randomUUID() },
          ],
        }));
        return true;
      },
      activities: [],
      active: null,
      notes: {},
      flashcards: [],
      preferences: {
        name: "Estudante",
        theme: "light",
        dailyHours: 3,
        reduceMotion: false,
        wallpaper: "desk",
        focusMinutes: 25,
      },
      saveObjective: (goal, subjectGroups, subjects) =>
        set({ goal, subjectGroups, subjects }),
      setPreferences: (p) =>
        set((s) => ({ preferences: { ...s.preferences, ...p } })),
      start: (subjectId, topic) => {
        if (!get().active)
          set({
            active: {
              subjectId,
              topic,
              startedAt: Date.now(),
              accumulated: 0,
              runningSince: Date.now(),
              segments: [],
            },
          });
      },
      togglePause: () =>
        set((s) => {
          if (!s.active) return {};
          const a = s.active;
          return {
            active: {
              ...a,
              segments:
                a.segments === undefined
                  ? undefined
                  : a.runningSince === null
                    ? a.segments
                    : [
                        ...a.segments,
                        { start: a.runningSince, end: Date.now() },
                      ],
              accumulated:
                a.accumulated +
                (a.runningSince === null
                  ? 0
                  : Math.max(0, Date.now() - a.runningSince)),
              runningSince: a.runningSince === null ? Date.now() : null,
            },
          };
        }),
      finish: (summary, questions, correct) => {
        const a = get().active;
        if (
          !a ||
          !summary.trim() ||
          !Number.isSafeInteger(questions) ||
          !Number.isSafeInteger(correct) ||
          questions < 0 ||
          correct < 0 ||
          correct > questions
        )
          return;
        set((s) => ({
          active: null,
          sessions: [
            ...s.sessions,
            {
              id: crypto.randomUUID(),
              subjectId: a.subjectId,
              topic: a.topic,
              startedAt: a.startedAt,
              duration: elapsedSeconds(a),
              endedAt: Date.now(),
              validIntervals:
                a.segments === undefined
                  ? undefined
                  : [
                      ...a.segments,
                      ...(a.runningSince === null
                        ? []
                        : [{ start: a.runningSince, end: Date.now() }]),
                    ],
              questions,
              correct,
              summary,
              date: dateKey(new Date(a.startedAt)),
            },
          ],
        }));
      },
      updateSession: (id, update) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, ...update } : session,
          ),
        })),
      removeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== id),
        })),
      addActivity: (a) =>
        set((s) => ({
          activities: [...s.activities, { ...a, id: crypto.randomUUID() }],
        })),
      moveActivity: (id, date) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === id ? { ...a, date } : a,
          ),
        })),
      removeActivity: (id) =>
        set((s) => ({ activities: s.activities.filter((a) => a.id !== id) })),
      saveNote: (id, html) =>
        set((s) => ({ notes: { ...s.notes, [id]: html } })),
      deleteNotebookPage: (subjectId, contentIndex) =>
        set((s) => ({
          notes: removeNotebookPage(s.notes, subjectId, contentIndex),
        })),
      addFlashcard: (card) =>
        set((s) => ({
          flashcards: [
            ...s.flashcards,
            { ...card, id: crypto.randomUUID(), due: Date.now(), interval: 0 },
          ],
        })),
      reviewFlashcard: (id, rating) =>
        set((s) => ({
          flashcards: s.flashcards.map((c) => {
            if (c.id !== id) return c;
            const interval =
              rating === 0
                ? 0
                : Math.max(
                    1,
                    Math.round((c.interval || 1) * [0, 1, 2.5, 4][rating]),
                  );
            return {
              ...c,
              interval,
              due: Date.now() + (rating === 0 ? 60000 : interval * 86400000),
            };
          }),
        })),
      deleteFlashcard: (id) =>
        set((s) => ({ flashcards: s.flashcards.filter((c) => c.id !== id) })),
    }),
    {
      name: "lufano-study-v1",
      version: 7,
      migrate: (persisted, fromVersion) => {
        const state = persisted as StudyState;
        // Upgrade only the untouched starter goal; preserve the user's edits.
        if (
          state.goal.institution === "Meu objetivo de estudo" &&
          state.goal.title === "Concurso público" &&
          state.goal.role === "Defina seu cargo" &&
          state.goal.board === "A definir" &&
          !state.goal.salary &&
          !state.goal.examDate &&
          state.goal.year === 2027
        ) {
          state.goal = {
            ...state.goal,
            institution: "Polícia Civil do Tocantins",
            title: "PC - TO",
            role: "Polícia Civil",
            board: "FGV",
            salary: "7.917,97",
          };
        }
        const legacyIds = [
          "portugues",
          "constitucional",
          "administrativo",
          "penal",
          "informatica",
          "raciocinio",
        ];
        const untouchedLegacyList =
          !state.subjectGroups &&
          state.subjects.length === legacyIds.length &&
          state.subjects.every(
            (subject) =>
              legacyIds.includes(subject.id) &&
              (initialSubjects.some(
                (initial) =>
                  initial.id === subject.id && initial.name === subject.name,
              ) ||
                (subject.id === "raciocinio" &&
                  subject.name === "Raciocínio Lógico")),
          );
        const curriculum = normalizeCurriculum(
          state.subjects,
          state.subjectGroups,
        );
        if (untouchedLegacyList) {
          curriculum.subjects.push(
            ...initialSubjects.filter(
              (subject) =>
                !curriculum.subjects.some(
                  (existing) => existing.id === subject.id,
                ),
            ),
          );
          curriculum.subjects = curriculum.subjects
            .map((subject) => {
              const initial = initialSubjects.find(
                (item) => item.id === subject.id,
              )!;
              const isStarterPortuguese =
                subject.id === "portugues" &&
                JSON.stringify(subject.topics) ===
                  JSON.stringify([
                    "Interpretação de texto",
                    "Gramática",
                    "Sintaxe",
                  ]);
              return {
                ...subject,
                name: initial.name,
                ...(isStarterPortuguese
                  ? {
                      topics: initial.topics,
                      syllabusText: initial.syllabusText,
                    }
                  : {}),
              };
            })
            .sort(
              (a, b) =>
                initialSubjects.findIndex((subject) => subject.id === a.id) -
                initialSubjects.findIndex((subject) => subject.id === b.id),
            );
        }
        return {
          ...state,
          studyPlans: state.studyPlans ?? [],
          cycleStartedAt: state.cycleStartedAt ?? Date.now(),
          studyCycle: state.studyCycle ?? [],
          studyPosts: state.studyPosts ?? [],
          mockExams: state.mockExams ?? [],
          shortcuts: state.shortcuts ?? defaultShortcuts,
          ...curriculum,
          preferences: {
            ...state.preferences,
            wallpaper:
              fromVersion < 3 && state.preferences.wallpaper === "sage"
                ? "desk"
                : state.preferences.wallpaper,
          },
        };
      },
    },
  ),
);
