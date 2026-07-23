'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function PrivacyToggle({ journeyId, initialPublic, labelPublic, labelPrivate }) {
  const [pub, setPub] = useState(initialPublic);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function toggle() {
    if (busy) return; setBusy(true);
    const supabase = createClient();
    await supabase.from('journeys').update({ is_public: !pub }).eq('id', journeyId);
    setPub(!pub); setBusy(false); router.refresh();
  }
  return (
    <button className={`privacy-toggle${pub ? ' pub' : ''}`} onClick={toggle} disabled={busy}>
      {pub ? labelPublic : labelPrivate}
    </button>
  );
}
