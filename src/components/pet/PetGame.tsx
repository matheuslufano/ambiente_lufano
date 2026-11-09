import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Coins, Lock } from "lucide-react";
import { usePet } from "../../hooks/usePet";
import { usePetAnimation } from "../../hooks/usePetAnimation";
import { useStudyStore } from "../../store/useStudyStore";
import { elapsedSeconds, formatDuration } from "../../lib/time";
import { petLevel } from "../../services/rewardService";
import {
  buyOrEquipAccessory,
  configurePet,
  feedPet,
  petAffection,
  playWithPet,
  restPet,
  sceneUnlocked,
  scenes,
  selectPetScene,
  timedVitals,
} from "../../services/petService";
import type { PetAction } from "../../types/pet";
import PetScene from "./PetScene";
import PetStats from "./PetStats";
import PetActions from "./PetActions";
import PetShop from "./PetShop";
import PetInventory from "./PetInventory";
import PetRewards from "./PetRewards";
import styles from "./PetGame.module.css";
export default function PetGame({
  onStudy,
  rewardError,
}: {
  onStudy: () => void;
  rewardError: string;
}) {
  const { pet, rewards, error } = usePet();
  const active = useStudyStore((state) => state.active);
  const [now, setNow] = useState(Date.now());
  const [panel, setPanel] = useState<"food" | "inventory" | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const visible = pet ? timedVitals(pet, now) : null;
  const { action, react } = usePetAnimation(visible, active, rewards);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  async function perform(
    run: () => Promise<unknown>,
    animation: PetAction,
    success: string,
  ) {
    setBusy(true);
    try {
      await run();
      react(animation);
      setMessage(success);
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Não foi possível salvar a ação.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (error)
    return (
      <p className="error-message" role="alert">
        {error}
      </p>
    );
  if (!pet)
    return (
      <p className="form-hint" role="status">
        Preparando o cantinho da Lufi…
      </p>
    );
  const level = petLevel(pet.xp);
  const index = scenes.findIndex((scene) => scene.id === pet.scene);
  return (
    <section id="pet-minigame" className={styles.game}>
      <header className={styles.header}>
        <div>
          <strong>{pet.name}</strong>
          <span>
            Nível {level.level} · {level.progress}/{level.required} XP
          </span>
        </div>
        <span>
          <Coins size={14} />
          {pet.coins.toLocaleString("pt-BR")}
        </span>
      </header>
      <PetStats pet={visible!} />
      <div className={styles.sceneNavigation}>
        <button
          id="pet-scene-previous"
          aria-label="Ambiente anterior"
          onClick={() =>
            void perform(
              () => selectPetScene(scenes[(index + 3) % 4].id),
              "idle",
              "Ambiente alterado.",
            )
          }
          disabled={busy}
        >
          <ChevronLeft size={16} />
        </button>
        <span>
          {scenes.map((scene) => (
            <button
              id={`pet-scene-select-${scene.id}`}
              key={scene.id}
              aria-label={`${scene.name}${sceneUnlocked(pet, scene.id) ? "" : ` bloqueado: ${scene.minutes} min e nível ${scene.level}`}`}
              aria-pressed={pet.scene === scene.id}
              title={`${scene.name} · ${scene.minutes} min · nível ${scene.level}`}
              onClick={() =>
                void perform(
                  () => selectPetScene(scene.id),
                  "idle",
                  "Ambiente alterado.",
                )
              }
              disabled={busy}
            >
              {!sceneUnlocked(pet, scene.id) ? <Lock size={9} /> : <i />}
            </button>
          ))}
        </span>
        <button
          id="pet-scene-next"
          aria-label="Próximo ambiente"
          onClick={() =>
            void perform(
              () => selectPetScene(scenes[(index + 1) % 4].id),
              "idle",
              "Ambiente alterado.",
            )
          }
          disabled={busy}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <PetScene
        pet={pet}
        action={action}
        onTouch={() => {
          if (!busy)
            void perform(petAffection, "affection", "A Lufi adorou o carinho!");
        }}
      />
      <p className={styles.studyMessage} role="status">
        {action === "celebrating" && rewards[0]
          ? `Parabéns! ${rewards[0].message}. +${rewards[0].coins} moedas · +${rewards[0].xp} XP`
          : active
            ? `${active.runningSince === null ? "Seu estudo está pausado." : "Estou estudando com você!"} ${formatDuration(elapsedSeconds(active, now))}`
            : pet.restingSince
              ? "Um descanso tranquilo recupera a energia."
              : "Um pouquinho por dia. Vamos juntos?"}
      </p>
      <PetActions
        busy={busy}
        onStudy={onStudy}
        onFeed={() => setPanel(panel === "food" ? null : "food")}
        onPlay={() =>
          void perform(
            playWithPet,
            "playing",
            "Hora de uma brincadeira curtinha.",
          )
        }
        onRest={() => {
          if (active?.runningSince !== null && active) {
            setMessage("Pause sua sessão antes de descansar.");
            return;
          }
          void perform(
            restPet,
            pet.restingSince ? "happy" : "sleeping",
            pet.restingSince ? "Bom dia!" : "Bom descanso.",
          );
        }}
        onCustomize={() => setPanel(panel === "inventory" ? null : "inventory")}
      />
      {message && (
        <p className="form-hint" role="status">
          {message}
        </p>
      )}
      {rewardError && (
        <p className="error-message" role="alert">
          {rewardError}
        </p>
      )}
      {panel === "food" && (
        <PetShop
          pet={pet}
          busy={busy}
          onFeed={(id) =>
            void perform(
              () => feedPet(id),
              "feeding",
              "Que delícia! Obrigada pelo cuidado.",
            )
          }
          onCoffee={() => {
            react("coffee");
            setMessage("Um café e um respiro. Sem pressa.");
          }}
        />
      )}
      {panel === "inventory" && (
        <PetInventory
          key={pet.id}
          pet={pet}
          busy={busy}
          onEquip={(id) =>
            void perform(
              () => buyOrEquipAccessory(id),
              "happy",
              "Acessório atualizado.",
            )
          }
          onConfigure={(name, rules) =>
            void perform(
              () => configurePet(name, rules),
              "happy",
              "Preferências salvas.",
            )
          }
        />
      )}
      <PetRewards rewards={rewards} />
      <p className={styles.footer}>
        10 min válidos: {pet.rules.minutes10} moedas + {pet.rules.minutes10} XP.{" "}
        Sua companheira nunca desaparece. Estudar é um convite, não uma punição.
      </p>
    </section>
  );
}
