import { redirect } from 'next/navigation';
import AppTop from '../../../components/AppTop';
import BottomNav from '../../../components/BottomNav';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { getDict } from '../../../lib/i18n';
import CircleDestinationComposer from './CircleDestinationComposer';

export const dynamic = 'force-dynamic';

export default async function CirclePublishPage({ searchParams }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/circulos/publicar');
  const { data } = await supabase.from('circle_members')
    .select('circle_id,role,status,circles(id,slug,name,settings,status)')
    .eq('user_id', user.id).eq('status', 'active');
  const circles = (data || []).filter((row) => row.circles?.status === 'active');
  const t = getDict(getLocale());
  return <>
    <AppTop backHref={searchParams?.circle ? `/circulos/${searchParams.circle}` : '/circulos'} backLabel={t.back} />
    <main className="circle-shell"><CircleDestinationComposer userId={user.id} memberships={circles} initialSlug={searchParams?.circle || ''} /></main>
    <BottomNav active="explore" t={t} />
  </>;
}
