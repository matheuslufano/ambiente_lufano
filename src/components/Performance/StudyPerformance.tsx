import { useEffect, useMemo, useState } from "react";
import {
  Headphones,
  Pause,
  Play,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useStudyStore } from "../../store/useStudyStore";
import { GlassIconButton, GlassSegmentedControl } from "../Glass/Glass";
import styles from "./PerformancePanel.module.css";
export default function StudyPerformance({
  subjectId = "",
  mode = "time",
}: {
  subjectId?: string;
  mode?: "time" | "performance";
}) {
  const { preferences, sessions: allSessions, subjects } = useStudyStore();
  const sessions = allSessions.filter(
    (session) => !subjectId || session.subjectId === subjectId,
  );
  const [period, setPeriod] = useState("year");
  const [metric, setMetric] = useState(
    mode === "performance" ? "questions" : "time",
  );
  useEffect(
    () => setMetric(mode === "performance" ? "questions" : "time"),
    [mode],
  );
  const [year, setYear] = useState(new Date().getFullYear());
  const [grouping, setGrouping] = useState("subjects");
  const [playing, setPlaying] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.5);
  useEffect(
    () => () => {
      if (audio) {
        audio.pause();
        URL.revokeObjectURL(audio.src);
      }
    },
    [audio],
  );
  const filtered = useMemo(
    () =>
      sessions.filter((s) => {
        const d = new Date(s.startedAt);
        const now = new Date();
        if (period === "total") return true;
        if (period === "day") return d.toDateString() === now.toDateString();
        if (period === "month")
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        if (period === "year") return d.getFullYear() === year;
        return s.startedAt >= Date.now() - 7 * 86400000;
      }),
    [sessions, period, year],
  );
  const data =
    grouping === "subjects"
      ? subjects
          .map((subject) => ({
            name: subject.name,
            value: filtered
              .filter((s) => s.subjectId === subject.id)
              .reduce(
                (sum, s) =>
                  sum + (metric === "time" ? s.duration : s.questions),
                0,
              ),
            color: subject.color,
          }))
          .filter((d) => d.value > 0)
      : [...new Set(filtered.map((s) => s.topic))]
          .map((topic, i) => ({
            name: topic,
            value: filtered
              .filter((s) => s.topic === topic)
              .reduce(
                (sum, s) =>
                  sum + (metric === "time" ? s.duration : s.questions),
                0,
              ),
            color:
              subjects[i % Math.max(1, subjects.length)]?.color || "#552088",
          }))
          .filter((d) => d.value > 0);
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div id="study-performance-charts">
      {mode === "performance" && (
        <p className="form-hint">
          Aproveitamento:{" "}
          {sessions.reduce((sum, s) => sum + s.questions, 0)
            ? Math.round(
                (sessions.reduce((sum, s) => sum + s.correct, 0) /
                  sessions.reduce((sum, s) => sum + s.questions, 0)) *
                  100,
              )
            : 0}
          % · {sessions.reduce((sum, s) => sum + s.correct, 0)} acertos em{" "}
          {sessions.reduce((sum, s) => sum + s.questions, 0)} questões.
        </p>
      )}
      <div className={styles.chartGrouping}>
        <label>
          <input
            type="radio"
            name="chart-grouping"
            checked={grouping === "subjects"}
            onChange={() => setGrouping("subjects")}
          />{" "}
          Mat?rias<small>Veja a dura??o agrupada por mat?rias</small>
        </label>
        <label>
          <input
            type="radio"
            name="chart-grouping"
            checked={grouping === "topics"}
            onChange={() => setGrouping("topics")}
          />{" "}
          Conte?dos<small>Veja a dura??o agrupada por t?picos</small>
        </label>
      </div>
      <div className={styles.chartYear}>
        <GlassIconButton
          id="chart-previous-year"
          aria-label="Ano anterior"
          onClick={() => {
            setYear(year - 1);
            setPeriod("year");
          }}
        >
          <ChevronLeft size={16} />
        </GlassIconButton>
        <strong>{year}</strong>
        <GlassIconButton
          id="chart-next-year"
          aria-label="Pr?ximo ano"
          onClick={() => {
            setYear(year + 1);
            setPeriod("year");
          }}
        >
          <ChevronRight size={16} />
        </GlassIconButton>
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={
                total
                  ? data
                  : [
                      {
                        name: "Sem registros",
                        value: 1,
                        color: "var(--chart-empty)",
                      },
                    ]
              }
              innerRadius={0}
              outerRadius={112}
              paddingAngle={0}
              cornerRadius={0}
              dataKey="value"
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {(total ? data : [{ color: "var(--chart-empty)" }]).map(
                (entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ),
              )}
            </Pie>
            {total > 0 && (
              <Tooltip
                formatter={(v) =>
                  metric === "time"
                    ? `${Math.round(Number(v) / 60)} min`
                    : `${v} questões`
                }
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        {!total && (
          <div className={styles.chartCenter}>
            <span>
              {metric === "time"
                ? `${(total / 3600).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}`
                : total}
              <small>{metric === "time" ? "h" : ""}</small>
            </span>
            <small>{total ? "bem investidas" : "seu ponto de partida"}</small>
          </div>
        )}
      </div>
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
      <details className={styles.chartDetails}>
        <summary>Filtros, meta e m?sica</summary>
        <GlassSegmentedControl
          id="chart-metric"
          value={metric}
          onChange={setMetric}
          options={[
            { value: "time", label: "Tempo de estudo" },
            { value: "questions", label: "Quest?es" },
          ]}
        />
        <div className={styles.dailyGoal}>
          <div>
            <span>Meta de hoje</span>
            <strong>
              {Math.min(
                100,
                Math.round(
                  (sessions
                    .filter(
                      (s) =>
                        new Date(s.startedAt).toDateString() ===
                        new Date().toDateString(),
                    )
                    .reduce((a, s) => a + s.duration, 0) /
                    (preferences.dailyHours * 3600)) *
                    100,
                ),
              )}
              %
            </strong>
          </div>
          <progress
            max="100"
            value={Math.min(
              100,
              (sessions
                .filter(
                  (s) =>
                    new Date(s.startedAt).toDateString() ===
                    new Date().toDateString(),
                )
                .reduce((a, s) => a + s.duration, 0) /
                (preferences.dailyHours * 3600)) *
                100,
            )}
          />
          <span>Seu compromisso: {preferences.dailyHours}h por dia</span>
        </div>
        <div className={styles.music}>
          <div className={styles.album}>
            <Headphones size={20} />
          </div>
          <div className={styles.trackInfo}>
            <strong>{file || "Sua trilha de concentração"}</strong>
            <span>
              {file
                ? "Áudio local · neste dispositivo"
                : "Adicione uma música local"}
            </span>
          </div>
          <label className={styles.upload} title="Selecionar música">
            <Plus size={16} />
            <input
              id="music-upload"
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (!selected) return;
                if (audio) {
                  audio.pause();
                  URL.revokeObjectURL(audio.src);
                }
                const next = new Audio(URL.createObjectURL(selected));
                next.volume = volume;
                next.onended = () => setPlaying(false);
                setAudio(next);
                setFile(selected.name);
                setPlaying(false);
              }}
            />
          </label>
          <GlassIconButton
            id="music-play"
            aria-label={playing ? "Pausar música" : "Tocar música"}
            disabled={!audio}
            onClick={() => {
              if (!audio) return;
              if (playing) {
                audio.pause();
                setPlaying(false);
              } else
                audio
                  .play()
                  .then(() => setPlaying(true))
                  .catch(() => setPlaying(false));
            }}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </GlassIconButton>
        </div>
        <input
          id="music-volume"
          className={styles.volume}
          aria-label="Volume da música"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => {
            setVolume(Number(e.target.value));
            if (audio) audio.volume = Number(e.target.value);
          }}
        />
      </details>
    </div>
  );
}
