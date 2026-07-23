import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import Logo from '../../components/Logo';
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
      <header className="top">
        <Logo />
        <div className="top-right">
          <a className="ghost-btn" href="/home">{t.back}</a>
        </div>
      </header>
      <main className="wrap">
        <div className="create-head">
          <p className="eyebrow">{t.createEyebrow}</p>
          <h1>{t.createTitle}</h1>
          <p className="sub">{t.createSub}</p>
        </div>
        <NewJourneyForm userId={user.id} t={{
          fName: t.fName, fNamePh: t.fNamePh, fCategory: t.fCategory, fDuration: t.fDuration,
          fWhy: t.fWhy, fWhyPh: t.fWhyPh, fFirst: t.fFirst, fFirstPh: t.fFirstPh,
          createBtn: t.createBtn, creating: t.creating, error: t.createError,
          catArt: t.catArt, catLife: t.catLife, catBody: t.catBody, catHome: t.catHome, catWork: t.catWork,
          dur7: t.dur7, dur30: t.dur30, dur60: t.dur60, dur100: t.dur100,
        }} />
      </main>
      <BottomNav active="create" t={t} />
    </>
  );
}
