import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { foods } from "../../services/petService";
import { petLevel } from "../../services/rewardService";
import type { PetRecord } from "../../types/pet";
import styles from "./PetGame.module.css";

const foodEmojis: Record<string, string> = {
  sandwich: "🥪",
  fish: "🐟",
  fruit: "🍎",
  milk: "🥛",
  juice: "🧃",
  special: "🍲",
};

const foodOptions = foods.map((food) => ({
  ...food,
  emoji: foodEmojis[food.id] ?? "🍽️",
  coffee: false,
}));
const selections = [
  foodOptions[0],
  {
    id: "coffee",
    name: "Café",
    emoji: "☕",
    price: 0,
    hunger: 0,
    energy: 0,
    level: 1,
    coffee: true,
  },
  ...foodOptions.slice(1),
];

export default function PetShop({
  pet,
  busy,
  onFeed,
  onCoffee,
}: {
  pet: PetRecord;
  busy: boolean;
  onFeed: (id: string) => void;
  onCoffee: () => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = selections[selectedIndex];
  const canOffer =
    selected.coffee ||
    (pet.coins >= selected.price &&
      petLevel(pet.xp).level >= selected.level);

  const changeSelection = (direction: -1 | 1) => {
    setSelectedIndex(
      (current) => (current + direction + selections.length) % selections.length,
    );
  };

  return (
    <section
      id="pet-food-shop"
      className={styles.foodCarousel}
      role="group"
      aria-label="Escolher alimento para a Lufi"
    >
      <button
        className={styles.foodArrow}
        type="button"
        aria-label="Opção de comida anterior"
        onClick={() => changeSelection(-1)}
        disabled={busy}
      >
        <ChevronLeft size={25} fill="currentColor" />
      </button>
      <button
        id={`pet-buy-food-${selected.id}`}
        className={styles.foodPreview}
        type="button"
        aria-label={
          selected.coffee
            ? "Tomar uma pausa com café"
            : `Oferecer ${selected.name} por ${selected.price} moedas`
        }
        title={
          selected.coffee
            ? "Pausinha com café"
            : `${selected.name} · +${selected.hunger} alimentação · ${selected.price} moedas`
        }
        disabled={busy || !canOffer}
        onClick={() =>
          selected.coffee ? onCoffee() : onFeed(selected.id)
        }
      >
        <span className={styles.foodPlate} aria-hidden="true">
          <span className={styles.foodEmoji}>{selected.emoji}</span>
        </span>
        <span className={styles.foodName}>{selected.name}</span>
        <span className={styles.foodInfo}>
          {selected.coffee
            ? "Pausa visual"
            : `${selected.price} moedas · +${selected.hunger} alimentação`}
        </span>
      </button>
      <button
        className={styles.foodArrow}
        type="button"
        aria-label="Próxima opção de comida"
        onClick={() => changeSelection(1)}
        disabled={busy}
      >
        <ChevronRight size={25} fill="currentColor" />
      </button>
    </section>
  );
}
