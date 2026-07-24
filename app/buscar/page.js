import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import BottomNav from '../../components/BottomNav';
import PeopleSearch from '../../components/PeopleSearch';
import AppTop from '../../components/AppTop';

export const dynamic = 'force-dynamic';

export default async function Buscar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const t = getDict(getLocale());
  return (
    <>
      <AppTop backLabel={t.back} />
      <main className="wrap">
        <div className="create-head"><h1>{t.searchTitle}</h1></div>
        <PeopleSearch labels={{ ph: t.searchPeoplePh, hint: t.searchHint, none: t.searchNone }} />
      </main>
      <BottomNav active="search" t={t} />
    </>
  );
}
