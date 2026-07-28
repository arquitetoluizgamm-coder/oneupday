'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';

function ProfileNavAvatar() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('profiles')
          .select('name, avatar_url, avatar_color').eq('id', user.id).maybeSingle();
        if (alive) setProfile(data || { name: user.email || '?' });
      } catch { }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="bn-profile-avatar" aria-hidden="true"
      style={profile ? { background: profile.avatar_color || 'var(--orange)' } : undefined}>
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt="" />
        : profile?.name
          ? profile.name.trim().charAt(0).toUpperCase()
          : <i className="bn-avatar-placeholder" />}
    </div>
  );
}

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
    { key: 'explore', href: '/explore', label: t.navExplore, d: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm3 5-2 5-5 2 2-5z' },
    { key: 'profile', href: '/perfil', label: t.navProfile, avatar: true },
  ];

  return (
    <nav className={`bottom-nav${scrolling ? ' scrolling' : ''}`} aria-label="Navigation">
      {items.map((it) => (
        <a key={it.key} href={it.href} className={active === it.key ? 'on' : ''} aria-label={it.label} title={it.label}>
          {it.avatar
            ? <ProfileNavAvatar />
            : <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={it.d} /></svg>}
        </a>
      ))}
    </nav>
  );
}
