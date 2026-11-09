import { useState } from "react";
import { CalendarPlus, Trash2 } from "lucide-react";
import { useStudyStore } from "../store/useStudyStore";
import { dateKey } from "../lib/time";
import { GlassButton, GlassIconButton } from "../components/Glass/Glass";
import styles from "./WorkspacePages.module.css";
export default function SchedulePlanner() {
  const { subjects, activities, addActivity, moveActivity, removeActivity } =
    useStudyStore();
  const [message, setMessage] = useState("");
  return (
    <section id="planning-schedule">
      <div className={styles.pageHeader}>
        <div>
          <span>UM PASSO DE CADA VEZ</span>
          <h2>Agenda de atividades</h2>
          <p>
            Planeje suas atividades; elas aparecem no calendário da página
            Início.
          </p>
        </div>
      </div>
      <div className={styles.twoColumns}>
        <form
          id="planning-activity-form"
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            addActivity({
              subjectId: String(data.get("subject")),
              topic: String(data.get("topic")).trim(),
              date: String(data.get("date")),
              time: String(data.get("time")),
              minutes: Number(data.get("minutes")),
            });
            setMessage("Atividade adicionada ao calendário.");
            event.currentTarget.reset();
          }}
        >
          <h2>Nova atividade</h2>
          <label>
            Matéria
            <select id="planning-subject" name="subject" required>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Assunto
            <input id="planning-topic" name="topic" required />
          </label>
          <div className="form-row">
            <label>
              Data
              <input
                id="planning-date"
                name="date"
                type="date"
                defaultValue={dateKey(new Date())}
                required
              />
            </label>
            <label>
              Horário
              <input
                id="planning-time"
                name="time"
                type="time"
                defaultValue="09:00"
                required
              />
            </label>
          </div>
          <label>
            Duração (min)
            <input
              id="planning-minutes"
              name="minutes"
              type="number"
              min="1"
              max="1440"
              defaultValue="60"
              required
            />
          </label>
          <GlassButton id="planning-save" variant="primary" type="submit">
            <CalendarPlus size={15} /> Adicionar atividade
          </GlassButton>
          {message && (
            <p className="form-hint" role="status">
              {message}
            </p>
          )}
        </form>
        <section id="planning-scheduled-activities" className={styles.list}>
          <h2>Próximas atividades</h2>
          {activities
            .slice()
            .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
            .map((activity) => (
              <article key={activity.id}>
                <div>
                  <strong>
                    {subjects.find(
                      (subject) => subject.id === activity.subjectId,
                    )?.name || "Disciplina arquivada"}
                  </strong>
                  <p>
                    {activity.topic} · {activity.time} · {activity.minutes} min
                  </p>
                  <label className={styles.inlineLabel}>
                    Reagendar
                    <input
                      id={`planning-reschedule-${activity.id}`}
                      aria-label={`Reagendar ${activity.topic}`}
                      type="date"
                      value={activity.date}
                      onChange={(event) => {
                        if (event.target.value)
                          moveActivity(activity.id, event.target.value);
                      }}
                    />
                  </label>
                </div>
                <GlassIconButton
                  id={`planning-delete-${activity.id}`}
                  aria-label={`Excluir atividade ${activity.topic}`}
                  onClick={() => removeActivity(activity.id)}
                >
                  <Trash2 size={15} />
                </GlassIconButton>
              </article>
            ))}
          {!activities.length && (
            <p className="form-hint">
              Nenhuma atividade planejada. Adicione a primeira ao lado.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
