export function HeroVisual() {
  return (
    <svg
      viewBox="0 0 520 280"
      role="img"
      aria-label="Pared térmica con flujo de calor de la cara caliente a la fría"
      className="h-auto w-full max-w-lg"
    >
      <defs>
        <linearGradient id="hero-wall" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="45%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="hero-room-hot" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#fb7185" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hero-room-cold" x1="100%" x2="0%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="8" y="28" width="150" height="200" rx="16" fill="url(#hero-room-hot)" />
      <rect x="362" y="28" width="150" height="200" rx="16" fill="url(#hero-room-cold)" />
      <rect x="158" y="36" width="204" height="184" rx="14" fill="url(#hero-wall)" opacity="0.92" />
      <rect x="158" y="36" width="204" height="184" rx="14" fill="none" stroke="#e2e8f0" strokeOpacity="0.35" />
      {[0, 1, 2, 3].map((index) => (
        <line
          key={index}
          className="heat-flow"
          x1="372"
          x2="478"
          y1={72 + index * 36}
          y2={72 + index * 36}
          stroke="#38bdf8"
          strokeWidth="5"
          strokeLinecap="round"
          style={{ animationDelay: `${index * 0.18}s` }}
        />
      ))}
      <text x="28" y="250" fill="#fb7185" fontSize="15" fontWeight="700">
        30 °C
      </text>
      <text x="430" y="250" fill="#7dd3fc" fontSize="15" fontWeight="700">
        18 °C
      </text>
      <text x="214" y="132" fill="#0f172a" fontSize="16" fontWeight="800">
        Q = 432 W
      </text>
    </svg>
  );
}
