import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  Library,
  Play,
} from "lucide-react";
import { GlassButton, GlassIconButton } from "../components/Glass/Glass";
import { useStudyStore } from "../store/useStudyStore";
import { dateKey, formatDuration } from "../lib/time";
import {
  filterSessions,
  type SessionFilters as Filters,
} from "../lib/studyInsights";
import SessionFilters from "./SessionFilters";
import styles from "./WorkspacePages.module.css";
export default function ActivitiesPage({ onStudy }: { onStudy: () => void }) {
  const { sessions, subjects, subjectGroups } = useStudyStore();
  const [tab, setTab] = useState("calendar"),
    [cursor, setCursor] = useState(new Date()),
    [day, setDay] = useState(""),
    [filters, setFilters] = useState<Filters>({});
  const filtered = filterSessions(sessions, filters).sort(
    (a, b) => b.startedAt - a.startedAt,
  );
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1),
    count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = Array.from(
    { length: Math.ceil((first.getDay() + count) / 7) * 7 },
    (_, i) => {
      const d = new Date(first);
      d.setDate(1 - first.getDay() + i);
      return d;
    },
  );
  const records =
    tab === "calendar"
      ? day
        ? filtered.filter((s) => s.date === day)
        : filtered.slice(0, 8)
      : filtered;
  return (
    <main id="activities-page" className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Atividades</h1>
          <p>Registre seus estudos e acompanhe seu histórico.</p>
        </div>
        <GlassButton
          id="activities-start-study"
          variant="primary"
          onClick={onStudy}
        >
          <Play size={15} /> Cadastrar nova atividade
        </GlassButton>
      </div>
      <nav
        id="activities-tabs"
        className={styles.pageTabs}
        aria-label="Visualização de atividades"
      >
        {[
          { id: "calendar", name: "Calendário", icon: CalendarDays },
          { id: "history", name: "Histórico", icon: List },
          { id: "subjects", name: "Matérias", icon: Library },
        ].map((t) => (
          <button
            key={t.id}
            id={`activities-tab-${t.id}`}
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={16} />
            {t.name}
          </button>
        ))}
      </nav>
      {tab === "subjects" ? (
        <section id="activities-subjects" className={styles.list}>
          {subjectGroups.map((g) => (
            <div key={g.id}>
              <h2>{g.name}</h2>
              {subjects
                .filter((s) => s.groupId === g.id)
                .map((s) => (
                  <details key={s.id} className={styles.subjectDetails}>
                    <summary>
                      <i style={{ background: s.color }} />
                      {s.name}
                      <small>{s.topics.length} conteúdos</small>
                    </summary>
                    {s.topics.length ? (
                      <ol>
                        {s.topics.map((topic, i) => (
                          <li key={i}>{topic}</li>
                        ))}
                      </ol>
                    ) : (
                      <p>
                        Sem conteúdos cadastrados. Edite no objetivo da página
                        Início.
                      </p>
                    )}
                  </details>
                ))}
            </div>
          ))}
        </section>
      ) : (
        <div className={styles.sidebarLayout}>
          <SessionFilters
            prefix="activities"
            value={filters}
            onChange={setFilters}
          />
          <div className={styles.mainSurface}>
            {tab === "calendar" && (
              <section id="activities-calendar">
                <div className={styles.periodNav}>
                  <GlassIconButton
                    id="activities-previous-month"
                    aria-label="Mês anterior"
                    onClick={() => {
                      setCursor(
                        new Date(
                          cursor.getFullYear(),
                          cursor.getMonth() - 1,
                          1,
                        ),
                      );
                      setDay("");
                    }}
                  >
                    <ChevronLeft size={17} />
                  </GlassIconButton>
                  <h2>
                    {cursor.toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <GlassIconButton
                    id="activities-next-month"
                    aria-label="Próximo mês"
                    onClick={() => {
                      setCursor(
                        new Date(
                          cursor.getFullYear(),
                          cursor.getMonth() + 1,
                          1,
                        ),
                      );
                      setDay("");
                    }}
                  >
                    <ChevronRight size={17} />
                  </GlassIconButton>
                </div>
                <div className={styles.activityCalendar}>
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                    (d) => (
                      <strong key={d}>{d}</strong>
                    ),
                  )}
                  {cells.map((d) => {
                    const key = dateKey(d),
                      list = filtered.filter((s) => s.date === key);
                    return (
                      <button
                        id={`activities-day-${key}`}
                        key={key}
                        data-outside={d.getMonth() !== cursor.getMonth()}
                        data-studied={!!list.length}
                        aria-pressed={day === key}
                        aria-label={`${d.toLocaleDateString("pt-BR")}: ${list.length} atividades`}
                        onClick={() => setDay(day === key ? "" : key)}
                      >
                        <span>{d.getDate()}</span>
                        {!!list.length && (
                          <>
                            <small>{list.length} ativ.</small>
                            <small>
                              <Clock3 size={10} />
                              {formatDuration(
                                list.reduce((n, s) => n + s.duration, 0),
                              )}
                            </small>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
            <div className={styles.sectionHeading}>
              <h2>
                {day && tab === "calendar"
                  ? `Atividades de ${new Date(day + "T12:00:00").toLocaleDateString("pt-BR")}`
                  : tab === "history"
                    ? "Histórico de atividades"
                    : "Últimas atividades"}
              </h2>
              <span>{records.length} registros</span>
            </div>
            <div className={styles.tableScroll}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Matéria / Conteúdo</th>
                    <th>Início</th>
                    <th>Duração</th>
                    <th>Questões</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>
                          {subjects.find((x) => x.id === s.subjectId)?.name ||
                            "Matéria arquivada"}
                        </strong>
                        <small>{s.topic}</small>
                        {s.summary && (
                          <details>
                            <summary>Anotações</summary>
                            <p>{s.summary}</p>
                          </details>
                        )}
                      </td>
                      <td>
                        {new Date(s.startedAt).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td>{formatDuration(s.duration)}</td>
                      <td>
                        {s.correct}/{s.questions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!records.length && (
              <p className={styles.emptyNotice}>
                Nenhuma atividade para este período.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
