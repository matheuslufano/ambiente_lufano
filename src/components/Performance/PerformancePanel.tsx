import { lazy, Suspense, useEffect, useState } from "react";
import {
  X,
  ChartNoAxesCombined,
  ChartBar,
  ChartPie,
  ArrowUpDown,
} from "lucide-react";
import { useStudyStore } from "../../store/useStudyStore";
import { useStudyRewards } from "../../hooks/useStudyRewards";
import type { Tool } from "../Dock/StudyDock";
import {
  GlassButton,
  GlassIconButton,
  GlassModal,
  GlassPanel,
} from "../Glass/Glass";
import ProfileSummary, { type ProfileMetric } from "./ProfileSummary";
import StudyPerformance from "./StudyPerformance";
import StudyHistory from "./StudyHistory";
import styles from "./PerformancePanel.module.css";
import contentStyles from "./SidebarContent.module.css";
import type { LevelGoals, ProfileFrame } from "../../types";
import {
  defaultLevelGoals,
  getProfileMetrics,
  getUnlockedProfileFrames,
  profileFrameTiers,
} from "../../lib/profileFrames";
const PetGame = lazy(() => import("../pet/PetGame"));
const tools = {
  pomodoro: lazy(() => import("../Pomodoro/PomodoroPanel")),
  audio: lazy(() => import("../Tools/AudioPanel")),
  notebooks: lazy(() => import("../Tools/NotebooksPanel")),
  flashcards: lazy(() => import("../Tools/FlashcardsPanel")),
  settings: lazy(() => import("../Tools/SettingsPanel")),
};
type Tab = "time" | "timeline" | "performance" | "subjects";
export default function PerformancePanel({
  onSettings,
  tool,
  onCloseTool,
  onStudy,
}: {
  onSettings: () => void;
  tool: Tool;
  onCloseTool: () => void;
  onStudy: () => void;
}) {
  const { subjects, preferences, sessions, mockExams, setPreferences } =
    useStudyStore();
  const [tab, setTab] = useState<Tab>("time");
  const [selectedMetric, setSelectedMetric] = useState<ProfileMetric>("time");
  const [levelOpen, setLevelOpen] = useState(false);
  const [draftGoals, setDraftGoals] = useState({
    questions: String(defaultLevelGoals.questions),
    studyHours: String(defaultLevelGoals.studyHours),
    exams: String(defaultLevelGoals.exams),
  });
  const [draftFrame, setDraftFrame] = useState<ProfileFrame>(
    profileFrameTiers[0].id,
  );
  const metrics = getProfileMetrics(sessions, mockExams);
  const goalNumbers: LevelGoals = {
    questions: Math.max(1, Number(draftGoals.questions) || 1),
    studyHours: Math.max(1, Number(draftGoals.studyHours) || 1),
    exams: Math.max(1, Number(draftGoals.exams) || 1),
  };
  const unlockedFrames = getUnlockedProfileFrames(metrics, goalNumbers);
  const petOpen = tool === "pet";
  const [petVisited, setPetVisited] = useState(false);
  const [subject, setSubject] = useState("");
  const [chartsMounted, setChartsMounted] = useState(true);
  const [visited, setVisited] = useState<(keyof typeof tools)[]>([]);
  const rewardError = useStudyRewards();
  useEffect(() => {
    if (!levelOpen) return;
    const goals = preferences.levelGoals ?? defaultLevelGoals;
    setDraftGoals({
      questions: String(goals.questions),
      studyHours: String(goals.studyHours),
      exams: String(goals.exams),
    });
    const availableFrames = getUnlockedProfileFrames(metrics, goals);
    setDraftFrame(
      preferences.profileFrame &&
        availableFrames.includes(preferences.profileFrame)
        ? preferences.profileFrame
        : (availableFrames.at(-1) ?? profileFrameTiers[0].id),
    );
  }, [levelOpen, preferences.levelGoals, preferences.profileFrame]);
  function selectMetric(metric: ProfileMetric) {
    setSelectedMetric(metric);
    setTab(metric === "time" ? "time" : "performance");
    setChartsMounted(true);
    onCloseTool();
  }
  useEffect(() => {
    if (tool === "pet") {
      setPetVisited(true);
    } else if (tool) {
      setVisited((current) =>
        current.includes(tool) ? current : [...current, tool],
      );
    }
  }, [tool]);
  return (
    <GlassPanel
      id="performance-panel"
      className={`${styles.panel} ${tool === "audio" || tool === "flashcards" ? styles.toolExpanded : ""}`}
    >
      <div hidden={petOpen || tool === "audio" || tool === "flashcards"}>
        <ProfileSummary
          onSettings={onSettings}
          selectedMetric={selectedMetric}
          onMetricChange={selectMetric}
          onOpenLevels={() => setLevelOpen(true)}
        />
      </div>
      <nav
        id="sidebar-content-tabs"
        className={contentStyles.tabs}
        aria-label="Conteúdo do painel"
        hidden={petOpen || !!tool}
      >
        {(
          [
            {
              id: "performance",
              label: "Desempenho",
              icon: ChartNoAxesCombined,
            },
            { id: "timeline", label: "Linha do tempo", icon: ChartBar },
            { id: "time", label: "Tempo de estudo", icon: ChartPie },
            { id: "subjects", label: "Tipo de estudo", icon: ArrowUpDown },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            id={`sidebar-tab-${item.id}`}
            aria-pressed={!tool && !petOpen && tab === item.id}
            onClick={() => {
              setTab(item.id);
              if (item.id === "time") setSelectedMetric("time");
              if (item.id === "performance") setSelectedMetric("questions");
              if (item.id === "time" || item.id === "performance")
                setChartsMounted(true);
              onCloseTool();
            }}
          >
            <item.icon size={10} /> {item.label}
          </button>
        ))}
      </nav>
      <div
        data-tool={tool || undefined}
        id="sidebar-white-content"
        className={contentStyles.content}
        data-chart-page={!petOpen && !tool}
        data-pet-expanded={petOpen}
        data-tool-expanded={tool === "audio" || tool === "flashcards"}
      >
        {petOpen && (
          <div className={contentStyles.petClose}>
            <GlassIconButton
              id="sidebar-close-pet"
              aria-label="Fechar Pet e voltar ao perfil"
              onClick={onCloseTool}
            >
              <X size={18} />
            </GlassIconButton>
          </div>
        )}
        <Suspense
          fallback={
            <p className="form-hint" role="status">
              Preparando seu espaço…
            </p>
          }
        >
          <div hidden={!petOpen}>
            {petVisited && (
              <PetGame onStudy={onStudy} rewardError={rewardError} />
            )}
          </div>
          <div
            hidden={
              petOpen || !!tool || (tab !== "time" && tab !== "performance")
            }
          >
            {chartsMounted && (
              <StudyPerformance
                subjectId={subject}
                mode={tab === "performance" ? "performance" : "time"}
                activeMetric={tab === "performance" ? selectedMetric : "time"}
              />
            )}
            {tab === "performance" && selectedMetric === "exams" && (
              <StudyHistory exams />
            )}
          </div>
          {!petOpen && !tool && tab === "timeline" && (
            <StudyHistory subjectId={subject} />
          )}
          {!petOpen && !tool && tab === "subjects" && (
            <>
              <label className={contentStyles.selector}>
                <span className="sr-only">Filtrar gráficos por matéria</span>
                <select
                  id="sidebar-subject-filter"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="">Todas as matérias</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <section
                id="sidebar-subject-overview"
                className={contentStyles.subjectList}
              >
                <StudyPerformance
                  subjectId={subject}
                  mode="time"
                  initialGrouping="topics"
                />
                {subjects
                  .filter((s) => !subject || s.id === subject)
                  .map((s) => (
                    <article key={s.id}>
                      <strong>{s.name}</strong>
                      <p>
                        {s.topics.length} tópicos · meta {s.targetHours}h /{" "}
                        {s.targetQuestions}Q
                      </p>
                      <p>
                        {s.topics.slice(0, 3).join(" · ") ||
                          "Cadastre o conteúdo do edital no objetivo."}
                      </p>
                    </article>
                  ))}
              </section>
            </>
          )}
          {visited.map((id) => {
            const Component = tools[id];
            return (
              <div
                hidden={tool !== id}
                key={id}
                className={`${contentStyles.toolPage} ${id === "audio" || id === "flashcards" ? contentStyles.fullHeightToolPage : ""}`}
              >
                <div className={contentStyles.toolHeading}>
                  <span>
                    {id === "pomodoro"
                      ? "Pomodoro"
                      : id === "audio"
                        ? "Biblioteca de áudio"
                        : id === "flashcards"
                          ? "Flashcards"
                          : "Ferramenta de estudo"}
                  </span>
                  <GlassIconButton
                    id={`sidebar-close-${id}`}
                    aria-label="Fechar ferramenta e voltar à aba"
                    onClick={onCloseTool}
                  >
                    <X size={17} />
                  </GlassIconButton>
                </div>
                <Component />
              </div>
            );
          })}
        </Suspense>
      </div>
      <GlassModal
        id="profile-level-modal"
        title="Nível e molduras"
        description="Defina suas metas. Cada moldura é liberada ao atingir todas as metas do nível."
        open={levelOpen}
        onClose={() => setLevelOpen(false)}
      >
        <form
          className={styles.levelDialog}
          onSubmit={(event) => {
            event.preventDefault();
            const goals = {
              questions: Number(draftGoals.questions),
              studyHours: Number(draftGoals.studyHours),
              exams: Number(draftGoals.exams),
            };
            if (
              Object.values(goals).some(
                (value) => !Number.isSafeInteger(value) || value < 1,
              )
            )
              return;
            setPreferences({
              levelGoals: goals,
              profileFrame: unlockedFrames.includes(draftFrame)
                ? draftFrame
                : (unlockedFrames.at(-1) ?? profileFrameTiers[0].id),
            });
            setLevelOpen(false);
          }}
        >
          <a
            className={styles.profileFrameSource}
            href="https://wiki.leagueoflegends.com/en-us/Category:Summoner_icon_borders"
            target="_blank"
            rel="noreferrer"
          >
            Bordas de invocador · imagens Riot Games
          </a>
          <div className={styles.levelGoalGrid}>
            <label>
              Meta de questões
              <input
                id="level-goal-questions"
                type="number"
                min="1"
                step="1"
                required
                value={draftGoals.questions}
                onChange={(event) =>
                  setDraftGoals((current) => ({
                    ...current,
                    questions: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Meta de estudo (h)
              <input
                id="level-goal-hours"
                type="number"
                min="1"
                step="1"
                required
                value={draftGoals.studyHours}
                onChange={(event) =>
                  setDraftGoals((current) => ({
                    ...current,
                    studyHours: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Meta de simulados
              <input
                id="level-goal-exams"
                type="number"
                min="1"
                step="1"
                required
                value={draftGoals.exams}
                onChange={(event) =>
                  setDraftGoals((current) => ({
                    ...current,
                    exams: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div
            className={styles.levelGoalProgress}
            aria-label="Progresso atual"
          >
            <span>
              Questões: {metrics.questions.toLocaleString("pt-BR")} /{" "}
              {goalNumbers.questions.toLocaleString("pt-BR")}
            </span>
            <progress
              max={goalNumbers.questions}
              value={Math.min(metrics.questions, goalNumbers.questions)}
            />
            <span>
              Tempo:{" "}
              {metrics.studyHours.toLocaleString("pt-BR", {
                maximumFractionDigits: 1,
              })}{" "}
              / {goalNumbers.studyHours} h
            </span>
            <progress
              max={goalNumbers.studyHours}
              value={Math.min(metrics.studyHours, goalNumbers.studyHours)}
            />
            <span>
              Simulados: {metrics.exams} / {goalNumbers.exams}
            </span>
            <progress
              max={goalNumbers.exams}
              value={Math.min(metrics.exams, goalNumbers.exams)}
            />
          </div>
          <div
            className={styles.levelFrameGrid}
            aria-label="Molduras disponíveis"
          >
            {profileFrameTiers.map((frame) => {
              const isUnlocked = unlockedFrames.includes(frame.id);
              return (
                <button
                  key={frame.id}
                  className={styles.levelFrameChoice}
                  type="button"
                  data-rank={frame.id}
                  aria-pressed={draftFrame === frame.id}
                  disabled={!isUnlocked}
                  onClick={() => setDraftFrame(frame.id)}
                >
                  <span
                    className={styles.levelFramePreview}
                    data-rank={frame.id}
                    aria-hidden="true"
                  >
                    <span>{preferences.name.slice(0, 1).toUpperCase()}</span>
                    <img
                      src={frame.imageUrl}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </span>
                  <span className={styles.levelFrameInfo}>
                    <strong>{frame.name}</strong>
                    <small>
                      {isUnlocked
                        ? frame.multiplier === 0
                          ? "Desbloqueada"
                          : `Desbloqueada · ${frame.multiplier}× metas`
                        : `Bloqueada · ${frame.multiplier}× metas`}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
          <div className={styles.levelDialogActions}>
            <GlassButton
              id="profile-level-cancel"
              type="button"
              onClick={() => setLevelOpen(false)}
            >
              Cancelar
            </GlassButton>
            <GlassButton
              id="profile-level-save"
              type="submit"
              variant="primary"
            >
              Salvar metas e moldura
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </GlassPanel>
  );
}
