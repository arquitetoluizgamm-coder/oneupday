'use client';
import { useEffect, useState } from 'react';

export default function BottomNav({ active, t }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 24); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  const items = [
    { key: 'home', href: '/home', label: t.navHome, d: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z' },
    { key: 'explore', href: '/explore', label: t.navExplore, d: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm3 5-2 5-5 2 2-5z' },
    { key: 'create', href: '/new', label: t.navCreate, d: 'M12 5v14M5 12h14' },
    { key: 'profile', href: '/perfil', label: t.navProfile, d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21a7 7 0 0 1 14 0' },
  ];
  return (
    <nav className={`bottom-nav${scrolled ? ' scrolled' : ''}`} aria-label="Navigation">
      {items.map(it => (
        <a key={it.key} href={it.href} className={active === it.key ? 'on' : ''}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={it.d} /></svg>
          <span>{it.label}</span>
        </a>
      ))}
    </nav>
  );
}
