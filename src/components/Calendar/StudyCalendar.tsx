import SessionAudioPlayer from "../Tools/SessionAudioPlayer";
import ManualSessionForm from "./ManualSessionForm";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Sun,
  Trash2,
} from "lucide-react";
import { useStudyStore } from "../../store/useStudyStore";
import { dateKey } from "../../lib/time";
import {
  GlassButton,
  GlassIconButton,
  GlassModal,
  GlassPanel,
  GlassSegmentedControl,
} from "../Glass/Glass";
import styles from "./StudyCalendar.module.css";
import { db } from "../../lib/db";
import type { AudioNote, StudySession } from "../../types";
type CalendarView = "week" | "month" | "year";
export default function StudyCalendar() {
  const {
    subjects,
    sessions,
    activities,
    addActivity,
    removeActivity,
    moveActivity,
    preferences,
    updateSession,
    removeSession,
  } = useStudyStore();
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [manual, setManual] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(
    null,
  );
  const [sessionAudioNotes, setSessionAudioNotes] = useState<AudioNote[]>([]);
  useEffect(() => {
    void db.audioNotes.toArray().then(setSessionAudioNotes);
  }, [selected]);
  const today = dateKey(new Date());
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const start = new Date(view === "week" ? cursor : monthStart);
  start.setDate(start.getDate() - start.getDay());
  const count =
    view === "week"
      ? 7
      : Math.ceil((monthStart.getDay() + monthEnd.getDate()) / 7) * 7;
  const dates = Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const period = cursor.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const selectedDate = selected ? new Date(selected + "T12:00:00") : new Date();
  function navigate(direction: number) {
    const next = new Date(cursor);
    if (view === "year") next.setFullYear(next.getFullYear() + direction);
    else if (view === "week") next.setDate(next.getDate() + direction * 7);
    else next.setMonth(next.getMonth() + direction, 1);
    setCursor(next);
  }
  return (
    <GlassPanel id="study-calendar-panel" className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.monthNavigation}>
          <GlassButton
            id="calendar-previous"
            aria-label="Período anterior"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={14} />
            <span>Anterior</span>
          </GlassButton>
          <h1 id="calendar-period-heading">
            {view === "year" ? cursor.getFullYear() : period}
          </h1>
          <GlassButton
            id="calendar-next"
            aria-label="Próximo período"
            onClick={() => navigate(1)}
          >
            <span>Próximo</span>
            <ChevronRight size={14} />
          </GlassButton>
        </div>
        <GlassSegmentedControl
          id="calendar-view"
          value={view}
          onChange={setView}
          options={[
            { value: "week", label: "Semana" },
            { value: "month", label: "Mês" },
            { value: "year", label: "Ano" },
          ]}
        />
      </div>
      {view === "year" ? (
        <div className={styles.yearGrid}>
          {Array.from({ length: 12 }, (_, m) => (
            <button
              id={`calendar-year-month-${m}`}
              key={m}
              onClick={() => {
                setCursor(new Date(cursor.getFullYear(), m, 1));
                setView("month");
              }}
            >
              <strong>
                {new Date(cursor.getFullYear(), m, 1).toLocaleDateString(
                  "pt-BR",
                  { month: "long" },
                )}
              </strong>
              <span>
                {
                  sessions.filter((s) =>
                    s.date.startsWith(
                      `${cursor.getFullYear()}-${String(m + 1).padStart(2, "0")}`,
                    ),
                  ).length
                }{" "}
                sessões
              </span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className={styles.weekdays}>
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d, i) => (
              <span data-weekend={i === 0 || i === 6} key={d}>
                {d}
              </span>
            ))}
          </div>
          <div
            id="calendar-date-grid"
            className={styles.grid}
            data-view={view}
            style={{ "--calendar-rows": count / 7 } as React.CSSProperties}
          >
            {dates.map((date) => {
              const key = dateKey(date);
              const daySessions = sessions.filter((s) => s.date === key);
              const dayActivities = activities.filter((a) => a.date === key);
              const duration = daySessions.reduce((a, s) => a + s.duration, 0);
              const ratio = duration / (preferences.dailyHours * 3600);
              return (
                <div
                  key={key}
                  id={`calendar-day-${key}`}
                  className={styles.day}
                  data-today={key === today}
                  data-outside={date.getMonth() !== cursor.getMonth()}
                  data-progress={
                    ratio >= 1 ? "complete" : ratio > 0 ? "partial" : "none"
                  }
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    if (activities.some((a) => a.id === id))
                      moveActivity(id, key);
                  }}
                  onClick={(event) => {
                    if (event.target === event.currentTarget) {
                      setSelected(key);
                      setAdding(false);
                    }
                  }}
                >
                  <button
                    id={`calendar-date-hit-area-${key}`}
                    aria-label={`${date.toLocaleDateString("pt-BR")}, ${dayActivities.length} atividades, ${daySessions.length} sessões`}
                    onClick={() => {
                      setSelected(key);
                      setAdding(false);
                    }}
                    className={styles.daySelect}
                  >
                    <span>{date.getDate()}</span>
                    {key === today && <small>HOJE</small>}
                  </button>
                  <div className={styles.dayRecords}>
                    {dayActivities.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className={styles.activity}
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData("text/plain", a.id)
                        }
                        style={
                          {
                            "--activity-color":
                              subjects.find((s) => s.id === a.subjectId)
                                ?.color || "#718b65",
                          } as React.CSSProperties
                        }
                        onClick={() => {
                          setSelected(key);
                          setAdding(false);
                        }}
                      >
                        <span>{a.time}</span>
                        <strong>
                          {subjects.find((s) => s.id === a.subjectId)?.name ||
                            "Disciplina arquivada"}
                        </strong>
                      </div>
                    ))}
                    {duration > 0 && (
                      <span className={styles.studied}>
                        <span /> {Math.floor(duration / 3600)}h{" "}
                        {Math.floor(duration / 60) % 60}min
                      </span>
                    )}
                    {dayActivities.length > 2 && (
                      <span className={styles.more}>
                        +{dayActivities.length - 2} atividades
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div className={styles.footer}>
        <div className={styles.legend}>
          <span>
            <i />
            Sem registro
          </span>
          <span>
            <i />
            Em progresso
          </span>
          <span>
            <i />
            Meta atingida
          </span>
        </div>
        <button id="calendar-today" onClick={() => setCursor(new Date())}>
          Hoje
        </button>
      </div>
      <div className={styles.todayStrip}>
        <div className={styles.sunIcon}>
          <Sun size={19} />
        </div>
        <div>
          <strong>
            {sessions.some((s) => s.date === today)
              ? "Cada minuto conta. Você está evoluindo."
              : "Seu próximo passo começa agora."}
          </strong>
          <span>
            {activities.filter((a) => a.date === today).length} atividades
            planejadas para hoje
          </span>
        </div>
        <GlassIconButton
          id="calendar-add-activity"
          aria-label="Planejar uma atividade"
          onClick={() => {
            setSelected(today);
            setAdding(true);
          }}
        >
          <Plus size={18} />
        </GlassIconButton>
      </div>
      <GlassModal
        id="calendar-day-modal"
        title={selectedDate.toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "long",
        })}
        description="Planejamento e registros do seu dia. Arraste atividades no calendário para reagendar."
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setManual(false);
        }}
      >
        {manual && selected ? (
          <ManualSessionForm
            key={selected}
            date={selected}
            onClose={() => setManual(false)}
          />
        ) : (
          <GlassButton
            id="calendar-register-session"
            onClick={() => {
              setManual(true);
              setAdding(false);
            }}
          >
            <Plus size={15} /> Registrar sessão manualmente
          </GlassButton>
        )}
        <div className={styles.dayTimeline}>
          {activities
            .filter((a) => a.date === selected)
            .map((a) => (
              <div className={styles.timelineRecord} key={a.id}>
                <Clock3 size={16} />
                <div>
                  <strong>
                    {a.time} ·{" "}
                    {subjects.find((s) => s.id === a.subjectId)?.name ||
                      "Disciplina arquivada"}
                  </strong>
                  <span>
                    {a.topic} · {a.minutes} min planejados
                  </span>
                </div>
                <GlassIconButton
                  id={`activity-delete-${a.id}`}
                  aria-label="Excluir atividade"
                  onClick={() => removeActivity(a.id)}
                >
                  <Trash2 size={14} />
                </GlassIconButton>
              </div>
            ))}
          {sessions
            .filter((s) => s.date === selected)
            .map((s) => (
              <div className={styles.timelineRecord} key={s.id}>
                <span className={styles.completedDot} />
                <div>
                  <strong>
                    {subjects.find((x) => x.id === s.subjectId)?.name ||
                      "Disciplina arquivada"}{" "}
                    · {Math.floor(s.duration / 60)} min
                  </strong>
                  <span>
                    {s.correct}/{s.questions} questões corretas · {s.summary}
                  </span>
                </div>
                <GlassIconButton
                  id={`session-edit-${s.id}`}
                  aria-label="Editar sessão"
                  onClick={() => setEditingSession(s)}
                >
                  <Clock3 size={14} />
                </GlassIconButton>
                <GlassIconButton
                  id={`session-delete-${s.id}`}
                  aria-label="Excluir sessão"
                  onClick={() => {
                    removeSession(s.id);
                  }}
                >
                  <Trash2 size={14} />
                </GlassIconButton>
              </div>
            ))}
          {!activities.some((a) => a.date === selected) &&
            !sessions.some((s) => s.date === selected) && (
              <div className="empty-state">
                <CalendarDays size={28} />
                <strong>Uma página em branco</strong>
                <p>Planeje seu estudo e dê o primeiro passo.</p>
              </div>
            )}
        </div>
        {!adding ? (
          <GlassButton id="day-add-activity" onClick={() => setAdding(true)}>
            <Plus size={15} /> Planejar atividade
          </GlassButton>
        ) : (
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              addActivity({
                date: selected!,
                subjectId: String(data.get("subject")),
                topic: String(data.get("topic")),
                time: String(data.get("time")),
                minutes: Number(data.get("minutes")),
              });
              setAdding(false);
            }}
          >
            <label>
              Disciplina
              <select name="subject" required>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Assunto
              <input
                name="topic"
                required
                placeholder="O que você vai estudar?"
              />
            </label>
            <div className="form-row">
              <label>
                Horário
                <input type="time" name="time" defaultValue="09:00" required />
              </label>
              <label>
                Duração (minutos)
                <input
                  type="number"
                  name="minutes"
                  min="1"
                  max="1440"
                  defaultValue="60"
                  required
                />
              </label>
            </div>
            <GlassButton id="activity-save" variant="primary" type="submit">
              Adicionar ao calendário
            </GlassButton>
          </form>
        )}
      </GlassModal>
      <GlassModal
        id="calendar-session-edit-modal"
        title="Corrigir sessão"
        description="Edite o resumo e os resultados registrados."
        open={!!editingSession}
        onClose={() => setEditingSession(null)}
      >
        {editingSession && (
          <form
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              updateSession(editingSession.id, {
                summary: String(data.get("summary")),
                questions: Number(data.get("questions")),
                correct: Number(data.get("correct")),
              });
              setEditingSession(null);
            }}
          >
            <label>
              Resumo
              <textarea
                name="summary"
                defaultValue={editingSession.summary}
                rows={4}
                required
              />
            </label>
            <div className="form-row">
              <label>
                Questões
                <input
                  name="questions"
                  type="number"
                  min="0"
                  defaultValue={editingSession.questions}
                  required
                />
              </label>
              <label>
                Acertos
                <input
                  name="correct"
                  type="number"
                  min="0"
                  max={editingSession.questions}
                  defaultValue={editingSession.correct}
                  required
                />
              </label>
            </div>
            <GlassButton id="session-edit-save" type="submit" variant="primary">
              Salvar correções
            </GlassButton>
          </form>
        )}
        {sessionAudioNotes
          .filter(
            (note) =>
              editingSession &&
              note.subjectId === editingSession.subjectId &&
              note.date.startsWith(
                new Date(editingSession.startedAt).toISOString().slice(0, 10),
              ),
          )
          .map((note) => (
            <SessionAudioPlayer key={note.id} note={note} />
          ))}
      </GlassModal>
    </GlassPanel>
  );
}
