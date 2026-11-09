import type { Dispatch, SetStateAction } from "react";
import type { Goal } from "../../types";
import styles from "./GoalEditor.module.css";
export default function ObjectiveDetails({
  draftGoal,
  setDraftGoal,
}: {
  draftGoal: Goal;
  setDraftGoal: Dispatch<SetStateAction<Goal>>;
}) {
  return (
    <fieldset className={styles.goalFields}>
      <legend>Dados do objetivo</legend>
      <label>
        Instituição
        <input
          id="goal-institution-input"
          value={draftGoal.institution}
          required
          onChange={(e) =>
            setDraftGoal({
              ...draftGoal,
              institution: e.target.value,
              emblem: undefined,
            })
          }
        />
      </label>
      <label>
        Concurso
        <input
          id="goal-title-input"
          value={draftGoal.title}
          required
          onChange={(e) =>
            setDraftGoal({ ...draftGoal, title: e.target.value })
          }
        />
      </label>
      <div className="form-row">
        <label>
          Cargo
          <input
            id="goal-role-input"
            value={draftGoal.role}
            onChange={(e) =>
              setDraftGoal({ ...draftGoal, role: e.target.value })
            }
          />
        </label>
        <label>
          Banca
          <input
            id="goal-board-input"
            value={draftGoal.board}
            onChange={(e) =>
              setDraftGoal({ ...draftGoal, board: e.target.value })
            }
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Ano
          <input
            id="goal-year-input"
            type="number"
            min="2026"
            max="2100"
            required
            value={draftGoal.year}
            onChange={(e) =>
              setDraftGoal({ ...draftGoal, year: Number(e.target.value) })
            }
          />
        </label>
        <label>
          Salário (R$)
          <input
            id="goal-salary-input"
            value={draftGoal.salary}
            onChange={(e) =>
              setDraftGoal({ ...draftGoal, salary: e.target.value })
            }
          />
        </label>
      </div>
      <label>
        Data da prova
        <input
          id="goal-exam-date-input"
          type="date"
          value={draftGoal.examDate}
          onChange={(e) =>
            setDraftGoal({ ...draftGoal, examDate: e.target.value })
          }
        />
      </label>
    </fieldset>
  );
}
