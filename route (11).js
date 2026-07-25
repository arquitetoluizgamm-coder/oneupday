'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function MuteTopic({ category, current, label }) {
  const router = useRouter();
  async function mute() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const set = new Set((current || '').split(',').filter(Boolean));
    set.add(category);
    await supabase.from('profiles').update({ muted_cats: [...set].join(',') }).eq('id', user.id);
    router.refresh();
  }
  return <button className="tiny-link" onClick={mute}>{label}</button>;
}
