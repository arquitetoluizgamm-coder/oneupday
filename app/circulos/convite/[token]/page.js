import { redirect } from 'next/navigation';
import AppTop from '../../../../components/AppTop';
import BottomNav from '../../../../components/BottomNav';
import { createClient } from '../../../../lib/supabase/server';
import { getLocale } from '../../../../lib/locale';
import { getDict } from '../../../../lib/i18n';
import { invitePreviewForUser } from '../../../../lib/circles/server';
import AcceptCircleInvite from './AcceptCircleInvite';

export const dynamic = 'force-dynamic';

export default async function InvitePage({ params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const next = `/circulos/convite/${encodeURIComponent(params.token)}`;
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  const preview = await invitePreviewForUser(params.token, user.id);
  const t = getDict(getLocale());
  return <>
    <AppTop backHref="/circulos" backLabel={t.back} />
    <main className="circle-shell circle-invite-page">
      {preview.error ? <section className="circle-access-card"><span className="circle-verified-mark">!</span><p className="circle-eyebrow">Convite privado</p><h1>Este convite não está disponível</h1><p>Ele pode ter expirado, já ter sido usado ou pertencer a outra pessoa.</p><a className="circle-primary" href="/circulos">Ir para meus Círculos</a></section>
        : <AcceptCircleInvite token={params.token} circle={preview.circle} rules={preview.rules} owner={preview.owner} />}
    </main>
    <BottomNav active="explore" t={t} />
  </>;
}
