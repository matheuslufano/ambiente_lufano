import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  Layers,
  PawPrint,
  Mic,
  Pause,
  Play,
  Settings,
  Square,
  Timer,
} from "lucide-react";
import { useStudyStore } from "../../store/useStudyStore";
import { elapsedSeconds, formatDuration } from "../../lib/time";
import { db } from "../../lib/db";
import { GlassButton, GlassIconButton, GlassModal } from "../Glass/Glass";
import styles from "./StudyDock.module.css";
const ACTIVE_ISLAND_POSITION_KEY = "lufano.active-study-island-position";
interface IslandPosition {
  x: number;
  y: number;
}
function readIslandPosition(): IslandPosition {
  try {
    const stored = window.localStorage.getItem(ACTIVE_ISLAND_POSITION_KEY);
    if (!stored) return { x: 0, y: 0 };
    const parsed: unknown = JSON.parse(stored);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "x" in parsed &&
      "y" in parsed &&
      typeof parsed.x === "number" &&
      Number.isFinite(parsed.x) &&
      typeof parsed.y === "number" &&
      Number.isFinite(parsed.y)
    )
      return { x: parsed.x, y: parsed.y };
  } catch {
    return { x: 0, y: 0 };
  }
  return { x: 0, y: 0 };
}
function saveIslandPosition(position: IslandPosition) {
  try {
    window.localStorage.setItem(
      ACTIVE_ISLAND_POSITION_KEY,
      JSON.stringify(position),
    );
  } catch {
    // The island remains draggable if browser storage is unavailable.
  }
}
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
  "audio" | "pomodoro" | "notebooks" | "flashcards" | "pet" | "settings" | null;
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
  const [mode, setMode] = useState<"dock" | "start" | "session">("dock");
  const [subject, setSubject] = useState(subjects[0]?.id || "");
  const [topic, setTopic] = useState(subjects[0]?.topics[0] || "Estudo geral");
  const [openPicker, setOpenPicker] = useState<"subject" | "topic" | null>(
    null,
  );
  const [finishOpen, setFinishOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [questions, setQuestions] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [sessionAudio, setSessionAudio] = useState<Blob | null>(null);
  const [audioRecording, setAudioRecording] = useState(false);
  const [islandMessage, setIslandMessage] = useState("");
  const [islandPosition, setIslandPosition] =
    useState<IslandPosition>(readIslandPosition);
  const handledRequest = useRef(0);
  const finishRecorder = useRef<MediaRecorder | null>(null);
  const finishStream = useRef<MediaStream | null>(null);
  const islandRef = useRef<HTMLDivElement>(null);
  const islandAnchorRef = useRef<HTMLDivElement>(null);
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
    return () => {
      clearInterval(i);
      if (finishRecorder.current?.state !== "inactive")
        finishRecorder.current?.stop();
      finishStream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);
  useEffect(() => {
    if (!subjects.some((s) => s.id === subject))
      setSubject(subjects[0]?.id || "");
  }, [subjects, subject]);
  useEffect(() => {
    const availableTopics =
      subjects.find((item) => item.id === subject)?.topics ?? [];
    if (!availableTopics.includes(topic))
      setTopic(availableTopics[0] || "Estudo geral");
  }, [subjects, subject, topic]);
  async function toggleSessionAudioRecording() {
    if (finishRecorder.current?.state === "recording") {
      finishRecorder.current.stop();
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw new Error("Este navegador não oferece gravação de áudio.");
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(media);
      const chunks: BlobPart[] = [];
      finishStream.current = media;
      finishRecorder.current = recorder;
      setSessionAudio(null);
      setIslandMessage("");
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        media.getTracks().forEach((track) => track.stop());
        finishStream.current = null;
        const recording = new Blob(chunks, {
          type: recorder.mimeType || "audio/webm",
        });
        if (recording.size) setSessionAudio(recording);
        setAudioRecording(false);
      };
      recorder.start();
      setAudioRecording(true);
    } catch (error) {
      setIslandMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível acessar o microfone.",
      );
    }
  }
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
      id: "notebooks",
      label: "Cadernos",
      icon: BookOpen,
      action: () => onTool(tool === "notebooks" ? null : "notebooks"),
    },
    {
      id: "flashcards",
      label: "Flashcards",
      icon: Layers,
      action: () => onTool(tool === "flashcards" ? null : "flashcards"),
    },
    {
      id: "pet",
      label: "Pet",
      icon: PawPrint,
      action: () => onTool(tool === "pet" ? null : "pet"),
    },
    {
      id: "settings",
      label: "Configurações",
      icon: Settings,
      action: () => onTool(tool === "settings" ? null : "settings"),
    },
  ];
  const islandWidth = islandRef.current?.offsetWidth ?? 360;
  const islandHeight = islandRef.current?.offsetHeight ?? 64;
  const islandTop = islandAnchorRef.current?.getBoundingClientRect().top ?? 12;
  const horizontalIslandTravel = Math.max(
    0,
    (window.innerWidth - islandWidth) / 2 - 12,
  );
  const verticalIslandTravel = Math.max(
    0,
    window.innerHeight - islandHeight - islandTop - 12,
  );
  const safeIslandPosition = {
    x: Math.min(
      horizontalIslandTravel,
      Math.max(-horizontalIslandTravel, islandPosition.x),
    ),
    y: Math.min(verticalIslandTravel, Math.max(0, islandPosition.y)),
  };
  const islandDragBounds = {
    left: -horizontalIslandTravel,
    right: horizontalIslandTravel,
    top: 0,
    bottom: verticalIslandTravel,
  };
  return (
    <>
      <AnimatePresence>
        {active && (
          <div
            id="active-study-island-anchor"
            ref={islandAnchorRef}
            className={styles.activeIslandAnchor}
            data-component="active-study-island-positioner"
          >
            <motion.div
              id="active-study-island"
              ref={islandRef}
              className={styles.activeIsland}
              role="group"
              aria-label="Ilha da sessão de estudo, arraste para reposicionar"
              drag
              dragConstraints={islandDragBounds}
              dragElastic={0.06}
              dragMomentum={false}
              initial={{
                x: safeIslandPosition.x,
                y: safeIslandPosition.y - 40,
                opacity: 0,
              }}
              animate={{
                x: safeIslandPosition.x,
                y: safeIslandPosition.y,
                opacity: 1,
              }}
              exit={{
                x: safeIslandPosition.x,
                y: safeIslandPosition.y - 40,
                opacity: 0,
              }}
              onDragEnd={() => {
                const islandBounds = islandRef.current?.getBoundingClientRect();
                const anchorBounds =
                  islandAnchorRef.current?.getBoundingClientRect();
                if (!islandBounds || !anchorBounds) return;
                const position = {
                  x: Math.round(
                    islandBounds.left +
                      islandBounds.width / 2 -
                      window.innerWidth / 2,
                  ),
                  y: Math.round(islandBounds.top - anchorBounds.top),
                };
                setIslandPosition(position);
                saveIslandPosition(position);
              }}
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
                onClick={() => {
                  setIslandMessage("");
                  setFinishOpen(true);
                }}
              >
                <Square size={12} />
              </GlassIconButton>
              {islandMessage && (
                <span className={styles.islandMessage} role="alert">
                  {islandMessage}
                </span>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className={styles.dockArea}>
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
                  setIslandMessage("");
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
                  setOpenPicker(null);
                  setMode("dock");
                }
              }}
              onSubmit={(e) => {
                e.preventDefault();
                start(subject, topic);
                setOpenPicker(null);
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
              <div className={styles.startPicker}>
                <span className={styles.startPickerLabel}>DISCIPLINA</span>
                <button
                  id="session-subject-select"
                  className={styles.startPickerTrigger}
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={openPicker === "subject"}
                  onClick={() =>
                    setOpenPicker(openPicker === "subject" ? null : "subject")
                  }
                >
                  <span>
                    {subjects.find((item) => item.id === subject)?.name ||
                      "Selecione uma disciplina"}
                  </span>
                  <ChevronDown size={15} />
                </button>
                {openPicker === "subject" && (
                  <div
                    className={styles.startPickerMenu}
                    role="listbox"
                    aria-label="Disciplinas disponíveis"
                  >
                    {subjects.map((item) => (
                      <button
                        id={`session-subject-option-${item.id}`}
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={item.id === subject}
                        className={styles.startPickerOption}
                        onClick={() => {
                          setSubject(item.id);
                          setTopic(item.topics[0] || "Estudo geral");
                          setOpenPicker(null);
                        }}
                      >
                        <span>{item.name}</span>
                        {item.id === subject && <Check size={15} />}
                      </button>
                    ))}
                    {!subjects.length && (
                      <p className={styles.startPickerEmpty}>
                        Adicione matérias ao seu objetivo.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.startPicker}>
                <span className={styles.startPickerLabel}>ASSUNTO</span>
                <button
                  id="session-topic-select"
                  className={styles.startPickerTrigger}
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={openPicker === "topic"}
                  onClick={() =>
                    setOpenPicker(openPicker === "topic" ? null : "topic")
                  }
                  disabled={!subjects.some((item) => item.id === subject)}
                >
                  <span>{topic}</span>
                  <ChevronDown size={15} />
                </button>
                {openPicker === "topic" && (
                  <div
                    className={styles.startPickerMenu}
                    role="listbox"
                    aria-label="Assuntos da disciplina"
                  >
                    {(subjects.find((item) => item.id === subject)?.topics
                      .length
                      ? subjects.find((item) => item.id === subject)!.topics
                      : ["Estudo geral — sem tópicos cadastrados"]
                    ).map((item) => (
                      <button
                        id={`session-topic-option-${(item || "geral").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        key={item}
                        type="button"
                        role="option"
                        aria-selected={
                          item === topic ||
                          (item.startsWith("Estudo geral") &&
                            topic === "Estudo geral")
                        }
                        className={styles.startPickerOption}
                        onClick={() => {
                          setTopic(
                            item.startsWith("Estudo geral")
                              ? "Estudo geral"
                              : item,
                          );
                          setOpenPicker(null);
                        }}
                      >
                        <span>{item}</span>
                        {(item === topic ||
                          (item.startsWith("Estudo geral") &&
                            topic === "Estudo geral")) && <Check size={15} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
        description="Escreva um resumo ou grave uma nota de voz. Você pode informar zero questões."
        open={finishOpen && !!active}
        onClose={() => setFinishOpen(false)}
      >
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const summary = String(data.get("summary") || "").trim();
            if (audioRecording) {
              finishRecorder.current?.stop();
              setIslandMessage(
                "Gravação finalizada. Clique em salvar sessão novamente.",
              );
              return;
            }
            if (!summary && !sessionAudio) {
              setIslandMessage(
                "Escreva um resumo ou grave um áudio antes de salvar.",
              );
              return;
            }
            void (async () => {
              const completedSession = active;
              if (!completedSession) return;
              let audioSaveError = false;
              if (sessionAudio) {
                try {
                  await db.audioNotes.add({
                    id: crypto.randomUUID(),
                    title: `Resumo em áudio · ${subjects.find((item) => item.id === completedSession.subjectId)?.name || "Estudo"}`,
                    subjectId: completedSession.subjectId,
                    date: new Date().toISOString(),
                    blob: sessionAudio,
                  });
                } catch {
                  audioSaveError = true;
                  if (!summary) {
                    setIslandMessage(
                      "Não foi possível salvar o áudio. Tente gravar novamente ou escreva um resumo.",
                    );
                    return;
                  }
                }
              }
              finish(
                summary || "Resumo gravado em áudio na biblioteca de estudos.",
                questions,
                correct,
              );
              setFinishOpen(false);
              setQuestions(0);
              setCorrect(0);
              setSessionAudio(null);
              setIslandMessage(
                audioSaveError
                  ? "Sessão salva com o resumo escrito, mas não foi possível salvar o áudio."
                  : "",
              );
            })();
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
          <div className={styles.summaryEntry}>
            <label htmlFor="session-learning-summary">
              O que você aprendeu?
              <textarea
                id="session-learning-summary"
                name="summary"
                rows={4}
                placeholder="Escreva um resumo ou grave uma nota de voz…"
                onChange={() => setIslandMessage("")}
              />
            </label>
            <GlassIconButton
              id="session-audio-record-button"
              type="button"
              aria-label={
                audioRecording
                  ? "Parar gravação de áudio"
                  : "Gravar resumo em áudio"
              }
              aria-pressed={audioRecording}
              data-recording={audioRecording}
              onClick={() => void toggleSessionAudioRecording()}
            >
              {audioRecording ? <Square size={17} /> : <Mic size={18} />}
            </GlassIconButton>
          </div>
          <p className={styles.summaryAudioHint} role="status">
            {audioRecording
              ? "Gravando… toque no microfone para finalizar."
              : sessionAudio
                ? "Áudio gravado e pronto para salvar com a sessão."
                : "Você pode escrever um resumo ou gravar uma nota de voz."}
          </p>
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
