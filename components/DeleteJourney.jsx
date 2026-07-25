'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

export default function DeleteJourney({ journeyId, title, labels }) {
  const L = labels || {};
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function del() {
    if (busy) return;
    if (!window.confirm((L.confirm || '').replace('{title}', title))) return;
    setBusy(true);
    const sb = createClient();
    const { error } = await sb.from('journeys').delete().eq('id', journeyId);
    setBusy(false);
    if (error) { alert(L.error); return; }
    router.refresh();
  }

  return (
    <button type="button" className="view-link danger-link" onClick={del} disabled={busy}>
      {busy ? '…' : L.btn}
    </button>
  );
}
