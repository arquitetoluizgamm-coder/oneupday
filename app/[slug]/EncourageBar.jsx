'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function EncourageBar({ updateId, labelIdle, labelActive, initialActive = false }) {
  const [active, setActive] = useState(initialActive);
  const [busy, setBusy] = useState(false);

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
      } else setActive(true);
    }
    setBusy(false);
  }

  // Apoio silencioso: envia incentivo, mas nunca mostra número público.
  return (
    <button className={`support-pill${active ? ' on' : ''}`} onClick={toggle} disabled={busy}>
      <span aria-hidden="true">{active ? '♥' : '♡'}</span>{active ? labelActive : labelIdle}
    </button>
  );
}
