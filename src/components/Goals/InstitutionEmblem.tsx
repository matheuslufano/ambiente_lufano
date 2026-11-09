import { useId, useState } from "react";
import { Shield } from "lucide-react";
import { useVisualAsset } from "../../hooks/useVisualAsset";
import type { Goal } from "../../types";
import styles from "./InstitutionEmblem.module.css";
export default function InstitutionEmblem({
  goal,
  previewUrl,
}: {
  goal: Goal;
  previewUrl?: string | null;
}) {
  const { url: cached, name } = useVisualAsset("emblem");
  const clipId = `institution-emblem-${useId()}`;
  const [failed, setFailed] = useState<string | null>(null);
  const source =
    previewUrl ||
    (goal.emblem
      ? (name === goal.emblem.title ? cached : null) || goal.emblem.url
      : null);
  const pcTo = /pol[ií]cia\s+civil.*tocantins|^pc\s*[-–]?\s*to$/i.test(
    goal.institution,
  );
  return (
    <div className={styles.emblem} data-component="institution-emblem">
      {source && failed !== source ? (
        <img
          src={source}
          alt={`Brasão de ${goal.institution}`}
          onError={() => setFailed(source)}
        />
      ) : pcTo ? (
        <svg
          viewBox="230 90 134 174"
          role="img"
          aria-label="Brasão PC-TO da referência fornecida"
        >
          <defs>
            <clipPath id={clipId}>
              <path d="M296 90 Q311 98 331 94 L362 125 L356 138 Q358 158 362 178 Q369 229 332 249 Q315 258 296 263 Q276 258 256 247 Q221 223 232 179 Q239 152 234 138 L230 125 L254 95 Q276 99 296 90Z" />
            </clipPath>
          </defs>
          <image
            href="/images/study-dashboard-reference.png"
            width="1940"
            height="1100"
            clipPath={`url(#${clipId})`}
          />
        </svg>
      ) : (
        <span className={styles.placeholder}>
          <Shield size={55} strokeWidth={1.2} />
          <small>Selecione o brasão</small>
        </span>
      )}
    </div>
  );
}
