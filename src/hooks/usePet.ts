import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { db } from "../lib/db";
import type { PetRecord, PetReward } from "../types/pet";
import { ensurePet } from "../services/petService";
export function usePet() {
  const [pet, setPet] = useState<PetRecord | null>(null),
    [rewards, setRewards] = useState<PetReward[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    void ensurePet().catch(
      () =>
        alive &&
        setError(
          "Não foi possível abrir os dados do pet. Verifique o armazenamento do navegador.",
        ),
    );
    const subscription = liveQuery(async () => ({
      pet: await db.petStates.get("lufi"),
      rewards: await db.petRewards
        .orderBy("date")
        .reverse()
        .limit(20)
        .toArray(),
    })).subscribe({
      next: (data) => {
        setPet(data.pet || null);
        setRewards(data.rewards);
        setError("");
      },
      error: () => setError("O armazenamento do pet está indisponível."),
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);
  return { pet, rewards, error };
}
