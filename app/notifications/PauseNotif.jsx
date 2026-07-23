'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function PauseNotif({ userId, paused, labelPause, labelPaused }) {
  const [on, setOn] = useState(!!paused);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function toggle() {
    if (busy) return; setBusy(true);
    const supabase = createClient();
    await supabase.from('profiles').update({ notif_paused: !on }).eq('id', userId);
    setOn(!on); setBusy(false); router.refresh();
  }
  return (
    <button className={`ghost-btn${on ? ' on' : ''}`} onClick={toggle} disabled={busy}>
      {on ? labelPaused : labelPause}
    </button>
  );
}
