export function Symbol({ size = 32 }) {
  return <img src="/logo-symbol.png" alt="" width={size} height={size} className="oud-symbol" />;
}

export default function Logo({ href = '/', size = 30, showText = true }) {
  const inner = (
    <>
      <img src="/logo-symbol.png" alt="" width={size} height={size} className="oud-symbol" />
      {showText && <span className="oud-word">One <b>Up</b> Day</span>}
    </>
  );
  if (href === false) return <span className="brand-logo">{inner}</span>;
  return <a className="brand-logo" href={href} aria-label="One Up Day">{inner}</a>;
}
