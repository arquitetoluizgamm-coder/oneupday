'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function EncourageBar({ updateId, initialCount }) {
  const [count, setCount] = useState(initialCount || 0);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return; }

    if (active) {
      await supabase.from('encouragements').delete().eq('update_id', updateId).eq('user_id', user.id);
      setActive(false); setCount(c => Math.max(0, c - 1));
    } else {
      const { error } = await supabase.from('encouragements').insert({ update_id: updateId, user_id: user.id });
      if (error) {
        await supabase.from('encouragements').delete().eq('update_id', updateId).eq('user_id', user.id);
        setActive(false); setCount(c => Math.max(0, c - 1));
      } else { setActive(true); setCount(c => c + 1); }
    }
    setBusy(false);
  }

  return (
    <button className={`encourage-pill${active ? ' on' : ''}`} onClick={toggle} disabled={busy} aria-label="Encourage">
      <span aria-hidden="true">{active ? '♥' : '♡'}</span>{count > 0 && <b>{count}</b>}
    </button>
  );
}
