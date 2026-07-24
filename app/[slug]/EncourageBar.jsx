'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { track } from '../../lib/track';

export default function EncourageBar({ updateId, labelIdle, labelActive, supportersLabel = 'See who is with you', supportersLoading = 'Loading…', supportersEmpty = 'You are the first to show up here.', initialActive = false }) {
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
      await supabase.from('encouragements').delete().eq('update_id', updateId).eq('user_id', user.id);
      setActive(false);
    } else {
      const { error } = await supabase.from('encouragements').insert({ update_id: updateId, user_id: user.id });
      if (error) {
        await supabase.from('encouragements').delete().eq('update_id', updateId).eq('user_id', user.id);
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
      <button className={`support-pill${active ? ' on' : ''}`} onClick={toggle} disabled={busy}>
        <span aria-hidden="true">{active ? '♥' : '♡'}</span>{active ? labelActive : labelIdle}
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
