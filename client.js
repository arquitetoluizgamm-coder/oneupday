'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function FollowButton({ journeyId, labelFollow, labelFollowing }) {
  const [following, setFollowing] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('follows')
          .select('journey_id').eq('user_id', user.id).eq('journey_id', journeyId).maybeSingle();
        setFollowing(!!data);
      }
      setReady(true);
    })();
  }, [journeyId]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return; }
    if (following) {
      await supabase.from('follows').delete().eq('user_id', user.id).eq('journey_id', journeyId);
      setFollowing(false);
    } else {
      await supabase.from('follows').upsert({ user_id: user.id, journey_id: journeyId });
      setFollowing(true);
    }
    setBusy(false);
  }

  return (
    <button className={`follow-btn${following ? ' on' : ''}`} onClick={toggle} disabled={busy || !ready}>
      {following ? labelFollowing : labelFollow}
    </button>
  );
}
