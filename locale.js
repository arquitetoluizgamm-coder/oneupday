'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function FollowUserButton({ profileId, labelFollow, labelFollowing, labelBack }) {
  const [following, setFollowing] = useState(false);
  const [followsMe, setFollowsMe] = useState(false);
  const [me, setMe] = useState(null);
  const [isSelf, setIsSelf] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (user.id === profileId) setIsSelf(true);
        else {
          setMe(user.id);
          const { data: f } = await supabase.from('profile_follows').select('following_id').eq('follower_id', user.id).eq('following_id', profileId).maybeSingle();
          setFollowing(!!f);
          const { data: b } = await supabase.from('profile_follows').select('follower_id').eq('follower_id', profileId).eq('following_id', user.id).maybeSingle();
          setFollowsMe(!!b);
        }
      }
      setReady(true);
    })();
  }, [profileId]);

  if (ready && isSelf) return null;

  async function toggle() {
    if (busy) return;
    if (!me) { window.location.href = '/login'; return; }
    setBusy(true);
    const supabase = createClient();
    if (following) {
      await supabase.from('profile_follows').delete().eq('follower_id', me).eq('following_id', profileId);
      setFollowing(false);
    } else {
      await supabase.from('profile_follows').upsert({ follower_id: me, following_id: profileId });
      setFollowing(true);
    }
    setBusy(false);
  }

  const label = following ? labelFollowing : (followsMe ? labelBack : labelFollow);
  return <button className={`follow-btn${following ? ' on' : ''}`} onClick={toggle} disabled={busy || !ready}>{label}</button>;
}
