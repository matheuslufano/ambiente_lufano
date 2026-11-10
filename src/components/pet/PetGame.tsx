import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Coins,
  Volume2,
  VolumeX,
} from "lucide-react";
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

type EnvironmentKey = "study" | "feed" | "play" | "rest" | "customize";

const STORAGE_KEYS = {
  sound: "lufi-sound-enabled",
  volume: "lufi-sound-volume",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

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
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [activeEnvironment, setActiveEnvironment] =
    useState<EnvironmentKey>("study");
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [petPosition, setPetPosition] = useState({ x: 50, y: 40 });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem(STORAGE_KEYS.sound);
    return saved === null ? true : saved === "true";
  });
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window === "undefined") return 0.7;
    const storedVolume = window.localStorage.getItem(STORAGE_KEYS.volume);
    if (storedVolume === null) return 0.7;
    const saved = Number(storedVolume);
    return Number.isFinite(saved) ? clamp(saved, 0, 1) : 0.7;
  });

  const sceneRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({
    dragging: false,
    moved: false,
    pointerId: -1,
    originX: 0,
    originY: 0,
  });
  const operationLock = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const visible = pet ? timedVitals(pet, now) : null;
  const { action, react } = usePetAnimation(visible, active, rewards);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.sound, String(soundEnabled));
    window.localStorage.setItem(STORAGE_KEYS.volume, String(volume));
  }, [soundEnabled, volume]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const playTone = useCallback(
    (kind: "study" | "feed" | "play" | "rest" | "customize" | "pet") => {
      if (!soundEnabled || volume <= 0 || typeof window === "undefined") return;
      const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return;
      const context = audioContextRef.current ?? new AudioCtor();
      audioContextRef.current = context;
      if (context.state === "suspended") {
        void context.resume();
      }

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const baseFrequency =
        kind === "study"
          ? 520
          : kind === "feed"
            ? 390
            : kind === "play"
              ? 640
              : kind === "rest"
                ? 280
                : kind === "customize"
                  ? 460
                  : 480;

      oscillator.type =
        kind === "play" ? "square" : kind === "rest" ? "triangle" : "sine";
      oscillator.frequency.value = baseFrequency;
      gain.gain.value = 0.0001;
      gain.gain.exponentialRampToValueAtTime(volume * 0.04, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.22);
    },
    [soundEnabled, volume],
  );

  useEffect(() => {
    const element = sceneRef.current;
    if (!element) return;

    let raf = 0;
    const updateLook = (clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      const relativeX = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const relativeY = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      const x = clamp(relativeX * 20, -12, 12);
      const y = clamp(relativeY * 16, -8, 8);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setLook({ x, y }));
    };

    const handleMove = (event: PointerEvent) => {
      updateLook(event.clientX, event.clientY);
    };
    const handleLeave = () => setLook({ x: 0, y: 0 });

    element.addEventListener("pointermove", handleMove);
    element.addEventListener("pointerleave", handleLeave);
    return () => {
      cancelAnimationFrame(raf);
      element.removeEventListener("pointermove", handleMove);
      element.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const element = sceneRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (inside) {
        event.preventDefault();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  async function perform(
    run: () => Promise<unknown>,
    animation: PetAction,
    success: string,
  ) {
    if (operationLock.current) return;
    operationLock.current = true;
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
      operationLock.current = false;
    }
  }

  const handlePetDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    event.preventDefault();
    event.stopPropagation();
    const scene = sceneRef.current;
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    const nextX = ((event.clientX - rect.left) / rect.width) * 100;
    const nextY = ((event.clientY - rect.top) / rect.height) * 100;
    dragState.current = {
      dragging: true,
      moved: false,
      pointerId: event.pointerId,
      originX: nextX,
      originY: nextY,
    };
    setPetPosition({
      x: clamp(nextX, 28, 72),
      y: clamp(nextY, 5, 48),
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePetMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragState.current.dragging || event.pointerId !== dragState.current.pointerId)
      return;
    event.preventDefault();
    const scene = sceneRef.current;
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 28, 72);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 5, 48);
    setPetPosition({ x, y });
    const movedX = Math.abs(x - dragState.current.originX) > 4;
    const movedY = Math.abs(y - dragState.current.originY) > 4;
    if (movedX || movedY) {
      dragState.current.moved = true;
    }
  };

  const stopDrag = () => {
    dragState.current.dragging = false;
    dragState.current.pointerId = -1;
  };

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
  const renderEnvironment = () => {
    switch (activeEnvironment) {
      case "feed":
        return (
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
              playTone("rest");
            }}
          />
        );
      case "play":
        return (
          <div
            className={`${styles.sceneInteraction} ${styles.playInteraction}`}
            aria-label="Brinquedos da Lufi"
          >
            {[
              { id: "ball", icon: "🧶", label: "Bola de lã" },
              { id: "fish", icon: "🐟", label: "Peixe de brinquedo" },
              { id: "shell", icon: "🐚", label: "Conchinha" },
            ].map((toy) => (
              <button
                key={toy.id}
                className={styles.toyButton}
                type="button"
                aria-label={`Brincar com ${toy.label}`}
                title={toy.label}
                disabled={busy}
                onClick={() => {
                  playTone("play");
                  react("playing");
                  void perform(
                    playWithPet,
                    "playing",
                    "Hora de uma brincadeira curtinha.",
                  );
                }}
              >
                <span aria-hidden="true">{toy.icon}</span>
                <small>{toy.label}</small>
              </button>
            ))}
          </div>
        );
      case "rest":
        return (
          <div className={styles.sceneInteraction}>
            <button
              className={styles.environmentButton}
              type="button"
              disabled={busy || (active?.runningSince !== null && active !== null)}
              onClick={() => {
                if (active?.runningSince !== null && active) {
                  setMessage("Pause sua sessão antes de descansar.");
                  return;
                }
                playTone("rest");
                void perform(
                  restPet,
                  pet.restingSince ? "happy" : "sleeping",
                  pet.restingSince ? "Bom dia!" : "Bom descanso.",
                );
              }}
            >
              {pet.restingSince ? "Acordar a Lufi" : "Deixar a Lufi descansar"}
            </button>
          </div>
        );
      case "customize":
        return (
          wardrobeOpen ? (
            <div className={styles.inventoryInteraction}>
              <PetInventory
                key={pet.id}
                pet={pet}
                busy={busy}
                onClose={() => setWardrobeOpen(false)}
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
            </div>
          ) : (
            <button
              type="button"
              className={styles.wardrobeTrigger}
              onClick={() => setWardrobeOpen(true)}
            >
              Abrir armário
            </button>
          )
        );
      case "study":
      default:
        return (
          <div className={styles.sceneInteraction}>
            <span className={styles.environmentBadge}>
              {active
                ? `${active.runningSince === null ? "Estudo pausado" : "Estudando com você"} · ${formatDuration(elapsedSeconds(active, now))}`
                : "Pronta para estudar"}
            </span>
            {!active && (
              <button
                className={styles.environmentButton}
                type="button"
                onClick={() => {
                  playTone("study");
                  onStudy();
                }}
              >
                Escolher sessão de estudo
              </button>
            )}
          </div>
        );
    }
  };

  const onStudyEnvironment = () => {
    setActiveEnvironment("study");
  };

  return (
    <section
      id="pet-minigame"
      className={styles.game}
      data-environment={activeEnvironment}
    >
      <header className={styles.header}>
        <div className={styles.identity}>
          <strong>{pet.name}</strong>
          <span>
            Nível {level.level} · {level.progress}/{level.required} XP
          </span>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.soundButton}
            aria-label={soundEnabled ? "Silenciar o pet" : "Ativar sons do pet"}
            onClick={() => setSoundEnabled((current) => !current)}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <label className={styles.volumeControl} aria-label="Volume do pet">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
            />
          </label>
          <span className={styles.coinsBadge}>
            <Coins size={13} />
            {pet.coins.toLocaleString("pt-BR")}
          </span>
        </div>
      </header>

      <PetStats pet={visible ?? pet} />

      <div ref={sceneRef} className={styles.sceneShell}>
        <PetScene
          pet={pet}
          action={action}
          environment={activeEnvironment}
          look={look}
          petPosition={petPosition}
          onPetPointerDown={handlePetDown}
          onPetPointerMove={handlePetMove}
          onPetPointerUp={stopDrag}
          onPetPointerLeave={stopDrag}
          onTouch={() => {
            if (!busy && !dragState.current.moved) {
              playTone("pet");
              void perform(
                petAffection,
                "affection",
                "A Lufi adorou o carinho!",
              );
            }
            dragState.current.moved = false;
          }}
        />
        {renderEnvironment()}
      </div>

      <PetActions
        busy={busy}
        active={activeEnvironment}
        onStudy={onStudyEnvironment}
        onFeed={() => {
          setActiveEnvironment("feed");
          setMessage("");
          playTone("feed");
        }}
        onPlay={() => {
          setActiveEnvironment("play");
          setMessage("");
          playTone("play");
        }}
        onRest={() => {
          setActiveEnvironment("rest");
          setMessage("");
          playTone("rest");
        }}
        onCustomize={() => {
          setActiveEnvironment("customize");
          setWardrobeOpen(true);
          setMessage("");
          playTone("customize");
        }}
      />

      <div className={styles.footnote} aria-live="polite">
        {message && <span role="status">{message}</span>}
        {rewardError && <span className="error-message" role="alert">{rewardError}</span>}
        <PetRewards rewards={rewards} />
      </div>
    </section>
  );
}
