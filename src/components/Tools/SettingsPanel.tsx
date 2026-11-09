import { validStudyPlans } from "../../lib/studyInsights";
import { useState } from "react";
import {
  Download,
  HardDrive,
  LogIn,
  Monitor,
  Settings2,
  Sun,
  Upload,
  UserRound,
} from "lucide-react";
import { useStudyStore } from "../../store/useStudyStore";
import AccountAccess from "../Account/AccountAccess";
import { normalizeCurriculum } from "../../lib/curriculum";
import { GlassButton, GlassSegmentedControl } from "../Glass/Glass";
import styles from "./SettingsPanel.module.css";
import ImageSettings from "./ImageSettings";
import type { Preferences } from "../../types";
import { validShortcuts, defaultShortcuts } from "../../lib/shortcuts";
import { isInstitutionEmblem } from "../../lib/institutionEmblems";
function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function SettingsPanel({
  section,
  idPrefix = "settings",
}: { section?: "profile" | "appearance" | "study"; idPrefix?: string } = {}) {
  const { preferences, setPreferences, sessions } = useStudyStore();
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <div id={`${idPrefix}-tool`}>
      {!section && (
        <>
          <div className="tool-eyebrow">
            <Settings2 size={13} /> DO SEU JEITO
          </div>
          <h2 className="tool-title">Seu espaço. Suas escolhas.</h2>
          <p className="tool-description">
            Pequenos ajustes para estudar melhor.
          </p>
        </>
      )}
      {(!section || section === "profile") && (
        <div className={styles.section}>
          <h3>
            <UserRound size={14} /> Perfil
          </h3>
          <label>
            Como podemos chamar você?
            <input
              id={`${idPrefix}-profile-name`}
              value={preferences.name}
              maxLength={60}
              onChange={(e) => setPreferences({ name: e.target.value })}
            />
          </label>
          <ImageSettings kind="avatar" idPrefix={idPrefix} />
          <GlassButton id={`${idPrefix}-auth`} onClick={() => setAuth(true)}>
            <LogIn size={14} /> Conta e sincronização
          </GlassButton>
        </div>
      )}
      {(!section || section === "appearance") && (
        <div className={styles.section}>
          <h3>
            <Monitor size={14} /> Aparência
          </h3>
          <GlassSegmentedControl
            id={`${idPrefix}-theme`}
            value={preferences.theme}
            onChange={(theme) => setPreferences({ theme })}
            options={[
              { value: "light", label: "Claro" },
              { value: "dark", label: "Escuro" },
              { value: "auto", label: "Sistema" },
            ]}
          />
          <label>
            Papel de parede
            <select
              id={`${idPrefix}-wallpaper`}
              value={preferences.wallpaper}
              onChange={(e) =>
                setPreferences({
                  wallpaper: e.target.value as Preferences["wallpaper"],
                })
              }
            >
              <option value="desk">Mesa de estudos</option>
              <option value="sage">Jardim sereno</option>
              <option value="sand">Luz da manhã</option>
              <option value="blue">Horizonte azul</option>
            </select>
          </label>
          <ImageSettings kind="wallpaper" idPrefix={idPrefix} />
          <p className="form-hint">
            Sua imagem personalizada tem prioridade sobre o fundo selecionado.
            Remova-a para voltar aos fundos padrão. Foto e fundo ficam salvos
            apenas neste dispositivo.
          </p>
          <label className={styles.switch}>
            Reduzir movimento
            <input
              id={`${idPrefix}-reduce-motion`}
              type="checkbox"
              checked={preferences.reduceMotion}
              onChange={(e) =>
                setPreferences({ reduceMotion: e.target.checked })
              }
            />
          </label>
        </div>
      )}
      {(!section || section === "study") && (
        <div className={styles.section}>
          <h3>
            <Sun size={14} /> Seu ritmo
          </h3>
          <label>
            Meta diária de estudo (horas)
            <input
              id={`${idPrefix}-daily-hours`}
              type="number"
              min="0.5"
              max="16"
              step="0.5"
              value={preferences.dailyHours}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (n >= 0.5 && n <= 16) setPreferences({ dailyHours: n });
              }}
            />
          </label>
          <label>
            Pomodoro padrão (minutos)
            <input
              id={`${idPrefix}-focus-minutes`}
              type="number"
              min="1"
              max="90"
              value={preferences.focusMinutes}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (n >= 1 && n <= 90) setPreferences({ focusMinutes: n });
              }}
            />
          </label>
        </div>
      )}
      {!section && (
        <div className={styles.section}>
          <h3>
            <HardDrive size={14} /> Seus dados
          </h3>
          <GlassButton
            id={`${idPrefix}-export-csv`}
            onClick={() => {
              const quote = (v: unknown) => {
                const text = String(v);
                const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
                return `"${safe.replaceAll('"', '""')}"`;
              };
              download(
                "lufano-sessoes.csv",
                "\uFEFF" +
                  [
                    [
                      "Data",
                      "Disciplina",
                      "Assunto",
                      "Segundos",
                      "Questões",
                      "Acertos",
                      "Resumo",
                    ],
                    ...sessions.map((s) => [
                      s.date,
                      useStudyStore
                        .getState()
                        .subjects.find((x) => x.id === s.subjectId)?.name ||
                        s.subjectId,
                      s.topic,
                      s.duration,
                      s.questions,
                      s.correct,
                      s.summary,
                    ]),
                  ]
                    .map((row) => row.map(quote).join(";"))
                    .join("\n"),
                "text/csv;charset=utf-8",
              );
            }}
          >
            <Download size={14} /> Exportar sessões em CSV
          </GlassButton>
          <GlassButton
            id={`${idPrefix}-backup`}
            onClick={() => {
              download(
                "lufano-backup.json",
                JSON.stringify(
                  {
                    version: 1,
                    data: JSON.parse(
                      localStorage.getItem("lufano-study-v1") || "null",
                    ),
                  },
                  null,
                  2,
                ),
                "application/json",
              );
            }}
          >
            <HardDrive size={14} /> Backup dos dados de estudo
          </GlassButton>
          <label className={styles.restore}>
            <Upload size={14} /> Restaurar backup
            <input
              id={`${idPrefix}-restore`}
              type="file"
              accept="application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const backup = JSON.parse(await file.text());
                  const data = backup.data?.state;
                  if (
                    backup.version !== 1 ||
                    !data ||
                    !Array.isArray(data.subjects) ||
                    !Array.isArray(data.sessions) ||
                    !Array.isArray(data.activities) ||
                    !Array.isArray(data.flashcards) ||
                    !data.preferences ||
                    !data.goal ||
                    typeof data.notes !== "object"
                  )
                    throw new Error("Formato de backup inválido.");
                  if (
                    data.sessions.some(
                      (s: Record<string, unknown>) =>
                        typeof s.duration !== "number" ||
                        typeof s.summary !== "string",
                    ) ||
                    data.subjects.some(
                      (s: Record<string, unknown>) =>
                        typeof s.id !== "string" ||
                        typeof s.name !== "string" ||
                        !Array.isArray(s.topics),
                    )
                  )
                    throw new Error("Dados inválidos no backup.");
                  if (
                    data.subjectGroups !== undefined &&
                    (!Array.isArray(data.subjectGroups) ||
                      data.subjectGroups.some(
                        (group: Record<string, unknown>) =>
                          typeof group.id !== "string" ||
                          typeof group.name !== "string",
                      ))
                  )
                    throw new Error("Grupos inválidos no backup.");
                  const curriculum = normalizeCurriculum(
                    data.subjects,
                    data.subjectGroups,
                  );
                  if (
                    data.shortcuts !== undefined &&
                    !validShortcuts(data.shortcuts)
                  )
                    throw new Error("Atalhos inválidos no backup.");
                  if (
                    data.goal.emblem !== undefined &&
                    !isInstitutionEmblem(data.goal.emblem)
                  )
                    throw new Error("Brasão inválido no backup.");
                  if (
                    data.mockExams !== undefined &&
                    (!Array.isArray(data.mockExams) ||
                      data.mockExams.some(
                        (exam: Record<string, unknown>) =>
                          typeof exam.id !== "string" ||
                          typeof exam.title !== "string" ||
                          !Number.isSafeInteger(exam.total) ||
                          !Number.isSafeInteger(exam.correct) ||
                          typeof exam.total !== "number" ||
                          typeof exam.correct !== "number" ||
                          exam.total < 1 ||
                          exam.correct < 0 ||
                          exam.correct > exam.total ||
                          typeof exam.completedAt !== "number",
                      ) ||
                      new Set(
                        data.mockExams.map(
                          (exam: Record<string, unknown>) => exam.id,
                        ),
                      ).size !== data.mockExams.length)
                  )
                    throw new Error("Simulados inválidos no backup.");
                  for (const key of ["studyCycle", "studyPosts"] as const) {
                    const entries = data[key];
                    if (entries === undefined) continue;
                    if (
                      !Array.isArray(entries) ||
                      entries.some(
                        (entry: Record<string, unknown>) =>
                          !entry ||
                          typeof entry.id !== "string" ||
                          !entry.id.trim() ||
                          (key === "studyCycle"
                            ? !curriculum.subjects.some(
                                (subject) => subject.id === entry.subjectId,
                              ) ||
                              !Number.isSafeInteger(entry.minutes) ||
                              typeof entry.minutes !== "number" ||
                              entry.minutes < 1 ||
                              entry.minutes > 480
                            : typeof entry.title !== "string" ||
                              !entry.title.trim() ||
                              typeof entry.body !== "string" ||
                              !entry.body.trim() ||
                              typeof entry.updatedAt !== "number" ||
                              !Number.isFinite(entry.updatedAt)),
                      ) ||
                      new Set(entries.map((entry: { id: string }) => entry.id))
                        .size !== entries.length
                    )
                      throw new Error("Ciclo ou textos inválidos no backup.");
                  }
                  if (
                    data.studyPlans !== undefined &&
                    !validStudyPlans(
                      data.studyPlans,
                      curriculum.subjects.map((s) => s.id),
                    )
                  )
                    throw new Error("Metas invalidas no backup.");
                  if (
                    data.cycleStartedAt !== undefined &&
                    (typeof data.cycleStartedAt !== "number" ||
                      !Number.isFinite(data.cycleStartedAt) ||
                      data.cycleStartedAt < 0)
                  )
                    throw new Error("Data do ciclo invalida no backup.");
                  useStudyStore.setState({
                    goal: data.goal,
                    shortcuts: data.shortcuts ?? defaultShortcuts,
                    ...curriculum,
                    sessions: data.sessions,
                    mockExams: data.mockExams ?? [],
                    activities: data.activities,
                    flashcards: data.flashcards,
                    notes: data.notes,
                    studyPlans: data.studyPlans ?? [],
                    cycleStartedAt: data.cycleStartedAt ?? Date.now(),
                    studyCycle: data.studyCycle ?? [],
                    studyPosts: data.studyPosts ?? [],
                    preferences: data.preferences,
                    active: null,
                  });
                  setMessage("Backup restaurado.");
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "Não foi possível restaurar o backup.",
                  );
                }
                e.target.value = "";
              }}
            />
          </label>
          <p className="form-hint">
            O backup inclui estudos, anotações e preferências. Arquivos de áudio
            ficam no IndexedDB e não são incluídos.
          </p>
          {message && (
            <p className={styles.message} role="status">
              {message}
            </p>
          )}
        </div>
      )}
      {auth && (
        <AccountAccess
          idPrefix={idPrefix}
          open={auth}
          onClose={() => setAuth(false)}
        />
      )}
    </div>
  );
}
