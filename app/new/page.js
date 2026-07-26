import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import AppTop from '../../components/AppTop';
import NewJourneyForm from './NewJourneyForm';
import BottomNav from '../../components/BottomNav';

export const dynamic = 'force-dynamic';

export default async function NewJourney() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const locale = getLocale();
  const t = getDict(locale);

  return (
    <>
      <AppTop backLabel={t.back} />
      <main className="wrap wrap-wz">
        <NewJourneyForm userId={user.id} t={t} />
      </main>
      <BottomNav active="create" t={t} />
    </>
  );
}
