# Shared UI components

Framework: React 18 / Next.js 14 App Router. Components are custom; there is no external component library.

## `components/BackBtn.jsx` — BackBtn

Accessible route-aware icon button. Props: `fallback`, `label`.

```jsx
'use client';
import { useRouter } from 'next/navigation';

export default function BackBtn({ fallback = '/home', label = 'Voltar' }) {
  const router = useRouter();
  function go() {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(fallback);
  }
  return (
    <button type="button" className="icon-btn" onClick={go} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
    </button>
  );
}
```

## `components/Logo.jsx` — Logo / Wordmark

Renders the real ONE vector paths from `lib/marcaOne.js`. Props: `href`, `size`, `showText`, `height`, `title`.

```jsx
import { ONE_VIEWBOX, ONE_CAMINHOS } from '../lib/marcaOne';

export function Wordmark({ height = 26, title = 'One Up Day' }) {
  return (
    <svg className="one-mark" viewBox={ONE_VIEWBOX} height={height} role="img" aria-label={title}>
      {ONE_CAMINHOS.map((p) => <path key={p.chave} d={p.d} fill={p.cor} />)}
    </svg>
  );
}

export function Symbol({ size = 32 }) {
  return (
    <svg className="one-symbol" width={size} height={size} viewBox="0 0 1024 1024" aria-hidden="true">
      <defs><linearGradient id="oneSymUp" x1="220" y1="700" x2="790" y2="170" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#f02f87" /><stop offset=".54" stopColor="#ff7a45" /><stop offset="1" stopColor="#ffd33d" /></linearGradient></defs>
      <path d="M420 650V250L285 354V220L468 78h132v572z" fill="var(--ink,#090c2a)" />
      <path d="M220 700c255-44 430-188 590-565" fill="none" stroke="url(#oneSymUp)" strokeWidth="86" strokeLinecap="round" />
      <path d="M735 160l112-66 62 118" fill="none" stroke="#ffd33d" strokeWidth="86" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ href = '/', size = 26, showText = false }) {
  const inner = <><Wordmark height={size} />{showText && <span className="oud-word">One <b>Up</b> Day</span>}</>;
  if (href === false) return <span className="brand-logo">{inner}</span>;
  return <a className="brand-logo" href={href} aria-label="One Up Day">{inner}</a>;
}
```

## `components/ProfileTabs.jsx` — ProfileTabs

Accessible tab pattern reused across content sections. Props: labels, panels, actions, initialTab.

```jsx
'use client';
import { useState } from 'react';

export default function ProfileTabs({ labels, journeys, album, quotes, bible, people, actions, extraTab, initialTab }) {
  const L = labels || {};
  const abas = [
    ['journeys', L.journeys, journeys],
    ['album', L.album, album],
    ['quotes', L.quotes, quotes],
    ['bible', L.bible, bible],
    ['people', L.people, people],
  ].filter(([, , painel]) => painel !== null && painel !== undefined && painel !== false);
  const firstTab = abas.some(([key]) => key === initialTab) ? initialTab : (abas[0] ? abas[0][0] : 'journeys');
  const [tab, setTab] = useState(firstTab);
  const atual = abas.some(([k]) => k === tab) ? tab : (abas[0] ? abas[0][0] : '');
  if (abas.length <= 1) return <div className="ptabs-wrap">{(actions || extraTab) && <div className="ptabs-row"><div className="ptab-actions">{actions || extraTab}</div></div>}<div className="ptab-panel">{abas[0] ? abas[0][2] : null}</div></div>;
  return (
    <div className="ptabs-wrap">
      <div className="ptabs-row"><div className="ptabs" role="tablist">{abas.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={atual === k} className={`ptab${atual === k ? ' on' : ''}`} onClick={() => setTab(k)}>{l}</button>)}{extraTab}</div>{actions && <div className="ptab-actions">{actions}</div>}</div>
      {abas.map(([k, , painel]) => <div key={k} className="ptab-panel" style={{ display: atual === k ? 'block' : 'none' }}>{painel}</div>)}
    </div>
  );
}
```

Other reusable components used by Círculos: `Comments.jsx`, `MediaGallery.jsx`, `PeopleSearch.jsx`, `ProgressBar.jsx`, `TrackPicker.jsx`, `ImageCropper.jsx`, `CampoMencao.jsx`, `PrivacyToggle.jsx`, and routine publication fields.
