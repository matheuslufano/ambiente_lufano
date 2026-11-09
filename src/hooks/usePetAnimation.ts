import { useEffect, useRef, useState } from "react";
import type { PetAction, PetRecord, PetReward } from "../types/pet";
import type { ActiveSession } from "../types";
export function usePetAnimation(
  pet: PetRecord | null,
  active: ActiveSession | null,
  rewards: PetReward[],
) {
  const [action, setAction] = useState<PetAction>("idle");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<string | undefined>(undefined);
  function react(next: PetAction) {
    if (timeout.current) clearTimeout(timeout.current);
    setAction(next);
    timeout.current = setTimeout(() => setAction("idle"), 3500);
  }
  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );
  useEffect(() => {
    if (!pet) return;
    const reward = rewards[0];
    if (
      latest.current !== undefined &&
      reward &&
      reward.id !== latest.current &&
      reward.coins > 0
    )
      react("celebrating");
    latest.current = reward?.id || "";
  }, [rewards, pet]);
  const state: PetAction =
    action !== "idle"
      ? action
      : active?.runningSince !== null && active
        ? "reading"
        : pet?.restingSince
          ? "sleeping"
          : pet && pet.hunger < 25
            ? "hungry"
            : "idle";
  return { action: state, react };
}
