type IconProps = { className?: string };

export function IconPortfolio({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="8" width="18" height="12" rx="1.5" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
      <path d="M3 13h18M10.5 13v2.5M13.5 13v2.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconMarkets({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19V9M9 19V5M14 19v-6M19 19V8" strokeLinecap="round" />
      <path d="M3 19h18" strokeLinecap="round" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 20 20" strokeLinecap="round" />
      <path d="M7.5 11.5 9.5 8l2 2.5 2-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconReports({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M14 3v4a1 1 0 0 0 1 1h4" strokeLinejoin="round" />
      <path d="M8 13.5v3M12 12v4.5M16 14.5v2" strokeLinecap="round" />
    </svg>
  );
}

export function IconNews({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="14" height="15" rx="1" />
      <path d="M17 8h3a1 1 0 0 1 1 1v9.5a1.5 1.5 0 0 1-1.5 1.5H6" strokeLinejoin="round" />
      <path d="M6.5 8.5h8M6.5 11.5h8M6.5 14.5h5" strokeLinecap="round" />
    </svg>
  );
}

export function IconSprout({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21V11" strokeLinecap="round" />
      <path d="M12 12c0-4 3-6.5 7-6.5C19 9.5 16.5 12.5 12 12Z" strokeLinejoin="round" />
      <path d="M12 15c0-3-2.5-5-6-5-.3 3.5 2 6 6 5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconShield({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3 5 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBuilding({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <path d="M4 21h16M5 21V9l7-5 7 5v12" strokeLinejoin="round" />
      <path d="M9 21v-5h6v5M9 12h.01M12 12h.01M15 12h.01M9 9h.01M12 9h.01M15 9h.01" strokeLinecap="round" />
    </svg>
  );
}

export function IconCompass({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="m14.5 9.5-2 5-3 1.5 2-5 3-1.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconArrowUpRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLinkedin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM3.3 8.75h3.4V21H3.3V8.75Zm6.2 0h3.26v1.68h.05c.45-.86 1.56-1.77 3.22-1.77 3.44 0 4.08 2.27 4.08 5.22V21h-3.4v-5.66c0-1.35-.02-3.08-1.88-3.08-1.88 0-2.17 1.47-2.17 2.98V21H9.5V8.75Z" />
    </svg>
  );
}

export function IconInstagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Abstract candlestick + trendline hero illustration - no external assets. */
export function HeroChartIllustration({ className }: IconProps) {
  return (
    <svg viewBox="0 0 480 320" fill="none" className={className}>
      <defs>
        <linearGradient id="hciLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.2" />
          <stop offset="55%" stopColor="#4ade80" stopOpacity="1" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="hciFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[...Array(7)].map((_, i) => (
        <line
          key={i}
          x1="0"
          x2="480"
          y1={40 + i * 40}
          y2={40 + i * 40}
          stroke="currentColor"
          strokeOpacity="0.08"
        />
      ))}

      {[
        { x: 40, o: 210, c: 180, h: 160, l: 230 },
        { x: 80, o: 180, c: 200, h: 160, l: 215 },
        { x: 120, o: 200, c: 150, h: 140, l: 210 },
        { x: 160, o: 150, c: 170, h: 130, l: 185 },
        { x: 200, o: 170, c: 120, h: 105, l: 180 },
        { x: 240, o: 120, c: 140, h: 100, l: 155 },
        { x: 280, o: 140, c: 95, h: 85, l: 150 },
        { x: 320, o: 95, c: 115, h: 75, l: 130 },
        { x: 360, o: 115, c: 70, h: 60, l: 122 },
        { x: 400, o: 70, c: 90, h: 55, l: 100 },
        { x: 440, o: 90, c: 55, h: 45, l: 98 },
      ].map((c, i) => {
        const up = c.c < c.o;
        return (
          <g key={i} className="animate-float-slow" style={{ animationDelay: `${i * 0.15}s` }}>
            <line x1={c.x} x2={c.x} y1={c.h} y2={c.l} stroke="currentColor" strokeOpacity="0.35" />
            <rect
              x={c.x - 6}
              y={Math.min(c.o, c.c)}
              width="12"
              height={Math.max(4, Math.abs(c.c - c.o))}
              fill={up ? "#34d399" : "#f43f5e"}
              fillOpacity="0.85"
              rx="1.5"
            />
          </g>
        );
      })}

      <path
        d="M20 230 Q100 200 140 175 T260 120 T400 90 T460 50"
        stroke="url(#hciLine)"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M20 230 Q100 200 140 175 T260 120 T400 90 T460 50 V310 H20 Z"
        fill="url(#hciFill)"
      />
    </svg>
  );
}
