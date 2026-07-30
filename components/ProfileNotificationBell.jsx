'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';

export default function ProfileNotificationBell({ label = 'Ver notificações' }) {
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { count } = await supabase.from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_id', user.id).eq('read', false);
        if (alive) setHasNotifications((count || 0) > 0);
      } catch { }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <a className={`profile-notification-bell${hasNotifications ? ' has-notifications' : ''}`}
      href="/notifications" aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor"
        strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 9.8a6 6 0 0 0-12 0c0 7-2.5 7-2.5 8.5h17C20.5 16.8 18 16.8 18 9.8Z" />
        <path d="M10 21h4" />
      </svg>
      {hasNotifications && <i className="profile-notification-ping" aria-hidden="true" />}
    </a>
  );
}
