import { useState } from "react";
import { Save, X } from "lucide-react";
import { useStudyStore } from "../../store/useStudyStore";
import { GlassButton } from "../Glass/Glass";

export default function ManualSessionForm({
  date,
  onClose,
}: {
  date: string;
  onClose: () => void;
}) {
  const { subjects, addManualSession } = useStudyStore();
  const [questions, setQuestions] = useState(0);
  const [error, setError] = useState("");
  return (
    <form
      id="calendar-manual-session-form"
      className="form-stack"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const startedAt = new Date(`${date}T${data.get("time")}`).getTime();
        const duration = Number(data.get("minutes")) * 60;
        const endedAt = startedAt + duration * 1000;
        const saved = addManualSession({
          subjectId: String(data.get("subject")),
          topic: String(data.get("topic")).trim(),
          summary: String(data.get("summary")).trim(),
          questions,
          correct: Number(data.get("correct")),
          date,
          startedAt,
          endedAt,
          duration,
          validIntervals: [{ start: startedAt, end: endedAt }],
        });
        if (saved) onClose();
        else
          setError(
            "Confira os campos. O término da sessão não pode estar no futuro e os acertos não podem superar as questões.",
          );
      }}
    >
      <h3>Registrar sessão de estudo</h3>
      <p>{new Date(date + "T12:00:00").toLocaleDateString("pt-BR")}</p>
      <label htmlFor="manual-session-subject">
        Disciplina
        <select id="manual-session-subject" name="subject" required>
          {subjects.map((subject) => (
            <option value={subject.id} key={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="manual-session-topic">
        Assunto
        <input id="manual-session-topic" name="topic" required />
      </label>
      <div className="form-row">
        <label htmlFor="manual-session-time">
          Início
          <input
            id="manual-session-time"
            name="time"
            type="time"
            defaultValue="09:00"
            required
          />
        </label>
        <label htmlFor="manual-session-duration">
          Duração (minutos)
          <input
            id="manual-session-duration"
            name="minutes"
            type="number"
            min="1"
            max="1440"
            defaultValue="30"
            required
          />
        </label>
      </div>
      <label htmlFor="manual-session-summary">
        Resumo
        <textarea
          id="manual-session-summary"
          name="summary"
          rows={4}
          required
        />
      </label>
      <div className="form-row">
        <label htmlFor="manual-session-questions">
          Questões
          <input
            id="manual-session-questions"
            type="number"
            min="0"
            value={questions}
            onChange={(event) => setQuestions(Number(event.target.value))}
            required
          />
        </label>
        <label htmlFor="manual-session-correct">
          Acertos
          <input
            id="manual-session-correct"
            name="correct"
            type="number"
            min="0"
            max={questions}
            defaultValue="0"
            required
          />
        </label>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="form-row">
        <GlassButton id="manual-session-cancel" type="button" onClick={onClose}>
          <X size={15} /> Cancelar
        </GlassButton>
        <GlassButton id="manual-session-save" type="submit" variant="primary">
          <Save size={15} /> Salvar sessão
        </GlassButton>
      </div>
    </form>
  );
}
