'use client';
import { createClient } from '../../lib/supabase/client';

export default function BlockButton({ ownerId, label }) {
  async function block() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return; }
    if (user.id === ownerId) return;
    if (!confirm(label + '?')) return;
    await supabase.from('blocks').upsert({ blocker_id: user.id, blocked_id: ownerId });
    window.location.href = '/home';
  }
  return <button className="tiny-link danger" onClick={block}>{label}</button>;
}
