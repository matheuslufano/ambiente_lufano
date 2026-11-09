import { lazy, Suspense, useState } from "react";
import {
  BookOpen,
  FileText,
  LogOut,
  Monitor,
  Save,
  Sun,
  UserRound,
} from "lucide-react";
import { useStudyStore } from "../../store/useStudyStore";
import { db } from "../../lib/db";
import type { Subject, SubjectGroup } from "../../types";
import { GlassButton, GlassModal } from "../Glass/Glass";
import ObjectiveDetails from "./ObjectiveDetails";
import CurriculumEditor from "./CurriculumEditor";
import InstitutionEmblemPicker from "./InstitutionEmblemPicker";
import styles from "./GoalEditor.module.css";
const SettingsPanel = lazy(() => import("../Tools/SettingsPanel"));
type EditorSection =
  "objective" | "curriculum" | "profile" | "appearance" | "study";
const menu = [
  { id: "objective", label: "Dados do objetivo", icon: FileText },
  { id: "curriculum", label: "Grupos e matérias", icon: BookOpen },
  { id: "profile", label: "Perfil", icon: UserRound },
  { id: "appearance", label: "Aparência", icon: Monitor },
  { id: "study", label: "Seu ritmo", icon: Sun },
] as const;
/** Goal/curriculum drafts survive section changes and are committed only on Save. */
export default function GoalEditor({ onClose }: { onClose: () => void }) {
  const { goal, subjectGroups, subjects, active, saveObjective } =
    useStudyStore();
  const [section, setSection] = useState<EditorSection>("objective");
  const [draftGoal, setDraftGoal] = useState({ ...goal });
  const [groups, setGroups] = useState<SubjectGroup[]>(
    subjectGroups.map((group) => ({ ...group })),
  );
  const [draftSubjects, setDraftSubjects] = useState<Subject[]>(
    subjects.map((subject) => ({ ...subject, topics: [...subject.topics] })),
  );
  const [emblemBlob, setEmblemBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const settingsSection =
    section === "profile" || section === "appearance" || section === "study"
      ? section
      : null;
  async function save() {
    setError("");
    function fail(message: string, target: EditorSection) {
      setError(message);
      setSection(target);
    }
    if (
      !draftGoal.institution.trim() ||
      !draftGoal.title.trim() ||
      !Number.isInteger(draftGoal.year) ||
      draftGoal.year < 2026 ||
      draftGoal.year > 2100
    ) {
      fail("Preencha instituição, concurso e um ano válido.", "objective");
      return;
    }
    if (!groups.length || groups.some((group) => !group.name.trim())) {
      fail("Mantenha pelo menos um grupo e preencha os nomes.", "curriculum");
      return;
    }
    if (
      new Set(
        groups.map((group) => group.name.trim().toLocaleLowerCase("pt-BR")),
      ).size !== groups.length
    ) {
      fail("Use nomes diferentes para os grupos.", "curriculum");
      return;
    }
    if (
      !draftSubjects.length ||
      draftSubjects.some(
        (subject) =>
          !subject.name.trim() ||
          !Number.isFinite(subject.targetHours) ||
          subject.targetHours < 0 ||
          subject.targetHours > 100000 ||
          !Number.isSafeInteger(subject.targetQuestions) ||
          subject.targetQuestions < 0 ||
          subject.targetQuestions > 1000000,
      )
    ) {
      fail(
        "Mantenha pelo menos uma matéria com nome e metas válidas.",
        "curriculum",
      );
      return;
    }
    setSaving(true);
    try {
      if (draftGoal.emblem && emblemBlob)
        await db.visualAssets.put({
          id: "emblem",
          blob: emblemBlob,
          name: draftGoal.emblem.title,
        });
      else if (goal.emblem && !draftGoal.emblem)
        await db.visualAssets.delete("emblem");
      saveObjective(
        {
          ...draftGoal,
          institution: draftGoal.institution.trim(),
          title: draftGoal.title.trim(),
        },
        groups.map((group) => ({ ...group, name: group.name.trim() })),
        draftSubjects.map((subject) => ({
          ...subject,
          name: subject.name.trim(),
          topics: [
            ...new Set(
              subject.topics.map((topic) => topic.trim()).filter(Boolean),
            ),
          ],
        })),
      );
      onClose();
    } catch {
      setError(
        "Não foi possível salvar o brasão neste dispositivo. Tente novamente ou remova a escolha.",
      );
    } finally {
      setSaving(false);
    }
  }
  const navigation = (
    <nav
      id="goal-editor-navigation"
      className={styles.navigation}
      aria-label="Seções do objetivo"
    >
      <h3>Meu edital</h3>
      {menu.map((item, index) => (
        <div key={item.id}>
          {index === 2 && <h3>Configuração</h3>}
          <button
            id={`goal-editor-nav-${item.id}`}
            type="button"
            aria-pressed={section === item.id}
            disabled={saving}
            onClick={() => setSection(item.id)}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        </div>
      ))}
      <GlassButton
        id="goal-editor-exit"
        type="button"
        onClick={onClose}
        disabled={saving}
      >
        <LogOut size={14} /> Sair
      </GlassButton>
    </nav>
  );
  return (
    <GlassModal
      id="goal-editor-modal"
      title="Seu próximo objetivo"
      description={
        settingsSection
          ? "Perfil, aparência e ritmo são salvos automaticamente neste dispositivo."
          : "Edite o objetivo, organize os grupos e extraia os tópicos do edital. As mudanças só serão aplicadas ao salvar."
      }
      navigation={navigation}
      open
      onClose={() => {
        if (!saving) onClose();
      }}
    >
      {settingsSection ? (
        <>
          <div id="goal-editor-settings-area" className={styles.content}>
            <Suspense
              fallback={
                <p className="form-hint" role="status">
                  Abrindo configurações…
                </p>
              }
            >
              <SettingsPanel
                key={settingsSection}
                section={settingsSection}
                idPrefix="objective-settings"
              />
            </Suspense>
          </div>
          <div className={styles.footer}>
            <GlassButton id="goal-editor-settings-done" onClick={onClose}>
              Concluir
            </GlassButton>
          </div>
        </>
      ) : (
        <form
          id="goal-editor-form"
          className={styles.editorForm}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <div
            id="goal-editor-fields-area"
            className={`${styles.content} form-stack`}
          >
            {section === "objective" ? (
              <div className={styles.objectiveLayout}>
                <InstitutionEmblemPicker
                  goal={draftGoal}
                  blob={draftGoal.emblem ? emblemBlob : null}
                  onSelect={(emblem, blob) => {
                    setDraftGoal((current) => ({ ...current, emblem }));
                    setEmblemBlob(blob);
                  }}
                  onClear={() => {
                    setDraftGoal((current) => ({
                      ...current,
                      emblem: undefined,
                    }));
                    setEmblemBlob(null);
                  }}
                />
                <ObjectiveDetails
                  draftGoal={draftGoal}
                  setDraftGoal={setDraftGoal}
                />
              </div>
            ) : (
              <CurriculumEditor
                groups={groups}
                setGroups={setGroups}
                draftSubjects={draftSubjects}
                setDraftSubjects={setDraftSubjects}
                activeSubjectId={active?.subjectId}
              />
            )}
          </div>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <div className={styles.footer}>
            <GlassButton
              id="goal-cancel-button"
              type="button"
              disabled={saving}
              onClick={onClose}
            >
              Cancelar
            </GlassButton>
            <GlassButton
              id="goal-save-button"
              variant="primary"
              type="submit"
              disabled={saving}
            >
              <Save size={14} />
              {saving ? "Salvando…" : "Salvar objetivo"}
            </GlassButton>
          </div>
        </form>
      )}
    </GlassModal>
  );
}
