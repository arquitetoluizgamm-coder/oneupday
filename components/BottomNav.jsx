'use client';
import { useEffect, useState } from 'react';

export default function BottomNav({ active, t }) {
  const [scrolling, setScrolling] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    let timer;
    const onScroll = () => { setScrolling(true); clearTimeout(timer); timer = setTimeout(() => setScrolling(false), 180); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, []);

  const items = [
    { key: 'home', href: '/home', label: t.navHome, d: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z' },
    { key: 'search', href: '/buscar', label: t.navSearch, d: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm6 12 4 4' },
    { key: 'create', create: true, label: t.navCreate, d: 'M12 5v14M5 12h14' },
    { key: 'explore', href: '/explore', label: t.navExplore, d: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm3 5-2 5-5 2 2-5z' },
    { key: 'profile', href: '/perfil', label: t.navProfile, d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21a7 7 0 0 1 14 0' },
  ];

  return (
    <>
      {menu && (
        <div className="create-backdrop" onClick={() => setMenu(false)}>
          <div className="create-menu" onClick={e => e.stopPropagation()}>
            <a href="/perfil" className="cm-item cm-main">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="butt"><path d="M4 19h16M6 15.5 15.5 6a2.1 2.1 0 0 1 3 3L9 18.5l-4 1z" /></svg>
              {t.navToday}
            </a>
            <a href="/midia" className="cm-item">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 18 5-5 4 4 3-3 4 4" /></svg>
              {t.navMedia}
            </a>
            <a href="/new" className="cm-item">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5v14" /></svg>
              {t.navJourney}
            </a>
          </div>
        </div>
      )}
      <nav className={`bottom-nav${scrolling ? ' scrolling' : ''}`} aria-label="Navigation">
        {items.map(it => it.create ? (
          <button key={it.key} type="button" className="bn-create" onClick={() => setMenu(true)} aria-label={it.label} title={it.label}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={it.d} /></svg>
          </button>
        ) : (
          <a key={it.key} href={it.href} className={active === it.key ? 'on' : ''} aria-label={it.label} title={it.label}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={it.d} /></svg>
          </a>
        ))}
      </nav>
    </>
  );
}
