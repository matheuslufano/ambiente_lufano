import { BookOpen, Fish, Gamepad2, Moon, Shirt } from "lucide-react";
import styles from "./PetGame.module.css";
export default function PetActions({
  busy,
  onStudy,
  onFeed,
  onPlay,
  onRest,
  onCustomize,
}: {
  busy: boolean;
  onStudy: () => void;
  onFeed: () => void;
  onPlay: () => void;
  onRest: () => void;
  onCustomize: () => void;
}) {
  return (
    <div id="pet-action-bar" className={styles.actions}>
      {[
        { id: "study", label: "Estudar", icon: BookOpen, run: onStudy },
        { id: "feed", label: "Alimentar", icon: Fish, run: onFeed },
        { id: "play", label: "Brincar", icon: Gamepad2, run: onPlay },
        { id: "rest", label: "Descansar", icon: Moon, run: onRest },
        {
          id: "customize",
          label: "Personalizar",
          icon: Shirt,
          run: onCustomize,
        },
      ].map(({ id, label, icon: Icon, run }) => (
        <button key={id} id={`pet-action-${id}`} disabled={busy} onClick={run}>
          <Icon size={17} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
