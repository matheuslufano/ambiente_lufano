import { Battery, Heart, Apple, Sparkles } from "lucide-react";
import type { PetRecord } from "../../types/pet";
import { petLevel } from "../../services/rewardService";
import styles from "./PetGame.module.css";
export default function PetStats({ pet }: { pet: PetRecord }) {
  const level = petLevel(pet.xp);
  return (
    <div id="pet-vital-stats" className={styles.stats}>
      {[
        { id: "food", label: "Alimentação", value: pet.hunger, icon: Apple },
        {
          id: "happiness",
          label: "Felicidade",
          value: pet.happiness,
          icon: Heart,
        },
        { id: "energy", label: "Energia", value: pet.energy, icon: Battery },
        {
          id: "evolution",
          label: "Evolução",
          value: (level.progress / level.required) * 100,
          icon: Sparkles,
        },
      ].map(({ id, label, value, icon: Icon }) => (
        <label key={id} data-stat={id}>
          <span>
            {label}
          </span>
          <Icon className={styles.statIcon} size={29} strokeWidth={1.8} aria-hidden="true" />
          <progress
            id={`pet-stat-${id}`}
            max="100"
            value={Math.round(value)}
            aria-label={`${label}: ${Math.round(value)}%`}
          />
        </label>
      ))}
    </div>
  );
}
