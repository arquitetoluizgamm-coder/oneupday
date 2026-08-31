import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import AppTop from '../../components/AppTop';
import BottomNav from '../../components/BottomNav';
import BiblicalMessageForm from './BiblicalMessageForm';
import './biblical-message.css';

export const dynamic = 'force-dynamic';

export default async function BiblicalMessagePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const t = getDict(getLocale());

  return (
    <>
      <AppTop backLabel={t.back} />
      <main className="wrap biblical-page">
        <header className="biblical-head">
          <p className="eyebrow">{t.bibleEyebrow}</p>
          <h1>{t.bibleTitle}</h1>
          <p>{t.bibleSub}</p>
        </header>
        <BiblicalMessageForm t={t} userId={user.id} />
      </main>
      <BottomNav active="create" t={t} />
    </>
  );
}

