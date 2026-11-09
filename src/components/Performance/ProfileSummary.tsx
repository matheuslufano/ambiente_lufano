import { useStudyStore } from "../../store/useStudyStore";
import { useVisualAsset } from "../../hooks/useVisualAsset";

import styles from "./PerformancePanel.module.css";
export default function ProfileSummary({
  onSettings,
}: {
  onSettings: () => void;
}) {
  const { preferences, sessions, mockExams } = useStudyStore();
  const { url: avatar } = useVisualAsset("avatar");
  const questions = sessions.reduce((sum, s) => sum + s.questions, 0),
    duration = sessions.reduce((sum, s) => sum + s.duration, 0);
  return (
    <>
      <div className={styles.profile}>
        <button
          id="profile-avatar"
          aria-label="Personalizar perfil"
          onClick={onSettings}
          className={styles.avatar}
        >
          {avatar ? (
            <img src={avatar} alt={`Foto de ${preferences.name || "perfil"}`} />
          ) : (
            preferences.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
          )}
        </button>
        <h2>{preferences.name}</h2>
      </div>
      <div className={styles.metrics}>
        <div>
          <span>Questões</span>
          <strong>{questions.toLocaleString("pt-BR")}</strong>
        </div>
        <div>
          <span>Tempo</span>
          <strong>
            {(duration / 3600).toLocaleString("pt-BR", {
              maximumFractionDigits: 1,
            })}
            <small> h</small>
          </strong>
        </div>
        <div>
          <span>Simulados</span>
          <strong>{mockExams.length}</strong>
        </div>
      </div>
    </>
  );
}
