import type { StudySession } from "../types";

export type StudyChartPeriod = "day" | "week" | "month" | "year" | "total";
export type StudyChartMetric = "time" | "questions";
export type StudyChartGrouping = "subjects" | "topics";

export interface StudyChartSubject {
  id: string;
  name: string;
  color: string;
}

export interface StudyChartSeries {
  id: string;
  name: string;
  color: string;
}

export interface StudyQuestionBreakdown {
  attempted: number;
  correct: number;
  incorrect: number;
}

export interface StudyChartRow {
  key: string;
  name: string;
  questionStatsBySeries: Record<string, StudyQuestionBreakdown>;
  [seriesId: string]: number | string | Record<string, StudyQuestionBreakdown>;
}

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

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function periodBuckets(
  period: StudyChartPeriod,
  year: number,
  now: Date,
  sessions: StudySession[],
) {
  if (period === "day")
    return Array.from({ length: 24 }, (_, hour) => ({
      key: `hour-${hour}`,
      name: `${String(hour).padStart(2, "0")}h`,
    }));

  if (period === "week") {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 6 + index,
      );
      return {
        key: `day-${localDateKey(date)}`,
        name: date.toLocaleDateString("pt-BR", {
          weekday: "short",
          day: "2-digit",
        }),
      };
    });
  }

  if (period === "month") {
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: days }, (_, index) => ({
      key: `day-${localDateKey(new Date(now.getFullYear(), now.getMonth(), index + 1))}`,
      name: String(index + 1),
    }));
  }

  if (period === "year")
    return Array.from({ length: 12 }, (_, month) => ({
      key: `month-${year}-${month}`,
      name: new Date(year, month, 1).toLocaleDateString("pt-BR", {
        month: "short",
      }),
    }));

  const years = sessions.map((session) =>
    new Date(session.startedAt).getFullYear(),
  );
  const firstYear = years.length ? Math.min(...years) : now.getFullYear();
  const lastYear = Math.max(
    now.getFullYear(),
    ...(years.length ? years : [now.getFullYear()]),
  );
  return Array.from({ length: lastYear - firstYear + 1 }, (_, index) => {
    const bucketYear = firstYear + index;
    return { key: `year-${bucketYear}`, name: String(bucketYear) };
  });
}

function sessionBucketKey(session: StudySession, period: StudyChartPeriod) {
  const date = new Date(session.startedAt);
  if (period === "day") return `hour-${date.getHours()}`;
  if (period === "week" || period === "month")
    return `day-${localDateKey(date)}`;
  if (period === "year")
    return `month-${date.getFullYear()}-${date.getMonth()}`;
  return `year-${date.getFullYear()}`;
}

export function buildStudyChartData(
  sessions: StudySession[],
  subjects: StudyChartSubject[],
  options: {
    period: StudyChartPeriod;
    year: number;
    metric: StudyChartMetric;
    grouping: StudyChartGrouping;
    now?: Date;
  },
) {
  const now = options.now ?? new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 6,
  );
  const relevantSessions = sessions.filter((session) => {
    const date = new Date(session.startedAt);
    if (options.period === "total") return true;
    if (options.period === "day")
      return localDateKey(date) === localDateKey(now);
    if (options.period === "week")
      return (
        date >= weekStart && date < new Date(dayStart.getTime() + 86_400_000)
      );
    if (options.period === "month")
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    return date.getFullYear() === options.year;
  });
  const buckets = periodBuckets(
    options.period,
    options.year,
    now,
    relevantSessions,
  );
  const usedColors = new Set<string>();
  const series: StudyChartSeries[] =
    options.grouping === "subjects"
      ? subjects.map((subject, index) => {
          const preferred = subject.color.toLowerCase();
          const color = !usedColors.has(preferred)
            ? preferred
            : (chartPalette.find((candidate) => !usedColors.has(candidate)) ??
              chartPalette[index % chartPalette.length]);
          usedColors.add(color);
          return { id: subject.id, name: subject.name, color };
        })
      : [
          ...new Set(
            relevantSessions.map(
              (session) => session.topic.trim() || "Sem tópico",
            ),
          ),
        ].map((topic, index) => ({
          id: `topic-${index}`,
          name: topic,
          color: chartPalette[index % chartPalette.length],
        }));

  const topicIds = new Map(series.map((item) => [item.name, item.id]));
  const rows: StudyChartRow[] = buckets.map((bucket) => ({
    ...bucket,
    ...Object.fromEntries(series.map((item) => [item.id, 0])),
    questionStatsBySeries: Object.fromEntries(
      series.map((item) => [
        item.id,
        { attempted: 0, correct: 0, incorrect: 0 },
      ]),
    ),
  }));
  const rowByKey = new Map(rows.map((row) => [row.key, row]));

  relevantSessions.forEach((session) => {
    const row = rowByKey.get(sessionBucketKey(session, options.period));
    const topic = session.topic.trim() || "Sem tópico";
    const seriesId =
      options.grouping === "subjects" ? session.subjectId : topicIds.get(topic);
    if (!row || !seriesId || typeof row[seriesId] !== "number") return;
    row[seriesId] =
      Number(row[seriesId]) +
      (options.metric === "time" ? session.duration / 60 : session.questions);
    const stats = row.questionStatsBySeries[seriesId];
    stats.attempted += session.questions;
    stats.correct += session.correct;
    stats.incorrect += session.questions - session.correct;
  });

  const total = series.reduce(
    (sum, item) =>
      sum +
      rows.reduce((rowTotal, row) => rowTotal + Number(row[item.id] || 0), 0),
    0,
  );
  return { rows, series, total };
}
