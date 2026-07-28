import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import AppTop from '../../components/AppTop';
import BottomNav from '../../components/BottomNav';
import DiarioClient from './DiarioClient';

export const dynamic = 'force-dynamic';

export default async function Diario() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const t = getDict(getLocale());
  return <><AppTop backLabel={t.back} /><main className="wrap diary-page"><DiarioClient labels={t} /></main><BottomNav active="diary" t={t} /></>;
}
