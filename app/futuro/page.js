import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import AppTop from '../../components/AppTop';
import BottomNav from '../../components/BottomNav';
import FuturoClient from './FuturoClient';

export const dynamic = 'force-dynamic';

export default async function Futuro() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');
  return <><AppTop backLabel={getDict(getLocale()).back} /><main className="wrap future-page"><FuturoClient labels={getDict(getLocale())} /></main><BottomNav active="create" t={getDict(getLocale())} /></>;
}
