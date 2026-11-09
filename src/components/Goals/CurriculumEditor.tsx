import { useState, type Dispatch, type SetStateAction } from "react";
import { FolderPlus, Plus, Trash2 } from "lucide-react";
import type { Subject, SubjectGroup } from "../../types";
import { GlassButton, GlassIconButton } from "../Glass/Glass";
import SubjectSyllabusEditor from "./SubjectSyllabusEditor";
import styles from "./GoalEditor.module.css";
export default function CurriculumEditor({
  groups,
  setGroups,
  draftSubjects,
  setDraftSubjects,
  activeSubjectId,
}: {
  groups: SubjectGroup[];
  setGroups: Dispatch<SetStateAction<SubjectGroup[]>>;
  draftSubjects: Subject[];
  setDraftSubjects: Dispatch<SetStateAction<Subject[]>>;
  activeSubjectId?: string;
}) {
  const [removeGroup, setRemoveGroup] = useState<string | null>(null);
  function patchSubject(id: string, patch: Partial<Subject>) {
    setDraftSubjects((current) =>
      current.map((subject) =>
        subject.id === id ? { ...subject, ...patch } : subject,
      ),
    );
  }
  function addSubject(groupId: string) {
    setDraftSubjects((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        groupId,
        name: "Nova matéria",
        topics: [],
        syllabusText: "",
        targetHours: 40,
        targetQuestions: 0,
        color: "#718b65",
      },
    ]);
  }
  return (
    <>
      <div className={styles.curriculumHeading}>
        <h3>Grupos e matérias</h3>
        <GlassButton
          id="goal-group-add"
          type="button"
          onClick={() =>
            setGroups((current) => [
              ...current,
              { id: crypto.randomUUID(), name: "Novo grupo" },
            ])
          }
        >
          <FolderPlus size={14} /> Adicionar grupo
        </GlassButton>
      </div>
      <p className="form-hint">
        Abra uma matéria para editar metas, colar o edital ou carregar um PDF.
        Revise os tópicos extraídos antes de salvar.
      </p>
      {groups.map((group) => {
        const members = draftSubjects.filter(
          (subject) => subject.groupId === group.id,
        );
        const locked = members.some(
          (subject) => subject.id === activeSubjectId,
        );
        return (
          <fieldset
            id={`goal-group-editor-${group.id}`}
            className={styles.groupEditor}
            key={group.id}
          >
            <legend>{group.name || "Novo grupo"}</legend>
            <div className={styles.groupHeading}>
              <label>
                Nome do grupo
                <input
                  id={`goal-group-name-${group.id}`}
                  value={group.name}
                  required
                  onChange={(e) =>
                    setGroups((current) =>
                      current.map((item) =>
                        item.id === group.id
                          ? { ...item, name: e.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </label>
              <GlassIconButton
                id={`goal-group-remove-${group.id}`}
                aria-label={`Remover grupo ${group.name}`}
                title={
                  locked
                    ? "Encerre a sessão ativa antes de remover este grupo"
                    : "Remover grupo"
                }
                type="button"
                disabled={locked}
                onClick={() => setRemoveGroup(group.id)}
              >
                <Trash2 size={15} />
              </GlassIconButton>
            </div>
            {removeGroup === group.id && (
              <div className={styles.removalConfirmation} role="alert">
                <p>
                  Remover este grupo e suas {members.length} matérias do
                  objetivo? Os registros de estudo anteriores serão mantidos.
                </p>
                <GlassButton
                  id={`goal-group-confirm-remove-${group.id}`}
                  type="button"
                  variant="danger"
                  onClick={() => {
                    setGroups((current) =>
                      current.filter((item) => item.id !== group.id),
                    );
                    setDraftSubjects((current) =>
                      current.filter((subject) => subject.groupId !== group.id),
                    );
                    setRemoveGroup(null);
                  }}
                >
                  Remover do objetivo
                </GlassButton>
                <GlassButton
                  id={`goal-group-cancel-remove-${group.id}`}
                  type="button"
                  onClick={() => setRemoveGroup(null)}
                >
                  Manter grupo
                </GlassButton>
              </div>
            )}
            {members.map((subject) => (
              <SubjectSyllabusEditor
                key={subject.id}
                subject={subject}
                groups={groups}
                locked={activeSubjectId === subject.id}
                onChange={(patch) => patchSubject(subject.id, patch)}
                onRemove={() =>
                  setDraftSubjects((current) =>
                    current.filter((item) => item.id !== subject.id),
                  )
                }
              />
            ))}
            {!members.length && (
              <p className="form-hint">Este grupo ainda não tem matérias.</p>
            )}
            <GlassButton
              id={`goal-subject-add-${group.id}`}
              type="button"
              onClick={() => addSubject(group.id)}
            >
              <Plus size={14} /> Adicionar matéria
            </GlassButton>
          </fieldset>
        );
      })}
    </>
  );
}
