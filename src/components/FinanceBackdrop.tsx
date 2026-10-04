const SYMBOLS = [
  { char: "$", top: "12%", left: "8%", size: "2.25rem", drift: "a", delay: "0s", opacity: 0.5 },
  { char: "₹", top: "22%", left: "82%", size: "2.75rem", drift: "b", delay: "1.2s", opacity: 0.45 },
  { char: "€", top: "58%", left: "18%", size: "1.75rem", drift: "b", delay: "2.4s", opacity: 0.35 },
  { char: "$", top: "70%", left: "70%", size: "2rem", drift: "a", delay: "0.6s", opacity: 0.4 },
  { char: "₹", top: "40%", left: "48%", size: "1.5rem", drift: "a", delay: "3s", opacity: 0.3 },
  { char: "€", top: "80%", left: "40%", size: "1.5rem", drift: "b", delay: "1.8s", opacity: 0.3 },
];

/**
 * Ambient decorative backdrop for hero-style sections - drifting glowing currency
 * symbols. Pure CSS (no images), so it stays lightweight and theme-colored.
 * Purely decorative: pointer-events-none and aria-hidden throughout.
 */
export default function FinanceBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {SYMBOLS.map((s, i) => (
        <span
          key={i}
          className={`absolute font-display select-none ${
            s.drift === "a" ? "animate-drift-a" : "animate-drift-b"
          }`}
          style={{
            top: s.top,
            left: s.left,
            fontSize: s.size,
            opacity: s.opacity,
            color: "#fbbf24",
            filter: "blur(0.4px) drop-shadow(0 0 10px rgba(251,191,36,0.55))",
            animationDelay: s.delay,
          }}
        >
          {s.char}
        </span>
      ))}
    </div>
  );
}
