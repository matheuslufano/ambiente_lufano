export default function PetAccessory({
  accessory,
}: {
  accessory: string | null;
}) {
  return (
    <>
      {accessory === "glasses" && (
        <g fill="none" stroke="#4c514a" strokeWidth="4">
          <circle cx="95" cy="106" r="21" />
          <circle cx="164" cy="106" r="21" />
          <path d="M116 103h27M74 99l-13-7m124 7 13-7" />
        </g>
      )}
      {accessory === "headphones" && (
        <g fill="#6d7891" stroke="#44495e" strokeWidth="4">
          <path
            d="M59 102Q48 35 129 32Q212 35 201 102"
            fill="none"
            strokeWidth="10"
          />
          <rect x="52" y="94" width="15" height="36" rx="7" />
          <rect x="193" y="94" width="15" height="36" rx="7" />
        </g>
      )}
      {accessory === "graduation" && (
        <g fill="#425b58">
          <path d="m82 46 47-22 48 22-48 20Z" />
          <path d="M100 58v14q28 14 57 0V58" />
          <path d="M176 47v29" fill="none" stroke="#d7ae54" strokeWidth="3" />
        </g>
      )}
      {accessory === "bow" && (
        <g fill="#e97991" stroke="#a8425d" strokeWidth="3">
          <path d="M70 91Q45 66 44 92q1 23 26 9m15-10q25-25 26 1-1 23-26 9" />
          <circle cx="78" cy="94" r="7" fill="#ffd47a" />
        </g>
      )}
      {accessory === "flower" && (
        <g transform="translate(190 82)" stroke="#b25665" strokeWidth="2">
          <circle cy="-9" r="7" fill="#ffb5c5" />
          <circle cx="9" r="7" fill="#ffb5c5" />
          <circle cy="9" r="7" fill="#ffb5c5" />
          <circle cx="-9" r="7" fill="#ffb5c5" />
          <circle r="5" fill="#ffd56c" />
        </g>
      )}
      {accessory === "scarf" && (
        <g fill="#73a8bd" stroke="#456e86" strokeWidth="3">
          <path d="M75 155q54 25 108 0l-7 19q-48 20-94 0Z" />
          <path d="m154 168 19 5-5 38-18-8Z" />
        </g>
      )}
      {accessory === "crown" && (
        <g fill="#f3c94f" stroke="#a77c28" strokeWidth="3">
          <path d="m82 68 8-32 24 20 15-33 16 33 24-20 8 32Z" />
          <path d="M86 69h87v11H86Z" />
          <circle cx="105" cy="67" r="4" fill="#f48c9f" stroke="none" />
          <circle cx="151" cy="67" r="4" fill="#80c6d5" stroke="none" />
        </g>
      )}
      {accessory === "cape" && (
        <path
          d="M72 164q57 24 114 0l22 76q-79-35-158 0Z"
          fill="#9b7ac4"
          stroke="#66518a"
          strokeWidth="4"
        />
      )}
      {accessory === "beret" && (
        <g stroke="#774665" strokeWidth="3" strokeLinejoin="round">
          <path d="M77 62q8-30 47-31 34 1 43 31-37 18-90 4Z" fill="#bc7aa6" />
          <path d="M76 63q43 12 92-1" fill="none" stroke="#f0bfd7" strokeWidth="4" />
          <circle cx="126" cy="33" r="5" fill="#f3d37e" />
        </g>
      )}
      {accessory === "bandana" && (
        <g fill="#e58a62" stroke="#a9574f" strokeWidth="3" strokeLinejoin="round">
          <path d="M76 154q53 23 106 0l-9 28-43 25-45-25Z" />
          <path d="m82 177-12 21 24-8" />
          <path d="m176 177 14 20-25-7" />
          <path d="m112 175 17 10 17-10" fill="none" stroke="#ffe0a2" strokeWidth="3" />
        </g>
      )}
      {accessory === "backpack" && (
        <g stroke="#73543e" strokeWidth="4" strokeLinejoin="round">
          <path d="M170 173q27-10 38 11l8 49q-18 17-40 7l-12-47Z" fill="#7fae8c" />
          <path d="M176 192q14-9 29 0l4 24q-15 9-29 1Z" fill="#f0c77c" />
          <path d="M174 182q-11 20-6 39m35-43q13 13 14 30" fill="none" />
        </g>
      )}
      {accessory === "halo" && (
        <ellipse
          cx="130"
          cy="28"
          rx="39"
          ry="9"
          fill="none"
          stroke="#f2ca59"
          strokeWidth="6"
        />
      )}
      {accessory === "bowtie" && (
        <g fill="#dc6f78" stroke="#a8425d" strokeWidth="3" strokeLinejoin="round">
          <path d="m105 157-22-12 2 25 20-5m27-8 22-12-2 25-20-5Z" />
          <circle cx="118" cy="158" r="7" fill="#f4cf77" />
        </g>
      )}
    </>
  );
}
