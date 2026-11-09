/** Ilustração vetorial do temporizador, independente de WebGL. */
export default function TomatoScene({ progress }: { progress: number }) {
  return (
    <svg
      viewBox="0 0 300 270"
      width="100%"
      height="100%"
      aria-hidden="true"
      data-progress={progress}
    >
      <path
        d="M25 127C25 49 80 21 150 38c70-17 125 11 125 89v51c0 58-57 83-125 83S25 236 25 178Z"
        fill="#f71627"
      />
      <path
        d="M25 127C25 49 80 21 150 38c70-17 125 11 125 89v18q-125 51-250 0Z"
        fill="#dc1730"
      />
      <path
        d="M26 143q124 51 248 0"
        fill="none"
        stroke="#bd192b"
        strokeWidth="7"
      />
      <path
        d="m150 48-82 8 61-20-30-12 55 9 39-11-16 15 55 19-69-8 29 39-43-28-48 28 27-39"
        fill="#08793a"
      />
      <path d="M145 34h15v15h-15z" fill="#005c30" />
      {[108, 190].map((x) => (
        <g key={x}>
          <path
            d={`M${x - 13} 102q13-17 26 0`}
            fill="none"
            stroke="#163b20"
            strokeWidth="3"
          />
          <ellipse
            cx={x}
            cy="122"
            rx="13"
            ry="23"
            fill="white"
            stroke="#242424"
          />
          <ellipse cx={x + 2} cy="132" rx="7" ry="12" />
          <ellipse cx={x + 4} cy="126" rx="3" ry="5" fill="white" />
        </g>
      ))}
      <path d="m140 147 20 0-10 17z" fill="white" />
      <g fill="white" stroke="white">
        {Array.from({ length: 31 }, (_, i) => {
          const x = 34 + i * 7.7,
            y = 162 + 19 * Math.sin((i / 30) * Math.PI);
          return (
            <path
              key={i}
              d={`M${x} ${y}v${i % 5 === 0 ? 19 : 10}`}
              strokeWidth={i % 5 === 0 ? 3 : 1.5}
            />
          );
        })}
      </g>
      <g fill="white" fontSize="21" fontWeight="bold" textAnchor="middle">
        <text x="91" y="224">
          20
        </text>
        <text x="150" y="236">
          25
        </text>
        <text x="211" y="224">
          30
        </text>
      </g>
    </svg>
  );
}
