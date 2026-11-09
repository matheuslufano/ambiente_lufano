import { ChevronRight, ListTree } from "lucide-react";
import { useStudyStore } from "../../store/useStudyStore";
import styles from "./SubjectGroups.module.css";
export default function SubjectGroups() {
  const { subjectGroups, subjects, sessions } = useStudyStore();
  return (
    <section
      id="study-subject-groups"
      className={styles.curriculum}
      aria-labelledby="study-subject-groups-title"
    >
      <h3 id="study-subject-groups-title" className={styles.curriculumTitle}>
        Matérias
      </h3>
      {subjectGroups.map((group) => {
        const members = subjects.filter(
          (subject) => subject.groupId === group.id,
        );
        return (
          <details
            id={`study-subject-group-${group.id}`}
            className={styles.group}
            key={group.id}
            data-component="subject-group"
          >
            <summary>
              <ChevronRight size={14} />
              <strong>{group.name}</strong>
              <span>{members.length}</span>
            </summary>
            <div className={styles.groupSubjects}>
              {members.length > 0 && (
                <div className={styles.columns}>
                  <span>Matérias</span>
                  <span>
                    Dedicação<small>metas Q / H</small>
                  </span>
                </div>
              )}
              {members.map((subject) => {
                const records = sessions.filter(
                  (session) => session.subjectId === subject.id,
                );
                const seconds = records.reduce(
                  (total, session) => total + session.duration,
                  0,
                );
                const questions = records.reduce(
                  (total, session) => total + session.questions,
                  0,
                );
                const correct = records.reduce(
                  (total, session) => total + session.correct,
                  0,
                );
                return (
                  <details
                    id={`study-subject-${subject.id}`}
                    className={styles.subject}
                    key={subject.id}
                  >
                    <summary>
                      <span className={styles.subjectName}>
                        <ChevronRight size={11} />
                        {subject.name}
                      </span>
                      <span
                        className={styles.dedication}
                        title="Metas de questões e horas"
                      >
                        {subject.targetQuestions}Q/{subject.targetHours}H
                      </span>
                    </summary>
                    <div
                      id={`study-subject-topics-${subject.id}`}
                      className={styles.subjectContent}
                    >
                      <p className={styles.subjectProgress}>
                        {questions} questões ·{" "}
                        {(seconds / 3600).toLocaleString("pt-BR", {
                          maximumFractionDigits: 1,
                        })}
                        h estudadas ·{" "}
                        {questions
                          ? Math.round((correct / questions) * 100)
                          : 0}
                        % de acertos
                      </p>
                      {subject.topics.length ? (
                        <ol className={styles.topics}>
                          {subject.topics.map((topic, index) => (
                            <li key={`${subject.id}-${index}`}>{topic}</li>
                          ))}
                        </ol>
                      ) : (
                        <p className={styles.emptyTopics}>
                          <ListTree size={13} /> Adicione o conteúdo do edital
                          em “Seu próximo objetivo”.
                        </p>
                      )}
                    </div>
                  </details>
                );
              })}
              {!members.length && (
                <p className={styles.emptyGroup}>
                  Adicione matérias a este grupo no editor do objetivo.
                </p>
              )}
            </div>
          </details>
        );
      })}
    </section>
  );
}
