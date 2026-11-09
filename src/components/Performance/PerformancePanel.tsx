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
import { GlassIconButton, GlassPanel } from "../Glass/Glass";
import ProfileSummary from "./ProfileSummary";
import StudyPerformance from "./StudyPerformance";
import StudyHistory from "./StudyHistory";
import styles from "./PerformancePanel.module.css";
import contentStyles from "./SidebarContent.module.css";
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
  const { subjects } = useStudyStore();
  const [tab, setTab] = useState<Tab>("time");
  const petOpen = tool === "pet";
  const [petVisited, setPetVisited] = useState(false);
  const [subject, setSubject] = useState("");
  const [chartsMounted, setChartsMounted] = useState(true);
  const [visited, setVisited] = useState<(keyof typeof tools)[]>([]);
  const rewardError = useStudyRewards();
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
        <ProfileSummary onSettings={onSettings} />
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
              />
            )}
            {tab === "performance" && <StudyHistory exams />}
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
    </GlassPanel>
  );
}
