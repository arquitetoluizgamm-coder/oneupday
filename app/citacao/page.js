import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import AppTop from '../../components/AppTop';
import BottomNav from '../../components/BottomNav';
import CitacaoForm from './CitacaoForm';

export const dynamic = 'force-dynamic';

export default async function Citacao() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const t = getDict(getLocale());

  const { data: perfil } = await supabase.from('profiles').select('name, handle').eq('id', user.id).maybeSingle();

  return (
    <>
      <AppTop backLabel={t.back} />
      <main className="wrap">
        <div className="create-head">
          <p className="eyebrow">{t.navQuote}</p>
          <h1>{t.citTitle}</h1>
          <p className="sub">{t.citSub}</p>
        </div>
        <CitacaoForm t={t} userId={user.id} autorPadrao={perfil?.handle || ''} />
      </main>
      <BottomNav active="create" t={t} />
    </>
  );
}
