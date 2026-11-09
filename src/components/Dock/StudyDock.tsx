import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  ChevronLeft,
  Coffee,
  Mic,
  Pause,
  Play,
  Settings,
  Square,
  Timer,
} from "lucide-react";
import { useStudyStore } from "../../store/useStudyStore";
import { elapsedSeconds, formatDuration } from "../../lib/time";
import { GlassButton, GlassIconButton, GlassModal } from "../Glass/Glass";
import styles from "./StudyDock.module.css";
function TomatoDockIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="currentColor"
        d="M23 12C7 9 3 24 6 34c4 15 32 15 36 0 3-10-1-25-17-22l-1-7-3 1z"
      />
      <path
        d="m13 11 9 3 3-8 2 8 9-3-6 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
export type Tool =
  "audio" | "pomodoro" | "notebooks" | "flashcards" | "settings" | null;
export default function StudyDock({
  tool,
  onTool,
  startRequest = 0,
  requestedSubject,
}: {
  tool: Tool;
  onTool: (tool: Tool) => void;
  startRequest?: number;
  requestedSubject?: string;
}) {
  const { subjects, active, start, togglePause, finish } = useStudyStore();
  const [mode, setMode] = useState<"dock" | "start" | "books" | "session">(
    "dock",
  );
  const [subject, setSubject] = useState(subjects[0]?.id || "");
  const [finishOpen, setFinishOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [questions, setQuestions] = useState(0);
  const [correct, setCorrect] = useState(0);
  const handledRequest = useRef(0);
  useEffect(() => {
    if (startRequest !== handledRequest.current) {
      handledRequest.current = startRequest;
      if (
        requestedSubject &&
        subjects.some((item) => item.id === requestedSubject)
      )
        setSubject(requestedSubject);
      setMode(active ? "session" : "start");
    }
  }, [startRequest, active, requestedSubject, subjects]);
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    if (!subjects.some((s) => s.id === subject))
      setSubject(subjects[0]?.id || "");
  }, [subjects, subject]);
  const tools = [
    {
      id: "start",
      label: active ? "Sessão em andamento" : "Iniciar estudo",
      icon: Play,
      action: () => setMode(active ? "session" : "start"),
    },
    {
      id: "audio",
      label: "Biblioteca de áudios",
      icon: Mic,
      action: () => onTool(tool === "audio" ? null : "audio"),
    },
    {
      id: "pomodoro",
      label: "Pomodoro",
      icon: TomatoDockIcon,
      action: () => onTool(tool === "pomodoro" ? null : "pomodoro"),
    },
    {
      id: "books",
      label: "Cadernos e flashcards",
      icon: BookOpen,
      action: () => setMode(mode === "books" ? "dock" : "books"),
    },
    {
      id: "settings",
      label: "Configurações",
      icon: Settings,
      action: () => onTool(tool === "settings" ? null : "settings"),
    },
  ];
  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            id="active-study-island"
            className={styles.activeIsland}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
          >
            <span
              className={styles.pulse}
              data-paused={active.runningSince === null}
            />
            <div>
              <strong>
                {subjects.find((s) => s.id === active.subjectId)?.name ||
                  "Disciplina arquivada"}
              </strong>
              <span>{active.topic}</span>
            </div>
            <time aria-label="Tempo de estudo">
              {formatDuration(elapsedSeconds(active, now))}
            </time>
            <GlassIconButton
              id="session-pause"
              aria-label={
                active.runningSince === null
                  ? "Retomar estudo"
                  : "Pausar estudo"
              }
              onClick={togglePause}
            >
              {active.runningSince === null ? (
                <Play size={14} />
              ) : (
                <Pause size={14} />
              )}
            </GlassIconButton>
            <GlassIconButton
              id="session-finish"
              aria-label="Encerrar estudo"
              onClick={() => setFinishOpen(true)}
            >
              <Square size={12} />
            </GlassIconButton>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.dockArea}>
        <AnimatePresence>
          {mode === "books" && (
            <motion.div
              className={styles.bookOptions}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
            >
              <GlassButton
                id="dock-notebooks"
                onClick={() => {
                  onTool("notebooks");
                  setMode("dock");
                }}
              >
                <BookOpen size={15} /> Cadernos
              </GlassButton>
              <GlassButton
                id="dock-flashcards"
                onClick={() => {
                  onTool("flashcards");
                  setMode("dock");
                }}
              >
                <Coffee size={15} /> Flashcards
              </GlassButton>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.nav
          layout
          id="study-dynamic-dock"
          className={styles.dock}
          aria-label="Ferramentas de estudo"
          transition={{ type: "spring", stiffness: 260, damping: 27 }}
        >
          {mode === "session" && active ? (
            <div
              id="dock-active-session-controls"
              className={styles.sessionControls}
            >
              <GlassIconButton
                id="dock-active-session-back"
                aria-label="Voltar às ferramentas"
                onClick={() => setMode("dock")}
              >
                <ChevronLeft size={17} />
              </GlassIconButton>
              <div>
                <strong>
                  {subjects.find((s) => s.id === active.subjectId)?.name ||
                    "Disciplina arquivada"}
                </strong>
                <span>{active.topic}</span>
                <time>{formatDuration(elapsedSeconds(active, now))}</time>
              </div>
              <GlassIconButton
                id="dock-active-session-pause"
                aria-label={
                  active.runningSince === null
                    ? "Retomar estudo"
                    : "Pausar estudo"
                }
                onClick={togglePause}
              >
                {active.runningSince === null ? (
                  <Play size={16} />
                ) : (
                  <Pause size={16} />
                )}
              </GlassIconButton>
              <GlassButton
                id="dock-active-session-finish"
                onClick={() => {
                  setMode("dock");
                  setFinishOpen(true);
                }}
              >
                <Square size={13} /> Encerrar
              </GlassButton>
            </div>
          ) : mode === "start" ? (
            <motion.form
              key="start"
              className={styles.startForm}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setMode("dock");
                }
              }}
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                start(subject, String(data.get("topic")));
                setMode("dock");
              }}
            >
              <GlassIconButton
                id="dock-cancel-start"
                aria-label="Voltar"
                type="button"
                onClick={() => setMode("dock")}
              >
                <ChevronLeft size={17} />
              </GlassIconButton>
              <label>
                DISCIPLINA
                <select
                  id="session-subject-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                ASSUNTO
                <select
                  id="session-topic-select"
                  name="topic"
                  key={subject}
                  required
                >
                  {subjects
                    .find((s) => s.id === subject)
                    ?.topics.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  {!subjects.find((s) => s.id === subject)?.topics.length && (
                    <option value="Estudo geral">
                      Estudo geral — sem tópicos cadastrados
                    </option>
                  )}
                </select>
              </label>
              <GlassButton
                id="session-start-button"
                variant="primary"
                type="submit"
                disabled={!subjects.some((s) => s.id === subject)}
              >
                <Play size={14} /> Iniciar
              </GlassButton>
            </motion.form>
          ) : (
            <div className={styles.tools}>
              {tools.map(({ id, label, icon: Icon, action }) => (
                <button
                  id={`dock-${id}`}
                  key={id}
                  aria-label={label}
                  aria-pressed={id === tool}
                  onClick={action}
                  className={styles.dockButton}
                >
                  <span className={styles.tooltip}>{label}</span>
                  <span className={styles.appIcon} data-tool={id}>
                    <Icon size={24} strokeWidth={1.7} />
                  </span>
                  {(id === tool || (id === "start" && !!active)) && (
                    <span className={styles.activeDot} />
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.nav>
      </div>
      <GlassModal
        id="session-finish-modal"
        title="Mais um passo dado."
        description="Registre o que aprendeu para concluir a sessão. Você pode informar zero questões."
        open={finishOpen && !!active}
        onClose={() => setFinishOpen(false)}
      >
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            finish(String(data.get("summary")), questions, correct);
            setFinishOpen(false);
            setQuestions(0);
            setCorrect(0);
          }}
        >
          <div className={styles.sessionSummary}>
            <ClockIcon />
            <span>Tempo dedicado</span>
            <strong>
              {active
                ? formatDuration(elapsedSeconds(active, now))
                : "00:00:00"}
            </strong>
          </div>
          <label>
            O que você aprendeu?
            <textarea
              id="session-learning-summary"
              name="summary"
              required
              rows={4}
              placeholder="Escreva um breve resumo do seu estudo…"
            />
          </label>
          <div className="form-row">
            <label>
              Questões realizadas
              <input
                id="session-questions"
                type="number"
                min="0"
                required
                value={questions}
                onChange={(e) => {
                  const n = Math.max(0, Number(e.target.value));
                  setQuestions(n);
                  setCorrect(Math.min(correct, n));
                }}
              />
            </label>
            <label>
              Acertos
              <input
                id="session-correct"
                type="number"
                min="0"
                max={questions}
                required
                value={correct}
                onChange={(e) => setCorrect(Number(e.target.value))}
              />
            </label>
          </div>
          <p className="form-hint">
            {questions - correct} erros ·{" "}
            {questions ? Math.round((correct / questions) * 100) : 0}% de
            aproveitamento
          </p>
          <GlassButton id="session-save-button" type="submit" variant="primary">
            Salvar sessão
          </GlassButton>
        </form>
      </GlassModal>
    </>
  );
}
function ClockIcon() {
  return <Timer size={20} />;
}
