import type { PointerEvent as ReactPointerEvent } from "react";
import type { PetAction, PetRecord } from "../../types/pet";
import PetCharacter from "./PetCharacter";
import styles from "./PetGame.module.css";
import { sceneImage } from "../../assets/pet/manifest";

export default function PetScene({
  pet,
  action,
  environment,
  look,
  petPosition,
  onTouch,
  onPetPointerDown,
  onPetPointerMove,
  onPetPointerUp,
  onPetPointerLeave,
}: {
  pet: PetRecord;
  action: PetAction;
  environment: "study" | "feed" | "play" | "rest" | "customize";
  look: { x: number; y: number };
  petPosition: { x: number; y: number };
  onTouch: () => void;
  onPetPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPetPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPetPointerUp: () => void;
  onPetPointerLeave: () => void;
}) {
  const garden = pet.scene === "garden";
  const background = sceneImage(pet.scene);
  return (
    <div
      id="pet-square-scene"
      className={styles.scene}
      data-scene={pet.scene}
      data-environment={environment}
    >
      {background ? (
        <img className={styles.scenery} src={background} alt="" />
      ) : (
        <svg
          viewBox="0 0 400 580"
          className={styles.scenery}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="room-wall" x2="0" y2="1">
              <stop stopColor={garden ? "#c8e7e2" : "#dcc6d1"} />
              <stop offset="1" stopColor={garden ? "#a9cfc5" : "#b89aaf"} />
            </linearGradient>
            <linearGradient id="room-sky" x2="0" y2="1">
              <stop stopColor="#79cafa" />
              <stop offset="1" stopColor="#d2f0f7" />
            </linearGradient>
            <linearGradient id="room-floor" x2="0" y2="1">
              <stop stopColor="#e9a057" />
              <stop offset="1" stopColor="#bd6538" />
            </linearGradient>
            <linearGradient id="rug" x2="0" y2="1">
              <stop stopColor="#fff0d6" />
              <stop offset="1" stopColor="#eabf98" />
            </linearGradient>
          </defs>
          <rect width="400" height="580" fill="url(#room-wall)" />
          <rect x="55" y="24" width="270" height="285" rx="4" fill="#8a4930" />
          <rect x="64" y="33" width="252" height="267" fill="url(#room-sky)" />
          <path d="M64 205q55-55 102 0t150-10v105H64Z" fill="#91d3c8" opacity=".8" />
          <path d="M64 238q62-54 123-8t129-12v82H64Z" fill="#76b886" />
          <g fill="#fff8e8" opacity=".82">
            <ellipse cx="123" cy="88" rx="31" ry="12" />
            <ellipse cx="144" cy="83" rx="22" ry="15" />
            <ellipse cx="251" cy="119" rx="26" ry="10" />
            <ellipse cx="267" cy="114" rx="18" ry="13" />
          </g>
          <g fill="#679b42">
            <circle cx="79" cy="40" r="29" />
            <circle cx="112" cy="34" r="23" />
            <circle cx="292" cy="47" r="30" />
            <circle cx="316" cy="77" r="26" />
            <circle cx="84" cy="178" r="25" />
            <circle cx="288" cy="193" r="29" />
          </g>
          <g fill="#9dc63d">
            <ellipse cx="74" cy="48" rx="15" ry="7" transform="rotate(32 74 48)" />
            <ellipse cx="104" cy="63" rx="17" ry="7" transform="rotate(-27 104 63)" />
            <ellipse cx="287" cy="58" rx="16" ry="7" transform="rotate(-30 287 58)" />
            <ellipse cx="307" cy="106" rx="17" ry="7" transform="rotate(32 307 106)" />
            <ellipse cx="87" cy="160" rx="16" ry="7" transform="rotate(-35 87 160)" />
          </g>
          <path d="M190 33v267M64 166h252" stroke="#a65c35" strokeWidth="12" />
          <path d="M196 33v267M64 172h252" stroke="#f7bd78" strokeWidth="3" opacity=".8" />
          <path d="M53 19h274M53 309h274" stroke="#75412f" strokeWidth="9" />
          <path d="M48 22q10 85 5 180t3 112l36-5q-10-60 6-135t-3-145Z" fill="#f3d9d0" />
          <path d="M327 23q-9 85-4 177t-4 112l-38-4q12-69-5-137t2-145Z" fill="#f3d9d0" />
          <path d="M55 20q26 30 18 98m246-98q-28 29-19 97" fill="none" stroke="#fff4e8" strokeWidth="7" opacity=".7" />
          <rect y="317" width="400" height="111" fill="url(#room-wall)" />
          <path d="M0 426h400" stroke="#854d37" strokeWidth="12" />
          <rect y="438" width="400" height="142" fill="url(#room-floor)" />
          <g stroke="#9e5534" strokeWidth="3" opacity=".55">
            <path d="M0 469h400M0 509h400M0 550h400" />
            <path d="M76 438v42m142-42v42m120-42v42M22 482v27m131-27v27m144-27v27M86 523v27m153-27v27m116-27v27" />
          </g>
          <g>
            <rect x="0" y="143" width="65" height="287" rx="5" fill="#9b5631" />
            <rect x="8" y="153" width="48" height="258" fill="#bd7745" />
            <path d="M8 237h48m-48 83h48" stroke="#74432e" strokeWidth="7" />
            <rect x="14" y="182" width="10" height="49" rx="2" fill="#8b7098" />
            <rect x="27" y="174" width="10" height="57" rx="2" fill="#d5aa62" />
            <rect x="40" y="188" width="10" height="43" rx="2" fill="#608b83" />
            <rect x="8" y="356" width="48" height="40" rx="5" fill="#d69a6b" />
            <path d="M22 369h21" stroke="#905a3e" strokeWidth="3" />
          </g>
          <g>
            <path d="M94 394q-2-74-29-119m29 119q24-72 60-86m-60 86q-42-55-64-54m64 54q27-45 58-43" fill="none" stroke="#517b3d" strokeWidth="8" strokeLinecap="round" />
            <path d="M64 275q-21-26-42-5 18 25 42 5m34-15q4-33 34-32 1 27-34 32m-31 34q-27-23-44-2 17 23 44 2m64-27q25-25 46-7-18 25-46 7" fill="#78a94d" />
            <path d="M52 379h86l-10 48H62Z" fill="#d49a6d" />
            <ellipse cx="95" cy="379" rx="43" ry="10" fill="#b87953" />
          </g>
          <g>
            <rect x="286" y="337" width="114" height="16" rx="4" fill="#a85f37" />
            <path d="M299 352v91m87-91v91" stroke="#875035" strokeWidth="10" />
            <rect x="305" y="303" width="48" height="34" rx="5" fill="#d3893f" />
            <path d="M311 303v-42m14 42v-53m14 53v-39" stroke="#517ca2" strokeWidth="5" strokeLinecap="round" />
            <path d="M355 330h39" stroke="#f0c77c" strokeWidth="8" />
          </g>
          <ellipse cx="205" cy="535" rx="207" ry="79" fill="url(#rug)" />
          <ellipse cx="205" cy="535" rx="193" ry="66" fill="none" stroke="#f9d5af" strokeWidth="7" strokeDasharray="3 8" />
          {environment === "feed" && (
            <g>
              <rect x="244" y="350" width="145" height="22" rx="7" fill="#b86c43" />
              <path d="M259 372v48m112-48v48" stroke="#875035" strokeWidth="9" />
              <rect x="266" y="322" width="41" height="27" rx="7" fill="#f3d9b8" />
              <path d="M306 328q16 0 7 15h-7" fill="none" stroke="#8a5f47" strokeWidth="4" />
              <ellipse cx="335" cy="347" rx="18" ry="7" fill="#f7e9d8" />
            </g>
          )}
          {environment === "play" && (
            <g>
              <g transform="translate(0 -150)">
                <g className={styles.playToyBall}>
                  <circle cx="88" cy="469" r="25" fill="#e58c75" stroke="#a9574f" strokeWidth="4" />
                  <path d="M68 458q20 23 40 4m-37 18q20-22 37 4m-34-31q12 18 2 38" fill="none" stroke="#fff0d4" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="88" cy="469" r="5" fill="#f3cf83" />
                  <ellipse cx="88" cy="497" rx="25" ry="6" fill="#75513d" opacity=".18" />
                </g>
              </g>
              <g transform="translate(0 -150)">
                <g className={styles.playToyFish}>
                  <ellipse cx="301" cy="473" rx="27" ry="17" fill="#f2bc62" stroke="#b57a39" strokeWidth="4" />
                  <path d="m278 473-20-15v30Z" fill="#e88e71" stroke="#b57a39" strokeWidth="4" strokeLinejoin="round" />
                  <path d="m296 460 8-11 9 15" fill="#f4d28a" stroke="#b57a39" strokeWidth="3" strokeLinejoin="round" />
                  <circle cx="311" cy="469" r="3" fill="#513e34" />
                  <path d="M289 467q9 7 0 14" fill="none" stroke="#fff1d9" strokeWidth="3" />
                  <ellipse cx="300" cy="497" rx="28" ry="6" fill="#75513d" opacity=".18" />
                </g>
              </g>
              <g transform="translate(180 -150)">
                <g className={styles.playToyFeather}>
                  <path d="M167 495q-19-40 7-68 23 31-7 68Z" fill="#83b79a" stroke="#4d806a" strokeWidth="4" />
                  <path d="m166 493 11-46m-9 29-11-13m14 4 12-10" fill="none" stroke="#f1f0c5" strokeWidth="3" strokeLinecap="round" />
                  <path d="m162 496-9 10m10-9 3 12" stroke="#b97953" strokeWidth="4" strokeLinecap="round" />
                  <ellipse cx="166" cy="514" rx="17" ry="5" fill="#75513d" opacity=".16" />
                </g>
              </g>
            </g>
          )}
          {environment === "rest" && (
            <g>
              <rect x="112" y="374" width="190" height="73" rx="18" fill="#8396bd" />
              <rect x="124" y="362" width="70" height="35" rx="15" fill="#f2e7d8" />
              <path d="M119 430h177" stroke="#63789e" strokeWidth="9" />
              <path d="M345 68a22 22 0 1 0 22 28 20 20 0 0 1-22-28Z" fill="#fff0bd" />
            </g>
          )}
          {environment === "customize" && (
            <g>
              <rect x="276" y="166" width="110" height="205" rx="7" fill="#a85f37" />
              <rect x="286" y="177" width="90" height="183" rx="4" fill="#d08b56" />
              <path d="M331 178v181" stroke="#8d4e34" strokeWidth="5" />
              <circle cx="322" cy="268" r="4" fill="#f3d9a8" />
              <circle cx="342" cy="268" r="4" fill="#f3d9a8" />
              <path d="M292 216h33m14 0h32" stroke="#efc68f" strokeWidth="5" />
            </g>
          )}
          {pet.scene === "garden" && (
            <g fill="#f1d77e" opacity=".85">
              <circle cx="355" cy="95" r="22" />
              <path d="M355 57v-13m0 102v-13m-38-38h-13m102 0h-13m-65-27-9-9m72 72-9-9m0-54 9-9m-72 72 9-9" stroke="#f1d77e" strokeWidth="5" />
            </g>
          )}
        </svg>
      )}
      <button
        id="pet-touch-character"
        className={styles.characterButton}
        aria-label={`Fazer carinho em ${pet.name}`}
        onClick={onTouch}
        onPointerDown={onPetPointerDown}
        onPointerMove={onPetPointerMove}
        onPointerUp={onPetPointerUp}
        onPointerLeave={onPetPointerLeave}
        style={{ left: `${petPosition.x}%`, top: `${petPosition.y}%` }}
      >
        <PetCharacter action={action} accessory={pet.equipped} look={look} />
      </button>
      <span className={styles.sceneLabel}>
        {environment === "study"
          ? "Cantinho de estudos"
          : environment === "feed"
            ? "Cozinha"
            : environment === "play"
              ? "Sala de brincar"
              : environment === "rest"
                ? "Quarto"
                : "Guarda-roupa"}
      </span>
    </div>
  );
}
