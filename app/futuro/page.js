import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import AppTop from '../../components/AppTop';
import BottomNav from '../../components/BottomNav';
import FuturoClient from './FuturoClient';
import './future-redesign.css';

export const dynamic = 'force-dynamic';

export default async function Futuro() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');
  const labels = getDict(getLocale());
  return <><AppTop backLabel={labels.back} /><main className="wrap future-page"><FuturoClient labels={labels} userId={user.id} /></main><BottomNav active="create" t={labels} /></>;
}
