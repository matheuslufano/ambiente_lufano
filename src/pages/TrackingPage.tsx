import { useState } from "react";
import {
  ChartNoAxesCombined,
  ChartPie,
  ChartColumn,
  ListFilter,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStudyStore } from "../store/useStudyStore";
import { dateKey, formatDuration } from "../lib/time";
import {
  filterSessions,
  type SessionFilters as Filters,
} from "../lib/studyInsights";
import StudyHistory from "../components/Performance/StudyHistory";
import SessionFilters from "./SessionFilters";
import styles from "./WorkspacePages.module.css";
export default function TrackingPage() {
  const { sessions, subjects } = useStudyStore();
  const [tab, setTab] = useState("time"),
    [grouping, setGrouping] = useState("subjects");
  const [filters, setFilters] = useState<Filters>(() => {
    const from = new Date();
    from.setDate(from.getDate() - 29);
    return { from: dateKey(from), to: dateKey(new Date()) };
  });
  const filtered = filterSessions(sessions, filters);
  const seconds = filtered.reduce((n, s) => n + s.duration, 0),
    questions = filtered.reduce((n, s) => n + s.questions, 0),
    correct = filtered.reduce((n, s) => n + s.correct, 0);
  const values =
    grouping === "subjects"
      ? subjects.map((s) => ({
          name: s.name,
          color: s.color,
          value: filtered
            .filter((row) => row.subjectId === s.id)
            .reduce((n, row) => n + row.duration, 0),
        }))
      : [...new Set(filtered.map((s) => s.topic))].map((topic, index) => ({
          name: topic,
          color:
            subjects[index % Math.max(1, subjects.length)]?.color || "#3989b5",
          value: filtered
            .filter((s) => s.topic === topic)
            .reduce((n, s) => n + s.duration, 0),
        }));
  const pie = values.filter((d) => d.value > 0);
  const timeline = [...new Set(filtered.map((s) => s.date))]
    .sort()
    .map((date) => ({
      date,
      ...Object.fromEntries(
        subjects.map((subject) => [
          subject.id,
          Math.round(
            filtered
              .filter((s) => s.date === date && s.subjectId === subject.id)
              .reduce((n, s) => n + s.duration, 0) / 60,
          ),
        ]),
      ),
    }));
  return (
    <main id="tracking-page" className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Acompanhamento</h1>
          <p>
            Analise sua dedicação e descubra como está distribuindo seu tempo.
          </p>
        </div>
      </div>
      <nav
        id="tracking-tabs"
        className={styles.pageTabs}
        aria-label="Gráficos de acompanhamento"
      >
        {[
          { id: "performance", name: "Desempenho", icon: ChartNoAxesCombined },
          { id: "timeline", name: "Linha do tempo", icon: ChartColumn },
          { id: "time", name: "Tempo de estudo", icon: ChartPie },
        ].map((t) => (
          <button
            id={`tracking-tab-${t.id}`}
            key={t.id}
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={16} />
            {t.name}
          </button>
        ))}
      </nav>
      <div className={styles.sidebarLayout}>
        <SessionFilters
          prefix="tracking"
          value={filters}
          onChange={setFilters}
        />
        <div>
          <div className={styles.metrics}>
            <article>
              <span>Tempo líquido</span>
              <strong>{formatDuration(seconds)}</strong>
            </article>
            <article>
              <span>Atividades</span>
              <strong>{filtered.length}</strong>
            </article>
            <article>
              <span>Questões</span>
              <strong>{questions}</strong>
            </article>
            <article>
              <span>Acertos</span>
              <strong>
                {questions ? Math.round((correct / questions) * 100) : 0}%
              </strong>
            </article>
          </div>
          {tab === "time" && (
            <section id="tracking-time-chart" className={styles.mainSurface}>
              <div className={styles.sectionHeading}>
                <h2>Tempo de estudo</h2>
                <label className={styles.inlineLabel}>
                  <ListFilter size={14} /> Agrupar por
                  <select
                    id="tracking-grouping"
                    value={grouping}
                    onChange={(e) => setGrouping(e.target.value)}
                  >
                    <option value="subjects">Matérias</option>
                    <option value="topics">Conteúdos</option>
                  </select>
                </label>
              </div>
              {pie.length ? (
                <>
                  <ResponsiveContainer width="100%" height={340}>
                    <PieChart>
                      <Pie
                        data={pie}
                        dataKey="value"
                        nameKey="name"
                        outerRadius="85%"
                        stroke="none"
                      >
                        {pie.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatDuration(Number(v))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.tableScroll}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Matéria / Conteúdo</th>
                          <th>Tempo</th>
                          <th>Participação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pie.map((d) => (
                          <tr key={d.name}>
                            <td>{d.name}</td>
                            <td>{formatDuration(d.value)}</td>
                            <td>{Math.round((d.value / seconds) * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className={styles.emptyNotice}>
                  Não há tempo registrado para os filtros selecionados.
                </p>
              )}
            </section>
          )}
          {tab === "timeline" && (
            <section
              id="tracking-timeline-chart"
              className={styles.mainSurface}
            >
              <h2>Linha do tempo</h2>
              <p className="form-hint">
                Minutos dedicados a cada matéria por dia estudado.
              </p>
              {timeline.length ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={timeline}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        String(date).slice(5).split("-").reverse().join("/")
                      }
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis unit=" min" tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(v, name) => [
                        `${v} min`,
                        subjects.find((s) => s.id === name)?.name || name,
                      ]}
                    />
                    <Legend
                      formatter={(name) =>
                        subjects.find((s) => s.id === name)?.name || name
                      }
                    />
                    {subjects
                      .filter((s) =>
                        filtered.some((row) => row.subjectId === s.id),
                      )
                      .map((s) => (
                        <Bar
                          key={s.id}
                          dataKey={s.id}
                          stackId="study"
                          fill={s.color}
                        />
                      ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className={styles.emptyNotice}>
                  Conclua um estudo para acompanhar sua evolução.
                </p>
              )}
            </section>
          )}
          {tab === "performance" && (
            <section id="tracking-performance" className={styles.mainSurface}>
              <h2>Desempenho por matéria</h2>
              <div className={styles.tableScroll}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Matéria</th>
                      <th>Questões</th>
                      <th>Acertos</th>
                      <th>Aproveitamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects
                      .filter((s) =>
                        filtered.some((row) => row.subjectId === s.id),
                      )
                      .map((s) => {
                        const rows = filtered.filter(
                            (row) => row.subjectId === s.id,
                          ),
                          q = rows.reduce((n, r) => n + r.questions, 0),
                          c = rows.reduce((n, r) => n + r.correct, 0);
                        return (
                          <tr key={s.id}>
                            <td>{s.name}</td>
                            <td>{q}</td>
                            <td>{c}</td>
                            <td>{q ? `${Math.round((c / q) * 100)}%` : "—"}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              {!filtered.length && (
                <p className={styles.emptyNotice}>
                  Nenhum registro neste período.
                </p>
              )}
              <details className={styles.subjectDetails}>
                <summary>
                  Registrar e consultar simulados · todos os períodos
                </summary>
                <StudyHistory exams idPrefix="tracking" />
              </details>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
