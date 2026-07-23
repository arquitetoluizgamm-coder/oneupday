export function Symbol({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" aria-hidden="true" className="oud-symbol">
      <defs>
        <linearGradient id="oudUp" x1="220" y1="700" x2="790" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f02f87" />
          <stop offset=".54" stopColor="#ff7a45" />
          <stop offset="1" stopColor="#ffd33d" />
        </linearGradient>
      </defs>
      <path d="M420 650V250L285 354V220L468 78h132v572z" fill="#090c2a" />
      <path d="M220 700c255-44 430-188 590-565" fill="none" stroke="url(#oudUp)" strokeWidth="86" strokeLinecap="round" />
      <path d="M735 160l112-66 62 118" fill="none" stroke="#ffd33d" strokeWidth="86" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Wordmark = símbolo + "One Up Day"
export default function Logo({ href = '/', size = 30, showText = true }) {
  const inner = (
    <>
      <Symbol size={size} />
      {showText && <span className="oud-word">One <b>Up</b> Day</span>}
    </>
  );
  if (href === false) return <span className="brand-logo">{inner}</span>;
  return <a className="brand-logo" href={href} aria-label="One Up Day">{inner}</a>;
}
