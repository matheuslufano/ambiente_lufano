import { useStudyStore } from "../../store/useStudyStore";
import { useVisualAsset } from "../../hooks/useVisualAsset";
import { usePet } from "../../hooks/usePet";
import { petLevel } from "../../services/rewardService";
import {
  defaultLevelGoals,
  getProfileMetrics,
  getUnlockedProfileFrames,
  profileFrameTiers,
} from "../../lib/profileFrames";

import styles from "./PerformancePanel.module.css";

export type ProfileMetric = "questions" | "time" | "exams";

export default function ProfileSummary({
  onSettings,
  selectedMetric = "time",
  onMetricChange = () => {},
  onOpenLevels = () => {},
}: {
  onSettings: () => void;
  selectedMetric?: ProfileMetric;
  onMetricChange?: (metric: ProfileMetric) => void;
  onOpenLevels?: () => void;
}) {
  const { preferences, sessions, mockExams } = useStudyStore();
  const { url: avatar } = useVisualAsset("avatar");
  const { pet } = usePet();
  const { level } = petLevel(pet?.xp ?? 0);
  const metrics = getProfileMetrics(sessions, mockExams);
  const unlockedFrames = getUnlockedProfileFrames(
    metrics,
    preferences.levelGoals ?? defaultLevelGoals,
  );
  const selectedFrameId =
    preferences.profileFrame &&
    unlockedFrames.includes(preferences.profileFrame)
      ? preferences.profileFrame
      : (unlockedFrames.at(-1) ?? profileFrameTiers[0].id);
  const frame =
    profileFrameTiers.find((item) => item.id === selectedFrameId) ??
    profileFrameTiers[0];
  const questions = metrics.questions;
  const duration = sessions.reduce((sum, s) => sum + s.duration, 0);
  return (
    <>
      <div className={styles.profile}>
        <div
          className={styles.avatarFrame}
          data-rank={frame.id}
          aria-label={`Moldura de invocador nível ${frame.level}; nível de estudo ${level}`}
        >
          <button
            id="profile-avatar"
            aria-label="Personalizar perfil"
            onClick={onSettings}
            className={styles.avatar}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={`Foto de ${preferences.name || "perfil"}`}
              />
            ) : (
              preferences.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
            )}
          </button>
          <img
            className={styles.avatarFrameArtwork}
            src={frame.imageUrl}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            fetchPriority="high"
          />
          <span className={styles.avatarLevel}>Nv. {level}</span>
        </div>
        <h2>{preferences.name}</h2>
      </div>
      <div className={styles.metrics}>
        <button
          id="profile-metric-questions"
          type="button"
          aria-pressed={selectedMetric === "questions"}
          onClick={() => onMetricChange("questions")}
        >
          <span>Questões</span>
          <strong>{questions.toLocaleString("pt-BR")}</strong>
        </button>
        <button
          id="profile-metric-time"
          type="button"
          aria-pressed={selectedMetric === "time"}
          onClick={() => onMetricChange("time")}
        >
          <span>Tempo</span>
          <strong>
            {(duration / 3600).toLocaleString("pt-BR", {
              maximumFractionDigits: 1,
            })}
            <small> h</small>
          </strong>
        </button>
        <button
          id="profile-metric-exams"
          type="button"
          aria-pressed={selectedMetric === "exams"}
          onClick={() => onMetricChange("exams")}
        >
          <span>Simulados</span>
          <strong>{mockExams.length}</strong>
        </button>
        <button
          id="profile-metric-level"
          type="button"
          aria-label="Abrir metas e molduras de nível"
          onClick={onOpenLevels}
        >
          <span>Nível</span>
          <strong>Nv. {level}</strong>
        </button>
      </div>
    </>
  );
}
