'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// "Fiz hoje" — 1 presença por dia no desafio
export default function ChallengeCheck({ id, label }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function check() {
    if (busy) return;
    setBusy(true);
    const r = await fetch('/api/challenge/check', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => null);
    if (r && r.status === 401) { window.location.href = '/login'; return; }
    router.refresh();
    setBusy(false);
  }

  return (
    <button type="button" className="cta grow chp-check" onClick={check} disabled={busy}>{label}</button>
  );
}
