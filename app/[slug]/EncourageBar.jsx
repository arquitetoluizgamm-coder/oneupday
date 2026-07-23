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
      <button type="button" className="supporters-link" onClick={showPeople} aria-expanded={supportersOpen}>
        {loadingPeople ? supportersLoading : supportersLabel}
      </button>
      {supportersOpen && people && <div className="supporters-popover">
        <button type="button" className="supporters-close" onClick={() => setSupportersOpen(false)} aria-label="Fechar">×</button>
        {people.length ? people.map(p => p.handle ? <a key={p.id} href={`/${p.handle}`}>{p.name}</a> : <span key={p.id}>{p.name}</span>) : <span>{supportersEmpty}</span>}
      </div>}
    </div>
  );
}
