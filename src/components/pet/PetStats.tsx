import { Battery, Heart, Fish, Sparkles } from "lucide-react";
import type { PetRecord } from "../../types/pet";
import { petLevel } from "../../services/rewardService";
import styles from "./PetGame.module.css";
export default function PetStats({ pet }: { pet: PetRecord }) {
  const level = petLevel(pet.xp);
  return (
    <div id="pet-vital-stats" className={styles.stats}>
      {[
        { id: "food", label: "Alimentação", value: pet.hunger, icon: Fish },
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
        <label key={id}>
          <span>
            <Icon size={11} />
            {label}
          </span>
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
