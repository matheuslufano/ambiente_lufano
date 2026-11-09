import { useState } from "react";
import { ArrowDown, ArrowUp, Play, Plus, Trash2 } from "lucide-react";
import { useStudyStore } from "../store/useStudyStore";
import { GlassButton, GlassIconButton } from "../components/Glass/Glass";
import type { StudyCycleItem } from "../types";
import { cycleProgress } from "../lib/studyInsights";
import { formatDuration } from "../lib/time";
import styles from "./WorkspacePages.module.css";
export default function StudyCyclePage({
  onStudy,
}: {
  onStudy: (subjectId?: string) => void;
}) {
  const {
    subjects,
    studyCycle,
    setStudyCycle,
    sessions,
    cycleStartedAt,
    restartCycle,
  } = useStudyStore();
  const progress = cycleProgress(studyCycle, sessions, cycleStartedAt);
  const [draft, setDraft] = useState<StudyCycleItem[]>(
    studyCycle.map((item) => ({ ...item })),
  );
  const [message, setMessage] = useState("");
  function move(index: number, delta: number) {
    setDraft((current) => {
      const items = [...current];
      [items[index], items[index + delta]] = [
        items[index + delta],
        items[index],
      ];
      return items;
    });
  }
  return (
    <main id="study-cycle-page" className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <span>UM RITMO QUE CABE NA SUA ROTINA</span>
          <h1>Ciclo de estudos</h1>
          <p>
            Organize a ordem das matérias e uma duração sugerida. O estudo só
            começa quando você confirma no Dock.
          </p>
        </div>
      </div>
      <section id="study-cycle-progress" className={styles.mainSurface}>
        <div className={styles.sectionHeading}>
          <h2>Seu ciclo atual</h2>
          <span>Volta {progress.rounds + 1}</span>
        </div>
        {progress.rows.map((row, index) => (
          <article key={row.id} className={styles.progressRow}>
            <div>
              <strong>
                {index + 1}.{" "}
                {subjects.find((s) => s.id === row.subjectId)?.name}
              </strong>
              <span>
                {formatDuration(row.seconds)} / {row.minutes} min
              </span>
            </div>
            <progress max={row.minutes * 60} value={row.seconds} />
            <GlassButton
              id={`cycle-progress-study-${row.id}`}
              onClick={() => onStudy(row.subjectId)}
            >
              <Play size={13} /> Estudar
            </GlassButton>
          </article>
        ))}
        <GlassButton id="cycle-restart" onClick={restartCycle}>
          Reiniciar progresso
        </GlassButton>
        <p className="form-hint">
          O progresso considera estudos conclu?dos desde a ?ltima configura??o
          do ciclo. Reiniciar preserva seu hist?rico.
        </p>
      </section>
      <h2 className={styles.sectionTitle}>Configurar sequ?ncia</h2>
      <form
        id="study-cycle-form"
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault();
          setStudyCycle(draft);
          setMessage("Ciclo salvo neste dispositivo.");
        }}
      >
        <div className={styles.list}>
          {draft.map((item, index) => (
            <article key={item.id}>
              <span className={styles.order}>{index + 1}</span>
              <div className="form-row">
                <label>
                  Matéria
                  <select
                    id={`cycle-subject-${item.id}`}
                    required
                    value={item.subjectId}
                    onChange={(event) =>
                      setDraft((current) =>
                        current.map((row) =>
                          row.id === item.id
                            ? { ...row, subjectId: event.target.value }
                            : row,
                        ),
                      )
                    }
                  >
                    {subjects.some(
                      (subject) => subject.id === item.subjectId,
                    ) ? null : (
                      <option value="">Selecione uma matéria</option>
                    )}
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Minutos sugeridos
                  <input
                    id={`cycle-minutes-${item.id}`}
                    type="number"
                    min="1"
                    max="480"
                    required
                    value={item.minutes}
                    onChange={(event) =>
                      setDraft((current) =>
                        current.map((row) =>
                          row.id === item.id
                            ? { ...row, minutes: Number(event.target.value) }
                            : row,
                        ),
                      )
                    }
                  />
                </label>
              </div>
              <div className={styles.rowActions}>
                <GlassIconButton
                  id={`cycle-up-${item.id}`}
                  type="button"
                  aria-label="Mover para cima"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp size={14} />
                </GlassIconButton>
                <GlassIconButton
                  id={`cycle-down-${item.id}`}
                  type="button"
                  aria-label="Mover para baixo"
                  disabled={index === draft.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown size={14} />
                </GlassIconButton>
                <GlassIconButton
                  id={`cycle-remove-${item.id}`}
                  type="button"
                  aria-label="Remover etapa"
                  onClick={() =>
                    setDraft((current) =>
                      current.filter((row) => row.id !== item.id),
                    )
                  }
                >
                  <Trash2 size={14} />
                </GlassIconButton>
                <GlassButton
                  id={`cycle-study-${item.id}`}
                  type="button"
                  onClick={() => onStudy(item.subjectId)}
                >
                  <Play size={13} /> Estudar
                </GlassButton>
              </div>
            </article>
          ))}
        </div>
        {!draft.length && (
          <p className="form-hint">
            Seu ciclo está vazio. Adicione as matérias na ordem em que deseja
            estudar.
          </p>
        )}
        <div className={styles.pageActions}>
          <GlassButton
            id="cycle-add"
            type="button"
            onClick={() =>
              setDraft((current) => [
                ...current,
                {
                  id: crypto.randomUUID(),
                  subjectId: subjects[0]?.id || "",
                  minutes: 25,
                },
              ])
            }
          >
            <Plus size={15} /> Adicionar matéria
          </GlassButton>
          <GlassButton id="cycle-save" type="submit" variant="primary">
            Salvar ciclo
          </GlassButton>
        </div>
        {message && (
          <p className="form-hint" role="status">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
