import { useEffect, useState } from "react";
import { useStudyStore } from "../store/useStudyStore";
import {
  claimMockReward,
  claimStudyReward,
  wakePet,
} from "../services/petService";
/** Claims completed records only; the ledger, not this React effect, enforces idempotence. */
export function useStudyRewards() {
  const { sessions, mockExams, preferences, active } = useStudyStore();
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        for (const session of sessions) {
          if (cancelled) return;
          await claimStudyReward(session, preferences.dailyHours);
        }
        for (const exam of mockExams) {
          if (cancelled) return;
          await claimMockReward(exam);
        }
        if (!cancelled) setError("");
      } catch {
        if (!cancelled)
          setError(
            "As recompensas estão pendentes. Abra a página novamente para sincronizar o pet.",
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessions, mockExams, preferences.dailyHours]);
  useEffect(() => {
    if (active?.runningSince !== null && active)
      void wakePet().catch(() =>
        setError("Não foi possível atualizar o estado de estudo do pet."),
      );
  }, [active?.startedAt, active?.runningSince]);
  return error;
}
