import type { PetAction, PetRecord } from "../../types/pet";
import { scenes } from "../../services/petService";
import PetCharacter from "./PetCharacter";
import styles from "./PetGame.module.css";
import { sceneImage } from "../../assets/pet/manifest";
export default function PetScene({
  pet,
  action,
  onTouch,
}: {
  pet: PetRecord;
  action: PetAction;
  onTouch: () => void;
}) {
  const garden = pet.scene === "garden";
  const background = sceneImage(pet.scene);
  return (
    <div id="pet-square-scene" className={styles.scene} data-scene={pet.scene}>
      {background ? (
        <img className={styles.scenery} src={background} alt="" />
      ) : (
        <svg
          viewBox="0 0 400 400"
          className={styles.scenery}
          aria-hidden="true"
        >
          <rect
            width="400"
            height="400"
            fill={
              garden
                ? "#e4eedc"
                : pet.scene === "study-room"
                  ? "#e5eadd"
                  : pet.scene === "library"
                    ? "#eadfcf"
                    : "#f3e9dc"
            }
          />
          <rect
            y="265"
            width="400"
            height="135"
            fill={garden ? "#a9c59a" : "#cfb394"}
          />
          <path
            d="M0 265h400M0 325h400m-280-60v135m160-135v135"
            stroke={garden ? "#99b989" : "#bca083"}
            strokeWidth="2"
          />
          {garden ? (
            <>
              <circle cx="320" cy="65" r="28" fill="#e8d791" />
              <path
                d="M42 270V116m310 154V148"
                stroke="#aa8d68"
                strokeWidth="13"
              />
              <circle cx="44" cy="110" r="55" fill="#95b087" />
              <circle cx="352" cy="125" r="53" fill="#afc19a" />
              <path
                d="M20 294q15-20 30 0m285 28q20-26 40 0"
                stroke="#7f9f78"
                fill="none"
              />
            </>
          ) : (
            <>
              <rect
                x="140"
                y="33"
                width="118"
                height="127"
                rx="40"
                fill="#c5d9d4"
                stroke="#fff8e8"
                strokeWidth="8"
              />
              <path
                d="M199 33v127m-59-64h118"
                stroke="#fff8e8"
                strokeWidth="5"
              />
              <path
                d="m140 45 16 110m100-110-16 110"
                stroke="#d8bfaa"
                strokeWidth="14"
              />
              {pet.scene === "library" ? (
                <>
                  <rect
                    x="14"
                    y="49"
                    width="93"
                    height="212"
                    rx="4"
                    fill="#a28569"
                  />
                  <path
                    d="M14 115h93M14 185h93"
                    stroke="#80664f"
                    strokeWidth="8"
                  />
                  {[27, 45, 63, 81].map((x, i) => (
                    <g key={x}>
                      <rect
                        x={x}
                        y={68 + (i % 2) * 7}
                        width="12"
                        height={42 - (i % 2) * 7}
                        fill={["#7a9c8a", "#cb9b78", "#97a9b6", "#c5b58e"][i]}
                      />
                      <rect
                        x={x}
                        y={135 + (i % 2) * 7}
                        width="12"
                        height={43 - (i % 2) * 7}
                        fill={["#c5b58e", "#97a9b6", "#cb9b78", "#7a9c8a"][i]}
                      />
                    </g>
                  ))}
                </>
              ) : pet.scene === "study-room" ? (
                <>
                  <rect
                    x="28"
                    y="166"
                    width="67"
                    height="11"
                    rx="2"
                    fill="#7f9b89"
                  />
                  <rect
                    x="22"
                    y="180"
                    width="80"
                    height="12"
                    rx="2"
                    fill="#be9778"
                  />
                  <rect
                    x="30"
                    y="195"
                    width="65"
                    height="11"
                    rx="2"
                    fill="#a2acb9"
                  />
                  <path
                    d="M25 213h75m-65 0v56m54-56v56"
                    stroke="#aa896c"
                    strokeWidth="7"
                  />
                  <rect
                    x="26"
                    y="57"
                    width="72"
                    height="65"
                    rx="4"
                    fill="#fff6df"
                    stroke="#cfbd9f"
                  />
                  <path
                    d="M38 77h45m-45 12h35m-35 12h39"
                    stroke="#b9c5ad"
                    strokeWidth="3"
                  />
                </>
              ) : (
                <>
                  <rect
                    x="16"
                    y="210"
                    width="92"
                    height="44"
                    rx="10"
                    fill="#c1a0a0"
                  />
                  <rect
                    x="16"
                    y="184"
                    width="92"
                    height="31"
                    rx="10"
                    fill="#e1cfbf"
                  />
                  <path
                    d="M27 254v20m67-20v20"
                    stroke="#a78c73"
                    strokeWidth="7"
                  />
                </>
              )}
              <rect
                x="288"
                y="207"
                width="98"
                height="14"
                rx="4"
                fill="#aa896c"
              />
              <path d="M300 221v55m72-55v55" stroke="#92765e" strokeWidth="6" />
              <rect
                x="316"
                y="150"
                width="48"
                height="41"
                rx="4"
                fill="#7b9591"
              />
              <path d="M340 191v15" stroke="#637b77" strokeWidth="5" />
              <path
                d="M302 205v-57l-13-20"
                stroke="#bda463"
                strokeWidth="5"
                fill="none"
              />
              <path d="m274 126 27-8 5 20h-38Z" fill="#d7bc79" />
            </>
          )}
          <ellipse
            cx="200"
            cy="336"
            rx="112"
            ry="39"
            fill={garden ? "#91b185" : "#dfcfae"}
          />
          <ellipse
            cx="201"
            cy="344"
            rx="69"
            ry="13"
            fill="#71513b"
            opacity=".12"
          />
        </svg>
      )}
      <button
        id="pet-touch-character"
        className={styles.characterButton}
        aria-label={`Fazer carinho em ${pet.name}`}
        onClick={onTouch}
      >
        <PetCharacter action={action} accessory={pet.equipped} />
      </button>
      <span className={styles.sceneLabel}>
        {scenes.find((scene) => scene.id === pet.scene)?.name}
      </span>
    </div>
  );
}
