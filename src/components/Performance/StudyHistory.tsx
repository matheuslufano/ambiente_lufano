import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStudyStore } from "../../store/useStudyStore";
import { formatDuration } from "../../lib/time";
import { GlassIconButton, GlassModal } from "../Glass/Glass";
import styles from "./SidebarContent.module.css";
export default function StudyHistory({
  subjectId = "",
  exams = false,
  idPrefix = "sidebar",
}: {
  subjectId?: string;
  exams?: boolean;
  idPrefix?: string;
}) {
  const {
    sessions,
    subjects,
    mockExams,
    addMockExam,
    updateMockExam,
    removeMockExam,
  } = useStudyStore();
  const [adding, setAdding] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [examDraft, setExamDraft] = useState({
    title: "",
    total: "",
    correct: "",
  });
  const examFormOpen = adding || editingExamId !== null;
  const timelineData = Object.entries(
    sessions
      .filter((session) => !subjectId || session.subjectId === subjectId)
      .reduce<Record<string, number>>((days, session) => {
        days[session.date] = (days[session.date] || 0) + session.duration;
        return days;
      }, {}),
  )
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-30)
    .map(([date, seconds]) => ({ date, minutes: Math.round(seconds / 60) }));
  return (
    <section
      id={`${idPrefix}-${exams ? "mock-exams" : "study-timeline"}`}
      className={styles.history}
    >
      {exams ? (
        <>
          {!examFormOpen && (
            <GlassIconButton
              id={`${idPrefix}-mock-exam-add`}
              type="button"
              aria-label="Adicionar simulado"
              title="Adicionar simulado"
              onClick={() => {
                setExamDraft({ title: "", total: "", correct: "" });
                setAdding(true);
                setEditingExamId(null);
              }}
            >
              <Plus size={17} />
            </GlassIconButton>
          )}
          {examFormOpen && (
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const total = Number(data.get("total")),
                  correct = Number(data.get("correct"));
                if (correct > total) {
                  e.currentTarget
                    .querySelector<HTMLInputElement>("[name=correct]")
                    ?.setCustomValidity(
                      "Os acertos não podem exceder o total.",
                    );
                  e.currentTarget.reportValidity();
                  return;
                }
                const exam = {
                  title: String(data.get("title")).trim(),
                  total,
                  correct,
                };
                if (editingExamId) updateMockExam(editingExamId, exam);
                else addMockExam(exam);
                setAdding(false);
                setEditingExamId(null);
              }}
            >
              <label>
                {editingExamId ? "Editar simulado" : "Nome"}
                <input
                  id={`${idPrefix}-mock-exam-title`}
                  name="title"
                  required
                  value={examDraft.title}
                  onChange={(event) =>
                    setExamDraft((draft) => ({
                      ...draft,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="form-row">
                <label>
                  Questões
                  <input
                    id={`${idPrefix}-mock-exam-total`}
                    name="total"
                    type="number"
                    min="1"
                    required
                    value={examDraft.total}
                    onChange={(event) =>
                      setExamDraft((draft) => ({
                        ...draft,
                        total: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Acertos
                  <input
                    id={`${idPrefix}-mock-exam-correct`}
                    name="correct"
                    type="number"
                    min="0"
                    required
                    value={examDraft.correct}
                    onChange={(event) => {
                      event.target.setCustomValidity("");
                      setExamDraft((draft) => ({
                        ...draft,
                        correct: event.target.value,
                      }));
                    }}
                  />
                </label>
              </div>
              <div className="form-row">
                <GlassIconButton
                  id={`${idPrefix}-mock-exam-save`}
                  type="submit"
                  aria-label="Salvar simulado"
                  title="Salvar simulado"
                >
                  <Check size={16} />
                </GlassIconButton>
                <GlassIconButton
                  id={`${idPrefix}-mock-exam-cancel`}
                  type="button"
                  aria-label="Cancelar edição"
                  title="Cancelar edição"
                  onClick={() => {
                    setAdding(false);
                    setEditingExamId(null);
                  }}
                >
                  <X size={16} />
                </GlassIconButton>
              </div>
            </form>
          )}
          {mockExams
            .slice()
            .reverse()
            .map((exam) => (
              <article key={exam.id}>
                <div className={styles.historyRecordHeader}>
                  <strong>{exam.title}</strong>
                  <div className={styles.historyRecordActions}>
                    <GlassIconButton
                      id={`${idPrefix}-mock-exam-edit-${exam.id}`}
                      aria-label={`Editar ${exam.title}`}
                      title="Editar simulado"
                      onClick={() => {
                        setAdding(false);
                        setEditingExamId(exam.id);
                        setExamDraft({
                          title: exam.title,
                          total: String(exam.total),
                          correct: String(exam.correct),
                        });
                      }}
                    >
                      <Pencil size={14} />
                    </GlassIconButton>
                    <GlassIconButton
                      id={`${idPrefix}-mock-exam-delete-${exam.id}`}
                      aria-label={`Apagar ${exam.title}`}
                      title="Apagar simulado"
                      onClick={() => setPendingDeleteId(exam.id)}
                    >
                      <Trash2 size={14} />
                    </GlassIconButton>
                  </div>
                </div>
                <span>
                  {exam.correct}/{exam.total} acertos ·{" "}
                  {Math.round((exam.correct / exam.total) * 100)}%
                </span>
              </article>
            ))}
        </>
      ) : (
        <>
          <div id="sidebar-timeline-chart" className={styles.timelineChart}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timelineData}
                margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9 }}
                  tickFormatter={(date) =>
                    new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  }
                />
                <YAxis unit=" min" tick={{ fontSize: 9 }} width={42} />
                <Tooltip
                  labelFormatter={(date) =>
                    new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR")
                  }
                  formatter={(value) => [`${value} min`, "Estudo"]}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  name="Estudo"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {!timelineData.length && (
              <div className={styles.timelineEmpty} role="status">
                Seus minutos de estudo aparecerão aqui após a primeira sessão.
              </div>
            )}
          </div>
          {sessions
            .filter((s) => !subjectId || s.subjectId === subjectId)
            .slice()
            .reverse()
            .map((session) => (
              <article key={session.id}>
                <strong>
                  {subjects.find((s) => s.id === session.subjectId)?.name ||
                    "Disciplina arquivada"}
                </strong>
                <span>
                  {new Date(session.startedAt).toLocaleDateString("pt-BR")} ·{" "}
                  {formatDuration(session.duration)}
                </span>
                <p>{session.summary}</p>
                <span>
                  {session.correct}/{session.questions} acertos
                </span>
              </article>
            ))}
        </>
      )}
      {exams && !mockExams.length && (
        <p className="form-hint">
          Os resultados aparecerão aqui quando você concluir um simulado.
        </p>
      )}
      <GlassModal
        id={`${idPrefix}-mock-exam-delete-modal`}
        title="Apagar simulado?"
        description={
          mockExams.find((exam) => exam.id === pendingDeleteId)?.title
        }
        open={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
      >
        <div className={styles.historyRecordActions}>
          <GlassIconButton
            id={`${idPrefix}-mock-exam-delete-cancel`}
            aria-label="Cancelar exclusão"
            title="Cancelar"
            onClick={() => setPendingDeleteId(null)}
          >
            <X size={16} />
          </GlassIconButton>
          <GlassIconButton
            id={`${idPrefix}-mock-exam-delete-confirm`}
            aria-label="Confirmar exclusão do simulado"
            title="Apagar simulado"
            onClick={() => {
              if (!pendingDeleteId) return;
              removeMockExam(pendingDeleteId);
              setPendingDeleteId(null);
            }}
          >
            <Trash2 size={16} />
          </GlassIconButton>
        </div>
      </GlassModal>
    </section>
  );
}
