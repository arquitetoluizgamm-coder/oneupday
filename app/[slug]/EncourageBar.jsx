'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { track } from '../../lib/track';

export default function EncourageBar({ updateId, mediaId, labelIdle, labelActive, supportersLabel = 'See who is with you', supportersLoading = 'Loading…', supportersEmpty = 'You are the first to show up here.', initialActive = false }) {
  const col = mediaId ? 'media_id' : 'update_id';
  const val = mediaId || updateId;
  const [active, setActive] = useState(initialActive);
  const [busy, setBusy] = useState(false);
  const [people, setPeople] = useState(null);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [supportersOpen, setSupportersOpen] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return; }
    if (active) {
      await supabase.from('encouragements').delete().eq(col, val).eq('user_id', user.id);
      setActive(false);
    } else {
      const { error } = await supabase.from('encouragements').insert({ [col]: val, user_id: user.id });
      if (error) {
        await supabase.from('encouragements').delete().eq(col, val).eq('user_id', user.id);
        setActive(false);
      } else { setActive(true); track('encourage_sent', { updateId }); }
    }
    setBusy(false);
  }

  async function showPeople() {
    if (supportersOpen) { setSupportersOpen(false); return; }
    if (loadingPeople) return;
    setSupportersOpen(true);
    if (people !== null) return;
    setLoadingPeople(true);
    const response = await fetch(`/api/supporters/${updateId}`);
    const data = await response.json().catch(() => ({}));
    setPeople(data.people || []);
    setLoadingPeople(false);
  }

  // Apoio silencioso: envia incentivo, mas nunca mostra número público.
  return (
    <div className="support-wrap">
      <button className={`support-pill${active ? ' on' : ''}`} onClick={toggle} disabled={busy} aria-label={active ? labelActive : labelIdle}>
        {/* mão segurando um coração: apoio, não curtida */}
        <svg className="sp-heart" viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
          <path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
          <path d="m2 15 6 6" />
          <path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z" />
        </svg>
        <span className="action-label">{active ? labelActive : labelIdle}</span>
      </button>
      <button type="button" className="supporters-icon" onClick={showPeople} aria-expanded={supportersOpen} aria-label={loadingPeople ? supportersLoading : supportersLabel} title={supportersLabel}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M16 14a5 5 0 0 1 4.5 5"/></svg>
      </button>
      {supportersOpen && people && <div className="supporters-popover">
        <button type="button" className="supporters-close" onClick={() => setSupportersOpen(false)} aria-label="Fechar">×</button>
        {people.length ? people.map(p => p.handle ? <a key={p.id} href={`/${p.handle}`}>{p.name}</a> : <span key={p.id}>{p.name}</span>) : <span>{supportersEmpty}</span>}
      </div>}
    </div>
  );
}
