import { useId } from "react";
import type { PetAction } from "../../types/pet";
import styles from "./PetGame.module.css";
import PetAccessory from "./PetAccessory";
import {
  petImage,
  accessoryImage,
  itemImage,
  hasPetPose,
} from "../../assets/pet/manifest";
/** Temporary layered vector; replace with transparent official PNGs via the asset manifest. */
export default function PetCharacter({
  action,
  accessory,
}: {
  action: PetAction;
  accessory: string | null;
}) {
  const id = useId();
  const reading = action === "reading";
  const cup = action === "coffee";
  const feeding = action === "feeding";
  const sleeping = action === "sleeping";
  const sprite = petImage(action),
    accessorySprite = accessoryImage(accessory);
  const held = !hasPetPose(action)
    ? itemImage(
        action === "reading"
          ? "book"
          : action === "coffee"
            ? "coffee"
            : action === "feeding"
              ? "food"
              : action === "playing"
                ? "toy"
                : "",
      )
    : null;
  if (sprite)
    return (
      <span className={styles.spriteWrapper}>
        <img
          className={styles.character}
          data-action={action}
          src={sprite}
          alt={`Lufi ${action}`}
        />
        {held && <img className={styles.heldItem} src={held} alt="" />}
        {accessorySprite ? (
          <img className={styles.accessoryLayer} src={accessorySprite} alt="" />
        ) : (
          <svg
            className={styles.accessoryLayer}
            viewBox="0 0 260 300"
            aria-hidden="true"
          >
            <g stroke="#65402f" strokeWidth="2.8">
              <PetAccessory accessory={accessory} />
            </g>
          </svg>
        )}
      </span>
    );
  return (
    <svg
      viewBox="0 0 260 300"
      className={styles.character}
      data-action={action}
      role="img"
      aria-label={`Lufi ${sleeping ? "dormindo" : reading ? "estudando" : action === "playing" ? "brincando" : "sua companheira de estudos"}`}
    >
      <defs>
        <radialGradient id={`${id}-fur`} cx="35%" cy="25%" r="80%">
          <stop stopColor="#dca585" />
          <stop offset="1" stopColor="#a9684d" />
        </radialGradient>
        <radialGradient id={`${id}-cream`}>
          <stop stopColor="#fff0d7" />
          <stop offset="1" stopColor="#e4bf9b" />
        </radialGradient>
      </defs>
      <g stroke="#65402f" strokeWidth="2.8" strokeLinejoin="round">
        <path
          d="M167 221 Q218 247 233 197 Q242 178 246 198 Q253 252 207 270 Q180 278 161 252Z"
          fill={`url(#${id}-fur)`}
        />
        <ellipse cx="128" cy="218" rx="65" ry="66" fill={`url(#${id}-fur)`} />
        <ellipse
          cx="129"
          cy="219"
          rx="42"
          ry="53"
          fill={`url(#${id}-cream)`}
          stroke="none"
        />
        <ellipse cx="61" cy="83" rx="17" ry="19" fill={`url(#${id}-fur)`} />
        <ellipse cx="198" cy="83" rx="17" ry="19" fill={`url(#${id}-fur)`} />
        <path
          d="M56 88q-7-15 7-14M195 73q15 0 8 16"
          stroke="#9b6550"
          strokeWidth="5"
          fill="none"
        />
        <path
          d="M60 102Q65 43 129 44Q191 44 201 99Q218 158 172 176Q128 197 82 172Q48 155 60 102Z"
          fill={`url(#${id}-fur)`}
        />
        <path
          d="M62 122Q85 105 109 120Q129 108 149 120Q177 105 200 124Q210 163 169 176Q129 192 88 174Q52 162 62 122Z"
          fill={`url(#${id}-cream)`}
          stroke="none"
        />
        <g className={styles.eyes}>
          {sleeping ? (
            <path
              d="M85 107q9 9 17 0M157 107q9 9 17 0"
              fill="none"
              strokeWidth="4"
            />
          ) : (
            <>
              <ellipse cx="95" cy="104" rx="12" ry="15" fill="#342019" />
              <ellipse cx="164" cy="104" rx="12" ry="15" fill="#342019" />
              <circle cx="91" cy="99" r="4" fill="#fff" stroke="none" />
              <circle cx="160" cy="99" r="4" fill="#fff" stroke="none" />
              <circle cx="99" cy="109" r="2" fill="#fff" stroke="none" />
              <circle cx="168" cy="109" r="2" fill="#fff" stroke="none" />
            </>
          )}
        </g>
        <path
          d="M84 84q7-8 13-4M160 80q9-4 15 5"
          stroke="#f8dabb"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse
          cx="77"
          cy="126"
          rx="13"
          ry="7"
          fill="#ec9c97"
          opacity=".65"
          stroke="none"
        />
        <ellipse
          cx="182"
          cy="126"
          rx="13"
          ry="7"
          fill="#ec9c97"
          opacity=".65"
          stroke="none"
        />
        <path
          d="M115 124Q129 114 142 124Q137 137 129 136Q120 134 115 124Z"
          fill="#85503c"
        />
        <path
          d="M129 135v8m0 0q-14 10-22-2m22 2q14 10 22-2"
          fill="none"
          strokeWidth="2.3"
        />
        {!sleeping && (
          <path
            className={styles.mouth}
            d={
              action === "hungry"
                ? "M119 155q10-10 20 0"
                : "M119 150q10 15 20 0"
            }
            fill={action === "hungry" ? "none" : "#d7817b"}
          />
        )}
        <g strokeWidth="1" opacity=".7">
          <path d="M94 132 44 126m51 12-52 2m50 3-45 12m115-22 50-7m-51 12 52 2m-50 4 45 11" />
        </g>
        <ellipse
          cx="86"
          cy="256"
          rx="23"
          ry="31"
          transform="rotate(-15 86 256)"
          fill={`url(#${id}-fur)`}
        />
        <ellipse
          cx="168"
          cy="256"
          rx="23"
          ry="31"
          transform="rotate(15 168 256)"
          fill={`url(#${id}-fur)`}
        />
        <ellipse
          cx="86"
          cy="261"
          rx="13"
          ry="18"
          fill="#e6a58e"
          stroke="none"
        />
        <ellipse
          cx="168"
          cy="261"
          rx="13"
          ry="18"
          fill="#e6a58e"
          stroke="none"
        />
        {reading && (
          <g className={styles.heldBook}>
            <path
              d="M84 187q23-12 45 0q24-12 45 0v43q-23-10-45 0q-24-10-45 0Z"
              fill="#76957e"
            />
            <path d="M129 187v43" />
            <path
              d="M96 195h23m-23 8h23m22-8h22m-22 8h22"
              stroke="#f8f1d9"
              strokeWidth="2"
            />
            <path
              className={styles.turningPage}
              d="M130 188q23-9 42 0v40q-20-9-42 0Z"
              fill="#f7edcf"
              stroke="none"
              opacity=".5"
            />
          </g>
        )}
        {cup && (
          <g>
            <path d="M109 190h43v37q-21 10-43 0Z" fill="#fff0d4" />
            <path d="M152 196q24 0 15 19h-15" fill="none" />
            <ellipse cx="130" cy="191" rx="21" ry="5" fill="#79513a" />
            <path
              d="M124 176q-8-8 1-15m11 15q-7-8 1-15"
              stroke="#fff8e8"
              fill="none"
              strokeWidth="3"
            />
          </g>
        )}
        {feeding && (
          <g>
            <ellipse cx="130" cy="201" rx="27" ry="13" fill="#9cbfc4" />
            <path d="m151 202 15-13v24Z" fill="#9cbfc4" />
            <circle cx="114" cy="199" r="2" fill="#354e50" stroke="none" />
          </g>
        )}
        <ellipse
          cx="86"
          cy="198"
          rx="13"
          ry="26"
          transform="rotate(-35 86 198)"
          fill={`url(#${id}-fur)`}
        />
        <ellipse
          cx="172"
          cy="198"
          rx="13"
          ry="26"
          transform="rotate(35 172 198)"
          fill={`url(#${id}-fur)`}
        />
        <PetAccessory accessory={accessory} />
      </g>
      {sleeping && (
        <text x="200" y="52" fill="#8f9fa5" fontSize="20" fontFamily="serif">
          z z
        </text>
      )}
      {action === "playing" && (
        <circle
          cx="214"
          cy="271"
          r="16"
          fill="#d7937c"
          stroke="#795040"
          strokeWidth="2"
        />
      )}
      {(action === "celebrating" ||
        action === "affection" ||
        action === "happy") && (
        <g fill="#e0b766">
          <path d="m45 45 3-9 4 9 9 3-9 4-4 9-3-9-9-4Zm162 107 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z" />
          <circle cx="38" cy="180" r="3" />
          <circle cx="210" cy="38" r="4" />
        </g>
      )}
    </svg>
  );
}
