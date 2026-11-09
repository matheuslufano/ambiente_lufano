import { lazy, Suspense, useEffect, useState } from "react";
import { Coffee, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useStudyStore } from "../../store/useStudyStore";
import { remainingSeconds } from "../../lib/time";
import {
  GlassButton,
  GlassIconButton,
  GlassSegmentedControl,
} from "../Glass/Glass";
import styles from "./PomodoroPanel.module.css";
const TomatoScene = lazy(() => import("./TomatoScene"));
interface PomodoroState {
  endAt: number | null;
  remaining: number;
  total: number;
  cycle: number;
  mode: "focus" | "short" | "long";
  completed: boolean;
}
const key = "lufano-pomodoro-v1";
function initialState(minutes: number): PomodoroState {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    if (
      parsed &&
      typeof parsed.remaining === "number" &&
      typeof parsed.total === "number" &&
      ["focus", "short", "long"].includes(parsed.mode)
    )
      return parsed;
  } catch {}
  return {
    endAt: null,
    remaining: minutes * 60,
    total: minutes * 60,
    cycle: 0,
    mode: "focus",
    completed: false,
  };
}
export default function PomodoroPanel() {
  const { preferences, active, togglePause } = useStudyStore();
  const [timer, setTimer] = useState(() =>
    initialState(preferences.focusMinutes),
  );
  const [now, setNow] = useState(Date.now());
  const [message, setMessage] = useState("");
  const remaining = remainingSeconds(timer.endAt, timer.remaining, now);
  const running = timer.endAt !== null;
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(timer));
  }, [timer]);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (timer.endAt !== null && remaining === 0) {
      setTimer((t) => ({
        ...t,
        endAt: null,
        remaining: 0,
        completed: true,
        cycle: t.mode === "focus" ? t.cycle + 1 : t.cycle,
      }));
      if (timer.mode === "focus" && active?.runningSince !== null && active)
        togglePause();
      setMessage(
        timer.mode === "focus"
          ? "Ciclo concluído. Salve sua sessão na ilha superior e faça uma pausa."
          : "Pausa concluída. Vamos para o próximo passo?",
      );
    }
  }, [remaining, timer.endAt, timer.mode, active, togglePause]);
  function changeMode(mode: "focus" | "short" | "long") {
    const minutes =
      mode === "focus" ? preferences.focusMinutes : mode === "short" ? 5 : 15;
    setTimer((t) => ({
      ...t,
      mode,
      total: minutes * 60,
      remaining: minutes * 60,
      endAt: null,
      completed: false,
    }));
    setMessage("");
  }
  return (
    <div id="pomodoro-tool" className={styles.panel}>
      <div
        className={styles.tomato}
        onPointerDown={(e) => {
          if (running) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.dataset.startX = String(e.clientX);
          e.currentTarget.dataset.startMinutes = String(timer.total / 60);
        }}
        onPointerMove={(e) => {
          if (running || !e.currentTarget.hasPointerCapture(e.pointerId))
            return;
          const minutes = Math.min(
            90,
            Math.max(
              1,
              Math.round(
                Number(e.currentTarget.dataset.startMinutes) +
                  (e.clientX - Number(e.currentTarget.dataset.startX)) / 5,
              ),
            ),
          );
          setTimer((t) => ({
            ...t,
            total: minutes * 60,
            remaining: minutes * 60,
          }));
        }}
        aria-label="Tomate 3D. Arraste horizontalmente para ajustar a duração."
        role="img"
      >
        <Suspense fallback={<Timer size={50} />}>
          <TomatoScene progress={1 - remaining / timer.total} />
        </Suspense>
      </div>
      <p className={styles.dragHint}>
        {running
          ? "Seu tempo, no ritmo certo."
          : "Arraste o tomate para ajustar o tempo"}
      </p>
      <div className={styles.cycleDots}>
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} data-complete={i < timer.cycle % 5} />
        ))}
      </div>
      <span className={styles.cycleLabel}>
        CICLO {Math.min(4, (timer.cycle % 4) + 1)} DE 4
      </span>
      <div className={styles.controls}>
        <GlassButton
          id="pomodoro-toggle"
          aria-label={running ? "Pausar Pomodoro" : "Iniciar Pomodoro"}
          onClick={() => {
            const current = remainingSeconds(timer.endAt, timer.remaining);
            if (running) {
              setTimer((t) => ({ ...t, endAt: null, remaining: current }));
            } else {
              const seconds = current || timer.total;
              setNow(Date.now());
              setTimer((t) => ({
                ...t,
                endAt: Date.now() + seconds * 1000,
                remaining: seconds,
                completed: false,
              }));
            }
          }}
        >
          {running ? <Pause size={15} /> : <Play size={15} />}
        </GlassButton>
        <div className={styles.timer} role="timer" aria-label="Tempo restante">
          {String(Math.floor(remaining / 60)).padStart(2, "0")}
          <span>:</span>
          {String(remaining % 60).padStart(2, "0")}
        </div>
      </div>
      <details className={styles.options}>
        <summary>Ajustar Pomodoro</summary>
        <GlassSegmentedControl
          id="pomodoro-mode"
          value={timer.mode}
          onChange={changeMode}
          options={[
            { value: "focus", label: "Foco" },
            { value: "short", label: "Pausa" },
            { value: "long", label: "Pausa longa" },
          ]}
        />
        <GlassIconButton
          id="pomodoro-reset"
          aria-label="Reiniciar Pomodoro"
          onClick={() => {
            changeMode(timer.mode);
          }}
        >
          <RotateCcw size={16} />
        </GlassIconButton>

        <label className={styles.durationLabel}>
          Duração em minutos
          <input
            id="pomodoro-duration"
            type="range"
            min="1"
            max="90"
            disabled={running}
            value={timer.total / 60}
            onChange={(e) =>
              setTimer((t) => ({
                ...t,
                total: Number(e.target.value) * 60,
                remaining: Number(e.target.value) * 60,
              }))
            }
          />
          <span>{timer.total / 60} min</span>
        </label>
      </details>
      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}
      <div className={styles.integration}>
        <Coffee size={18} />
        <p>
          O Pomodoro controla seu foco. Inicie uma sessão de estudo para
          registrar esse tempo nas estatísticas, sem duplicação.
        </p>
      </div>
    </div>
  );
}
