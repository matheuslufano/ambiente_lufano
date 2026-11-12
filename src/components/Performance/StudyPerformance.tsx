import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStudyStore } from "../../store/useStudyStore";
import { GlassIconButton, GlassSegmentedControl } from "../Glass/Glass";
import {
  buildStudyChartData,
  type StudyChartPeriod,
} from "../../lib/studyChartData";
import type { ProfileMetric } from "./ProfileSummary";
import styles from "./PerformancePanel.module.css";

const chartPalette = [
  "#2878b5",
  "#e07a36",
  "#4b9b70",
  "#bd4f68",
  "#8064a2",
  "#b28b24",
  "#248f94",
  "#d05c32",
  "#5874c2",
  "#8c733f",
  "#3e8b56",
  "#b24f9b",
  "#68747d",
];

export default function StudyPerformance({
  subjectId = "",
  mode = "time",
  activeMetric,
  initialGrouping = "subjects",
}: {
  subjectId?: string;
  mode?: "time" | "performance";
  activeMetric?: ProfileMetric;
  initialGrouping?: "subjects" | "topics";
}) {
  const { sessions: allSessions, subjects, mockExams } = useStudyStore();
  const sessions = allSessions.filter(
    (session) => !subjectId || session.subjectId === subjectId,
  );
  const [period, setPeriod] = useState<StudyChartPeriod>("month");
  const [metric, setMetric] = useState(
    activeMetric ?? (mode === "performance" ? "questions" : "time"),
  );
  useEffect(
    () =>
      setMetric(
        activeMetric ?? (mode === "performance" ? "questions" : "time"),
      ),
    [activeMetric, mode],
  );
  const [year, setYear] = useState(new Date().getFullYear());
  const [grouping, setGrouping] = useState(initialGrouping);
  const chartData = useMemo(
    () =>
      buildStudyChartData(sessions, subjects, {
        period,
        year,
        metric: metric === "time" ? "time" : "questions",
        grouping,
      }),
    [sessions, subjects, period, year, metric, grouping],
  );
  const now = new Date();
  const periodStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 6,
  );
  const examData = mockExams
    .filter((exam) => {
      const date = new Date(exam.completedAt);
      if (period === "total") return true;
      if (period === "day") return date.toDateString() === now.toDateString();
      if (period === "week") return date >= periodStart && date <= now;
      if (period === "month")
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      return date.getFullYear() === year;
    })
    .slice()
    .sort((left, right) => left.completedAt - right.completedAt)
    .map((exam, index) => ({
      id: exam.id,
      name: new Date(exam.completedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      title: exam.title,
      value: Math.round((exam.correct / exam.total) * 100),
      questions: exam.total,
      correct: exam.correct,
      incorrect: exam.total - exam.correct,
      color: chartPalette[index % chartPalette.length],
    }));
  const periodTitle =
    period === "day"
      ? now.toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : period === "week"
        ? `${periodStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}–${now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}`
        : period === "month"
          ? now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
          : period === "year"
            ? String(year)
            : "Todo o período";
  const total = metric === "exams" ? examData.length : chartData.total;
  const attemptedQuestions =
    sessions.reduce((sum, session) => sum + session.questions, 0) +
    mockExams.reduce((sum, exam) => sum + exam.total, 0);
  const correctQuestions =
    sessions.reduce((sum, session) => sum + session.correct, 0) +
    mockExams.reduce((sum, exam) => sum + exam.correct, 0);
  const pieData = chartData.series
    .map((item) => ({
      ...item,
      value: chartData.rows.reduce(
        (sum, row) => sum + Number(row[item.id] || 0),
        0,
      ),
    }))
    .filter((item) => item.value > 0);
  return (
    <div id="study-performance-charts" className={styles.performanceCharts}>
      {mode === "performance" && metric === "questions" && (
        <p className="form-hint">
          Aproveitamento:{" "}
          {attemptedQuestions
            ? Math.round((correctQuestions / attemptedQuestions) * 100)
            : 0}
          % · {correctQuestions} acertos em {attemptedQuestions} questões.
        </p>
      )}
      {metric !== "exams" && (
        <div className={styles.chartGrouping}>
          <label>
            <input
              type="radio"
              name="chart-grouping"
              checked={grouping === "subjects"}
              onChange={() => setGrouping("subjects")}
            />{" "}
            Matérias<small>Veja a duração agrupada por matérias</small>
          </label>
          <label>
            <input
              type="radio"
              name="chart-grouping"
              checked={grouping === "topics"}
              onChange={() => setGrouping("topics")}
            />{" "}
            Conteúdos<small>Veja a duração agrupada por tópicos</small>
          </label>
        </div>
      )}
      <div
        className={`${styles.chartYear} ${period !== "year" ? styles.chartPeriodHeading : ""}`}
      >
        {period === "year" && (
          <GlassIconButton
            id="chart-previous-year"
            aria-label="Ano anterior"
            onClick={() => setYear((value) => value - 1)}
          >
            <ChevronLeft size={16} />
          </GlassIconButton>
        )}
        <strong>
          {metric === "exams" ? `Simulados · ${periodTitle}` : periodTitle}
        </strong>
        {period === "year" && (
          <GlassIconButton
            id="chart-next-year"
            aria-label="Próximo ano"
            onClick={() => setYear((value) => value + 1)}
          >
            <ChevronRight size={16} />
          </GlassIconButton>
        )}
      </div>
      <div className={styles.chart}>
        {metric === "exams" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={examData}
              margin={{ top: 10, right: 8, bottom: 4, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 9 }}
                tickFormatter={(value) => `${value}%`}
                width={34}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const exam = payload[0].payload as (typeof examData)[number];
                  return (
                    <div className={styles.chartTooltip}>
                      <strong>{exam.title || label}</strong>
                      <span>{exam.questions} questões feitas</span>
                      <span>{exam.correct} acertadas</span>
                      <span>{exam.incorrect} erradas</span>
                      <span>{exam.value}% de aproveitamento</span>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" name="Aproveitamento" radius={[4, 4, 0, 0]}>
                {examData.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : metric === "time" ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={
                  pieData.length
                    ? pieData
                    : [
                        {
                          name: "Sem registros",
                          value: 1,
                          color: "var(--chart-empty)",
                        },
                      ]
                }
                dataKey="value"
                nameKey="name"
                outerRadius="90%"
                stroke="none"
              >
                {(pieData.length
                  ? pieData
                  : [{ id: "empty", color: "var(--chart-empty)" }]
                ).map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              {pieData.length > 0 && (
                <Tooltip
                  formatter={(value, name) => [
                    `${Math.round(Number(value))} min`,
                    name,
                  ]}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.rows}
              margin={{ top: 10, right: 8, bottom: 4, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9 }}
                interval={
                  period === "day"
                    ? 2
                    : period === "week" || period === "month"
                      ? 1
                      : 0
                }
              />
              <YAxis
                tick={{ fontSize: 9 }}
                tickFormatter={(value) => String(value)}
                width={36}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const stats = payload.reduce(
                    (totalStats, entry) => {
                      const row =
                        entry.payload as (typeof chartData.rows)[number];
                      const seriesId = String(entry.dataKey || "");
                      const seriesStats = row.questionStatsBySeries[seriesId];
                      if (!seriesStats) return totalStats;
                      return {
                        attempted: totalStats.attempted + seriesStats.attempted,
                        correct: totalStats.correct + seriesStats.correct,
                        incorrect: totalStats.incorrect + seriesStats.incorrect,
                      };
                    },
                    { attempted: 0, correct: 0, incorrect: 0 },
                  );
                  return (
                    <div className={styles.chartTooltip}>
                      <strong>{label}</strong>
                      <span>{stats.attempted} questões feitas</span>
                      <span>{stats.correct} acertadas</span>
                      <span>{stats.incorrect} erradas</span>
                    </div>
                  );
                }}
              />
              {chartData.series.map((item) => (
                <Bar
                  key={item.id}
                  dataKey={item.id}
                  name={item.name}
                  stackId="study"
                  fill={item.color}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
        {!total && (
          <div className={styles.chartCenter}>
            <span>
              {metric === "exams"
                ? 0
                : metric === "time"
                  ? `${(total / 3600).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}`
                  : total}
              <small>{metric === "time" ? "h" : ""}</small>
            </span>
            <small>
              {metric === "exams"
                ? "nenhum simulado neste período"
                : `sem registros · ${periodTitle}`}
            </small>
          </div>
        )}
      </div>
      {metric !== "exams" && (
        <div className={styles.chartLegend} aria-label="Séries do gráfico">
          {(metric === "time" ? pieData : chartData.series).map((item) => (
            <div key={item.id}>
              <i style={{ background: item.color }} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      )}
      <GlassSegmentedControl
        id="chart-period"
        value={period}
        onChange={setPeriod}
        options={[
          { value: "day", label: "Dia" },
          { value: "week", label: "Semana" },
          { value: "month", label: "Mês" },
          { value: "year", label: "Ano" },
          { value: "total", label: "Total" },
        ]}
      />
    </div>
  );
}
