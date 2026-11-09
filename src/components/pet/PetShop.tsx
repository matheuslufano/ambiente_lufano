import { Coffee, Fish } from "lucide-react";
import { foods } from "../../services/petService";
import { petLevel } from "../../services/rewardService";
import type { PetRecord } from "../../types/pet";
import styles from "./PetGame.module.css";
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
  return (
    <section id="pet-food-shop" className={styles.shop}>
      <h4>Um carinho em forma de comida</h4>
      {foods.map((food) => (
        <button
          id={`pet-buy-food-${food.id}`}
          key={food.id}
          disabled={
            busy ||
            pet.coins < food.price ||
            petLevel(pet.xp).level < food.level
          }
          onClick={() => onFeed(food.id)}
        >
          <Fish size={14} />
          <span>
            {food.name}
            <small>
              +{food.hunger} alimentação · nível {food.level}
            </small>
          </span>
          <strong>{food.price} moedas</strong>
        </button>
      ))}
      <button id="pet-coffee-animation" disabled={busy} onClick={onCoffee}>
        <Coffee size={14} />
        <span>
          Pausinha com café<small>Interação visual, sem moedas ou XP</small>
        </span>
      </button>
    </section>
  );
}
