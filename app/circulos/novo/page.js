import { redirect } from 'next/navigation';
import AppTop from '../../../components/AppTop';
import BottomNav from '../../../components/BottomNav';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { getDict } from '../../../lib/i18n';
import CreateCircleForm from './CreateCircleForm';

export const dynamic = 'force-dynamic';

export default async function NewCirclePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/circulos/novo');
  const { data: profile } = await supabase.from('profiles').select('is_professional_verified').eq('id', user.id).maybeSingle();
  const t = getDict(getLocale());
  return <>
    <AppTop backHref="/circulos" backLabel={t.back} />
    <main className="circle-shell circle-create-page">
      {profile?.is_professional_verified ? <CreateCircleForm userId={user.id} /> : <section className="circle-access-card">
        <span className="circle-verified-mark" aria-hidden="true">✓</span>
        <p className="circle-eyebrow">Criação profissional</p>
        <h1>Criação de Círculos reservada</h1>
        <p>Somente perfis profissionais verificados podem criar e administrar novos Círculos. Você ainda pode participar normalmente por convite.</p>
        <a className="circle-primary" href="/circulos">Voltar aos meus Círculos</a>
      </section>}
    </main>
    <BottomNav active="explore" t={t} />
  </>;
}
