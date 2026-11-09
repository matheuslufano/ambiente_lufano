import { useState } from "react";
import { Pencil } from "lucide-react";
import { GlassIconButton, GlassPanel } from "../Glass/Glass";
import SubjectGroups from "./SubjectGroups";
import GoalEditor from "./GoalEditor";
import styles from "./GoalsPanel.module.css";
import { useStudyStore } from "../../store/useStudyStore";
import InstitutionEmblem from "./InstitutionEmblem";
import StudyShortcuts from "./StudyShortcuts";
export default function GoalsPanel() {
  const goal = useStudyStore((state) => state.goal);
  const [edit, setEdit] = useState(false);
  return (
    <GlassPanel id="study-goals-panel" className={styles.panel}>
      <section
        id="study-goal-overview"
        className={styles.overview}
        aria-labelledby="study-goal-institution"
      >
        <GlassIconButton
          id="study-goal-edit"
          aria-label="Editar objetivo, grupos e matérias"
          onClick={() => setEdit(true)}
        >
          <Pencil size={16} />
        </GlassIconButton>
        <InstitutionEmblem goal={goal} />
        <h2 id="study-goal-institution">{goal.institution}</h2>
        <div id="study-goal-details" className={styles.goalDetails}>
          <p>
            Concurso: {goal.title} {goal.year}
          </p>
          <p>Cargo: {goal.role}</p>
          <p>Banca: {goal.board}</p>
          <p>Salário inicial</p>
          <strong id="study-goal-salary">
            {goal.salary ? `R$ ${goal.salary}` : "A definir"}
          </strong>
        </div>
      </section>
      <SubjectGroups />
      <StudyShortcuts />
      {edit && <GoalEditor onClose={() => setEdit(false)} />}
    </GlassPanel>
  );
}
