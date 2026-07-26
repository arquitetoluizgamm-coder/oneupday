'use client';
import { useEffect, useState } from 'react';
import CriarMenu from './CriarMenu';

export default function BottomNav({ active, t }) {
  const [scrolling, setScrolling] = useState(false);
  useEffect(() => {
    let timer;
    const onScroll = () => { setScrolling(true); clearTimeout(timer); timer = setTimeout(() => setScrolling(false), 180); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, []);

  const items = [
    { key: 'home', href: '/home', label: t.navHome, d: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z' },
    { key: 'search', href: '/buscar', label: t.navSearch, d: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm6 12 4 4' },
    { key: 'create', create: true, label: t.navCreate },
    { key: 'explore', href: '/explore', label: t.navExplore, d: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm3 5-2 5-5 2 2-5z' },
    { key: 'profile', href: '/perfil', label: t.navProfile, d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21a7 7 0 0 1 14 0' },
  ];

  return (
    <nav className={`bottom-nav${scrolling ? ' scrolling' : ''}`} aria-label="Navigation">
      {items.map((it) => it.create ? (
        <CriarMenu key={it.key} t={t} className="bn-create" tamanho={26} rotulo={it.label} />
      ) : (
        <a key={it.key} href={it.href} className={active === it.key ? 'on' : ''} aria-label={it.label} title={it.label}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={it.d} /></svg>
        </a>
      ))}
    </nav>
  );
}
