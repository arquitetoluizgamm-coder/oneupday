'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChallengeRespond({ id, labels }) {
  const L = labels || {};
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function act(action) {
    if (busy) return;
    setBusy(true);
    await fetch('/api/challenge', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    }).catch(() => {});
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="ch-resp">
      <button type="button" className="cta" onClick={() => act('accept')} disabled={busy}>{L.accept}</button>
      <button type="button" className="ghost-btn" onClick={() => act('decline')} disabled={busy}>{L.decline}</button>
    </div>
  );
}
