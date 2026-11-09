import type { PetReward } from "../../types/pet";
import styles from "./PetGame.module.css";
export default function PetRewards({ rewards }: { rewards: PetReward[] }) {
  return (
    <details id="pet-reward-history" className={styles.history}>
      <summary>Últimas conquistas</summary>
      {rewards.length ? (
        rewards.map((reward) => (
          <div key={reward.id}>
            <span>{reward.message}</span>
            <strong>
              +{reward.coins} moedas · +{reward.xp} XP
            </strong>
          </div>
        ))
      ) : (
        <p>
          Conclua uma sessão de estudo para conquistar suas primeiras moedas.
        </p>
      )}
    </details>
  );
}
