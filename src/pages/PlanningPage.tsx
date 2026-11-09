import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { GlassButton, GlassIconButton } from "../components/Glass/Glass";
import { useStudyStore } from "../store/useStudyStore";
import { filterSessions, periodBounds } from "../lib/studyInsights";
import { formatDuration } from "../lib/time";
import SchedulePlanner from "./SchedulePlanner";
import styles from "./WorkspacePages.module.css";
export default function PlanningPage() {
  const { subjects, sessions, studyPlans, setStudyPlans } = useStudyStore();
  const [tab, setTab] = useState("goals"),
    [period, setPeriod] = useState<"week" | "month">("week"),
    [cursor, setCursor] = useState(new Date()),
    [adding, setAdding] = useState(false);
  const bounds = periodBounds(cursor, period),
    plans = studyPlans.filter(
      (p) => p.from === bounds.from && p.to === bounds.to,
    );
  function move(delta: number) {
    const d = new Date(cursor);
    if (period === "week") d.setDate(d.getDate() + 7 * delta);
    else d.setMonth(d.getMonth() + delta, 1);
    setCursor(d);
  }
  return (
    <main id="planning-page" className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Planejamento de estudos</h1>
          <p>Defina metas e acompanhe o tempo dedicado a cada matéria.</p>
        </div>
        <GlassButton
          id="planning-add-goal"
          variant="primary"
          onClick={() => {
            setTab("goals");
            setAdding(!adding);
          }}
        >
          <Plus size={15} /> Nova meta
        </GlassButton>
      </div>
      <nav
        id="planning-tabs"
        className={styles.pageTabs}
        aria-label="Planejamento"
      >
        <button aria-pressed={tab === "goals"} onClick={() => setTab("goals")}>
          <Target size={16} /> Metas de estudo
        </button>
        <button
          aria-pressed={tab === "schedule"}
          onClick={() => setTab("schedule")}
        >
          <CalendarDays size={16} /> Agenda
        </button>
      </nav>
      {tab === "schedule" ? (
        <SchedulePlanner />
      ) : (
        <>
          <div className={styles.periodNav}>
            <GlassIconButton
              id="planning-previous-period"
              aria-label="Período anterior"
              onClick={() => move(-1)}
            >
              <ChevronLeft size={16} />
            </GlassIconButton>
            <div>
              <select
                id="planning-period"
                aria-label="Tipo de planejamento"
                value={period}
                onChange={(e) => setPeriod(e.target.value as "week" | "month")}
              >
                <option value="week">Planejamento semanal</option>
                <option value="month">Planejamento mensal</option>
              </select>
              <p>
                {new Date(bounds.from + "T12:00:00").toLocaleDateString(
                  "pt-BR",
                )}{" "}
                a{" "}
                {new Date(bounds.to + "T12:00:00").toLocaleDateString("pt-BR")}
              </p>
            </div>
            <GlassIconButton
              id="planning-next-period"
              aria-label="Próximo período"
              onClick={() => move(1)}
            >
              <ChevronRight size={16} />
            </GlassIconButton>
          </div>
          {adding && (
            <form
              id="planning-goal-form"
              className={styles.goalForm}
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget),
                  subjectId = String(f.get("subject")),
                  minutes = Number(f.get("minutes"));
                setStudyPlans([
                  ...studyPlans.filter(
                    (p) =>
                      !(
                        p.subjectId === subjectId &&
                        p.from === bounds.from &&
                        p.to === bounds.to
                      ),
                  ),
                  { id: crypto.randomUUID(), subjectId, minutes, ...bounds },
                ]);
                setAdding(false);
              }}
            >
              <label>
                Matéria
                <select id="planning-goal-subject" name="subject" required>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Meta em minutos
                <input
                  id="planning-goal-minutes"
                  name="minutes"
                  type="number"
                  min="1"
                  max="44640"
                  defaultValue="120"
                  required
                />
              </label>
              <GlassButton
                id="planning-goal-save"
                type="submit"
                variant="primary"
              >
                Salvar meta
              </GlassButton>
              <GlassButton
                id="planning-goal-cancel"
                type="button"
                onClick={() => setAdding(false)}
              >
                Cancelar
              </GlassButton>
            </form>
          )}
          <section id="planning-goals" className={styles.mainSurface}>
            <div className={styles.sectionHeading}>
              <h2>Metas do período</h2>
              <span>
                {plans.reduce((n, p) => n + p.minutes, 0)} min planejados
              </span>
            </div>
            {plans.map((p) => {
              const subject = subjects.find((s) => s.id === p.subjectId),
                seconds = filterSessions(sessions, {
                  subjectId: p.subjectId,
                  ...bounds,
                }).reduce((n, s) => n + s.duration, 0);
              return (
                <article key={p.id} className={styles.progressRow}>
                  <div>
                    <strong>{subject?.name || "Matéria arquivada"}</strong>
                    <span>
                      {formatDuration(seconds)} de {p.minutes} min
                    </span>
                  </div>
                  <progress
                    max={p.minutes * 60}
                    value={seconds}
                    style={{ accentColor: subject?.color }}
                  />
                  <div>
                    <small>
                      {Math.round((seconds / (p.minutes * 60)) * 100)}%
                      concluído
                    </small>
                    <GlassIconButton
                      id={`planning-goal-remove-${p.id}`}
                      aria-label={`Remover meta de ${subject?.name}`}
                      onClick={() =>
                        setStudyPlans(studyPlans.filter((x) => x.id !== p.id))
                      }
                    >
                      <Trash2 size={14} />
                    </GlassIconButton>
                  </div>
                </article>
              );
            })}
            {!plans.length && (
              <p className={styles.emptyNotice}>
                Nenhuma meta para este período. Clique em Nova meta para definir
                sua dedicação.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
