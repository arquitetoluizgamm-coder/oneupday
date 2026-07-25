// Logo OUD que se desenha — usado na chegada (login).
// Motion oficial: tudo se desenha, nada pisca · cubic-bezier(.22,1,.36,1)
export default function AnimatedLogo({ width = 300 }) {
  return (
    <svg className="oud-anim" viewBox="260 240 1080 580" style={{ width }} aria-label="OUD — One Up Day">
      <g fill="none" strokeWidth="40" strokeLinecap="butt">
        <circle className="oa-o" stroke="#84917A" cx="506" cy="464.5" r="145.5" />
        <path className="oa-u" stroke="#84917A" d="M 731 311 V 493 A 118.5 118.5 0 0 0 968 493 V 379" />
        <path className="oa-dot" stroke="#C16F54" d="M 968 311 V 351" />
        <path className="oa-d" stroke="#C16F54" d="M 1039 330 H 1121 A 138.75 138.75 0 0 1 1121 607.5 H 1005" />
      </g>
      <text className="oa-word" x="824" y="757" textAnchor="middle">ONE UP DAY</text>
    </svg>
  );
}
