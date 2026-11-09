import { useState } from "react";
import { useStudyStore } from "../../store/useStudyStore";
import { formatDuration } from "../../lib/time";
import { GlassButton } from "../Glass/Glass";
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
  const { sessions, subjects, mockExams, addMockExam } = useStudyStore();
  const [adding, setAdding] = useState(false);
  return (
    <section
      id={`${idPrefix}-${exams ? "mock-exams" : "study-timeline"}`}
      className={styles.history}
    >
      <h3>{exams ? "Seus simulados" : "Linha do tempo"}</h3>
      {exams ? (
        <>
          <GlassButton
            id={`${idPrefix}-mock-exam-add`}
            onClick={() => setAdding(!adding)}
          >
            Registrar simulado
          </GlassButton>
          {adding && (
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
                addMockExam({
                  title: String(data.get("title")),
                  total,
                  correct,
                });
                setAdding(false);
              }}
            >
              <label>
                Nome
                <input
                  id={`${idPrefix}-mock-exam-title`}
                  name="title"
                  required
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
                    onChange={(e) => e.target.setCustomValidity("")}
                  />
                </label>
              </div>
              <GlassButton
                id={`${idPrefix}-mock-exam-save`}
                type="submit"
                variant="primary"
              >
                Salvar resultado
              </GlassButton>
            </form>
          )}
          {mockExams
            .slice()
            .reverse()
            .map((exam) => (
              <article key={exam.id}>
                <strong>{exam.title}</strong>
                <span>
                  {exam.correct}/{exam.total} acertos ·{" "}
                  {Math.round((exam.correct / exam.total) * 100)}%
                </span>
              </article>
            ))}
        </>
      ) : (
        sessions
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
          ))
      )}
      {!(exams ? mockExams : sessions).length && (
        <p className="form-hint">
          Os registros reais aparecerão aqui quando você concluir{" "}
          {exams ? "um simulado" : "uma sessão"}.
        </p>
      )}
    </section>
  );
}
