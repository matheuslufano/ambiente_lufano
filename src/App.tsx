import { lazy, Suspense, useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { BookOpen, CalendarDays, UserRound } from "lucide-react";
import { useStudyStore } from "./store/useStudyStore";
import GoalsPanel from "./components/Goals/GoalsPanel";
import StudyCalendar from "./components/Calendar/StudyCalendar";
import PerformancePanel from "./components/Performance/PerformancePanel";
import StudyDock, { type Tool } from "./components/Dock/StudyDock";
import styles from "./App.module.css";
import { useVisualAsset } from "./hooks/useVisualAsset";
import WorkspaceHeader from "./components/Header/WorkspaceHeader";
import { useAppRoute } from "./hooks/useAppRoute";
import { appRoutes } from "./lib/appRoutes";
const ActivitiesPage = lazy(() => import("./pages/ActivitiesPage"));
const PlanningPage = lazy(() => import("./pages/PlanningPage"));
const StudyCyclePage = lazy(() => import("./pages/StudyCyclePage"));
const TrackingPage = lazy(() => import("./pages/TrackingPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const NotebooksPanel = lazy(() => import("./components/Tools/NotebooksPanel"));
export default function App() {
  const { preferences, active } = useStudyStore();
  const page = useAppRoute();
  const { url: wallpaper } = useVisualAsset("wallpaper");
  const [tool, setTool] = useState<Tool>(null);
  const [centerTool, setCenterTool] = useState<"notebooks" | null>(null);
  const [startRequest, setStartRequest] = useState(0);
  const [requestedSubject, setRequestedSubject] = useState<string | undefined>(
    undefined,
  );
  const [mobile, setMobile] = useState("calendar");
  const [systemDark, setSystemDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);
  const dark =
    preferences.theme === "dark" ||
    (preferences.theme === "auto" && systemDark);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.dataset.wallpaper = preferences.wallpaper;
    document.documentElement.dataset.reduceMotion = String(
      preferences.reduceMotion,
    );
  }, [dark, preferences]);
  function openTool(value: Tool) {
    if (value === "notebooks") {
      setTool(null);
      setCenterTool("notebooks");
      setMobile("calendar");
      return;
    }
    setCenterTool(null);
    setTool(value);
    if (value) setMobile("performance");
  }
  function requestStudy(subjectId?: string) {
    window.location.hash = "/";
    setRequestedSubject(subjectId);
    setStartRequest((current) => current + 1);
    setMobile("calendar");
  }
  useEffect(() => {
    document.title = `${appRoutes.find((route) => route.id === page)?.label || "Página não encontrada"} · Espaço de Estudo Lufano`;
  }, [page]);
  return (
    <MotionConfig reducedMotion={preferences.reduceMotion ? "always" : "user"}>
      <div
        id="lufano-workspace"
        className={styles.workspace}
        data-studying={!!active}
      >
        <div
          className={styles.wallpaper}
          aria-hidden="true"
          data-custom={!!wallpaper}
          data-desk={preferences.wallpaper === "desk"}
        >
          {(wallpaper || preferences.wallpaper === "desk") && (
            <img
              className={styles.wallpaperPhoto}
              src={wallpaper || "/images/study-desk-wallpaper.jpg"}
              alt=""
            />
          )}
          <div />
          <div />
          <div />
        </div>
        <WorkspaceHeader
          page={page}
          studying={!!active}
          onStudyControls={() => requestStudy()}
        />
        <div hidden={page !== "home"}>
          <nav
            id="mobile-panel-navigation"
            className={styles.mobileTabs}
            aria-label="Painéis"
          >
            {[
              { id: "goals", label: "Matérias", icon: BookOpen },
              { id: "calendar", label: "Calendário", icon: CalendarDays },
              { id: "performance", label: "Meu progresso", icon: UserRound },
            ].map(({ id, label, icon: Icon }) => (
              <button
                id={`mobile-panel-${id}`}
                key={id}
                aria-pressed={mobile === id}
                onClick={() => {
                  setMobile(id);
                  if (id === "performance") setTool(null);
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </nav>
          <main id="dashboard-three-columns" className={styles.dashboard}>
            <div
              className={styles.left}
              data-mobile-visible={mobile === "goals"}
            >
              <GoalsPanel />
            </div>
            <div
              className={styles.center}
              data-mobile-visible={mobile === "calendar"}
            >
              {centerTool === "notebooks" ? (
                <div
                  id="workspace-notebook-center"
                  className={styles.centerToolPage}
                >
                  <Suspense
                    fallback={
                      <p className="empty-state" role="status">
                        Abrindo seus cadernos…
                      </p>
                    }
                  >
                    <NotebooksPanel onClose={() => setCenterTool(null)} />
                  </Suspense>
                </div>
              ) : (
                <StudyCalendar />
              )}
              <StudyDock
                tool={centerTool ?? tool}
                onTool={openTool}
                startRequest={startRequest}
                requestedSubject={requestedSubject}
              />
            </div>
            <div
              className={styles.right}
              data-mobile-visible={mobile === "performance"}
              data-tool-expanded={tool === "audio" || tool === "flashcards"}
            >
              <div className={styles.contextWrapper}>
                <PerformancePanel
                  onSettings={() => openTool("settings")}
                  tool={tool}
                  onCloseTool={() => setTool(null)}
                  onStudy={() => requestStudy()}
                />
              </div>
            </div>
          </main>
        </div>
        <Suspense
          fallback={
            <p className="empty-state" role="status">
              Abrindo página…
            </p>
          }
        >
          {page === "activities" ? (
            <ActivitiesPage onStudy={() => requestStudy()} />
          ) : page === "planning" ? (
            <PlanningPage />
          ) : page === "cycle" ? (
            <StudyCyclePage onStudy={requestStudy} />
          ) : page === "tracking" ? (
            <TrackingPage />
          ) : page === "blog" ? (
            <BlogPage />
          ) : page === "not-found" ? (
            <main id="workspace-not-found" className="empty-state">
              <h1>Página não encontrada</h1>
              <a href="#/">Voltar ao início</a>
            </main>
          ) : null}
        </Suspense>
      </div>
    </MotionConfig>
  );
}
