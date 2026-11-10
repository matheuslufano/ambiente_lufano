import {
  Crown,
  Backpack,
  Circle,
  Flower2,
  Glasses,
  GraduationCap,
  Headphones,
  Shirt,
  Sparkles,
  VenetianMask,
  X,
  type LucideIcon,
} from "lucide-react";
import { accessories } from "../../services/petService";
import { petLevel } from "../../services/rewardService";
import type { PetRecord, RewardRules } from "../../types/pet";
import { useState } from "react";
import styles from "./PetGame.module.css";
const accessoryIcons: Record<string, LucideIcon> = {
  glasses: Glasses,
  headphones: Headphones,
  graduation: GraduationCap,
  bow: Sparkles,
  flower: Flower2,
  scarf: Shirt,
  crown: Crown,
  cape: Sparkles,
  beret: VenetianMask,
  bandana: Shirt,
  backpack: Backpack,
  halo: Circle,
  bowtie: Sparkles,
};
const labels: Record<keyof RewardRules, string> = {
  minutes10: "10 minutos",
  minutes25: "25 minutos",
  minutes50: "50 minutos",
  minutes60: "60 minutos",
  questions10: "10 questões",
  mockExam: "Simulado",
  dailyGoal: "Meta diária",
};
export default function PetInventory({
  pet,
  busy,
  onClose,
  onEquip,
  onConfigure,
}: {
  pet: PetRecord;
  busy: boolean;
  onClose: () => void;
  onEquip: (id: string) => void;
  onConfigure: (name: string, rules: RewardRules) => void;
}) {
  const [name, setName] = useState(pet.name),
    [rules, setRules] = useState({ ...pet.rules });
  return (
    <section
      id="pet-inventory"
      className={`${styles.shop} ${styles.wardrobeWindow}`}
      role="dialog"
      aria-label={`Armário de ${pet.name}`}
    >
      <header className={styles.wardrobeHeader}>
        <h4>Armário da {pet.name}</h4>
        <button
          type="button"
          className={styles.wardrobeClose}
          aria-label="Fechar armário"
          onClick={onClose}
        >
          <X size={15} aria-hidden="true" />
        </button>
      </header>
      {accessories.map((item) => {
        const Icon = accessoryIcons[item.id] ?? Sparkles;
        const owned = pet.owned.includes(item.id);
        return (
          <button
            key={item.id}
            id={`pet-accessory-${item.id}`}
            disabled={
              busy ||
              (!owned &&
                (pet.coins < item.price || petLevel(pet.xp).level < item.level))
            }
            onClick={() => onEquip(item.id)}
          >
            <Icon size={16} />
            <span>
              {item.name}
              <small>Nível {item.level}</small>
            </span>
            <strong>
              {owned
                ? pet.equipped === item.id
                  ? "Remover"
                  : "Equipar"
                : `${item.price} moedas`}
            </strong>
          </button>
        );
      })}
      <form
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault();
          onConfigure(name, rules);
        }}
      >
        <label>
          Nome da lontrinha
          <input
            id="pet-name-input"
            value={name}
            required
            maxLength={30}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <details>
          <summary>Regras de recompensa</summary>
          <p className="form-hint">
            Ajustes valem para próximos créditos, sem pagar o passado outra vez.
            Valores de tempo devem ser crescentes: 25 min ≥ 2×10 min; 50 min ≥
            4×10 min; 60 min ≥ 50 min.
          </p>
          {(Object.keys(labels) as (keyof RewardRules)[]).map((key) => (
            <label key={key}>
              {labels[key]}
              <input
                id={`pet-reward-rule-${key}`}
                type="number"
                min="0"
                max="10000"
                step="1"
                required
                value={rules[key]}
                onChange={(event) =>
                  setRules((current) => ({
                    ...current,
                    [key]: Number(event.target.value),
                  }))
                }
              />
            </label>
          ))}
        </details>
        <button id="pet-save-preferences" type="submit" disabled={busy}>
          Salvar preferências do pet
        </button>
      </form>
    </section>
  );
}
