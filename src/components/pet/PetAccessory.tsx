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
    </>
  );
}
