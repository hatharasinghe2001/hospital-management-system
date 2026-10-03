export default function HeroIllustration() {
  return (
    <svg
      className="hero-illustration"
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of a hospital building with a medical cross"
    >
      <ellipse cx="200" cy="260" rx="150" ry="18" fill="var(--accent-bg)" />

      {/* Hospital building */}
      <rect x="90" y="110" width="220" height="140" rx="10" fill="var(--bg)" stroke="var(--border)" strokeWidth="2" />
      <rect x="70" y="150" width="60" height="100" rx="8" fill="var(--accent-bg)" stroke="var(--accent-border)" strokeWidth="2" />
      <rect x="270" y="150" width="60" height="100" rx="8" fill="var(--accent-bg)" stroke="var(--accent-border)" strokeWidth="2" />

      {/* Roof */}
      <rect x="80" y="96" width="240" height="18" rx="6" fill="var(--accent)" />

      {/* Cross on facade */}
      <rect x="188" y="124" width="24" height="64" rx="4" fill="var(--accent)" />
      <rect x="168" y="144" width="64" height="24" rx="4" fill="var(--accent)" />

      {/* Windows on the side wings */}
      <rect x="88" y="168" width="18" height="18" rx="3" fill="var(--accent-border)" />
      <rect x="88" y="198" width="18" height="18" rx="3" fill="var(--accent-border)" />
      <rect x="88" y="228" width="18" height="18" rx="3" fill="var(--accent-border)" />
      <rect x="294" y="168" width="18" height="18" rx="3" fill="var(--accent-border)" />
      <rect x="294" y="198" width="18" height="18" rx="3" fill="var(--accent-border)" />
      <rect x="294" y="228" width="18" height="18" rx="3" fill="var(--accent-border)" />

      {/* Door */}
      <rect x="182" y="212" width="36" height="38" rx="4" fill="var(--accent)" />

      {/* Heartbeat pulse line */}
      <path
        d="M20 70 H140 L155 40 L175 95 L190 55 L205 70 H380"
        stroke="var(--accent)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
