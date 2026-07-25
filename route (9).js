'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

const NEXT = { public: 'followers', followers: 'private', private: 'public' };

export default function PrivacyToggle({ journeyId, initial, labels }) {
  const [vis, setVis] = useState(initial || 'public');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function cycle() {
    if (busy) return; setBusy(true);
    const next = NEXT[vis] || 'public';
    const supabase = createClient();
    await supabase.from('journeys').update({ visibility: next, is_public: next === 'public' }).eq('id', journeyId);
    setVis(next); setBusy(false); router.refresh();
  }
  return (
    <button className={`privacy-toggle vis-${vis}`} onClick={cycle} disabled={busy} title={labels[vis]}>
      {labels[vis]}
    </button>
  );
}
