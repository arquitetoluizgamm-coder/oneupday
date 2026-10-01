import { redirect } from 'next/navigation';
import AppTop from '../../components/AppTop';
import BottomNav from '../../components/BottomNav';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import { circleLabels } from '../../lib/circles/labels';
import { signedCircleMedia } from '../../lib/circles/server';

export const dynamic = 'force-dynamic';

export default async function CirclesPage({ searchParams }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/circulos');
  const locale = getLocale();
  const t = getDict(locale);
  const labels = circleLabels(locale);
  const tab = searchParams?.tab === 'managed' ? 'managed' : 'mine';
  const [{ data: profile }, membershipsResult, invitesResult] = await Promise.all([
    supabase.from('profiles').select('is_professional_verified').eq('id', user.id).maybeSingle(),
    supabase.from('circle_members')
      .select('role,status,display_name,joined_at,circles(id,slug,name,description,owner_id,cover_path,settings,status,updated_at)')
      .eq('user_id', user.id).eq('status', 'active').order('joined_at', { ascending: false }),
    supabase.from('circle_invites').select('id', { count: 'exact', head: true }).eq('invitee_id', user.id).eq('status', 'pending'),
  ]);
  const migrationMissing = !!membershipsResult.error;
  const all = (membershipsResult.data || []).filter((row) => row.circles?.status === 'active');
  const shown = tab === 'managed' ? all.filter((row) => ['owner','admin'].includes(row.role)) : all;
  const ownerIds = [...new Set(shown.map((row) => row.circles?.owner_id).filter(Boolean))];
  const { data: owners } = ownerIds.length
    ? await supabase.from('profiles').select('id,name,avatar_url,avatar_color,is_professional_verified').in('id', ownerIds)
    : { data: [] };
  const ownersById = Object.fromEntries((owners || []).map((owner) => [owner.id, owner]));
  const decorated = await Promise.all(shown.map(async (row) => ({
    ...row,
    circle: { ...row.circles, cover_url: await signedCircleMedia(supabase, row.circles.cover_path, 120), owner: ownersById[row.circles.owner_id] || null },
  })));

  return <>
    <AppTop backHref="/explore" backLabel={t.back} />
    <main className="circle-shell circle-hub">
      <header className="circle-page-head">
        <p className="circle-eyebrow">Espaços de confiança</p>
        <div className="circle-title-row">
          <div><h1>{labels.title}</h1><p>{labels.intro}</p></div>
          {profile?.is_professional_verified && <a className="circle-icon-cta" href="/circulos/novo" aria-label={labels.create}>+</a>}
        </div>
      </header>

      {profile?.is_professional_verified && <section className="circle-professional-banner" aria-label={labels.professionalArea}>
        <span className="circle-professional-mark" aria-hidden="true">✓</span>
        <div><b>{labels.professionalArea}</b><p>{labels.professionalAreaText}</p></div>
        <a href="/circulos/novo">{labels.create}<span aria-hidden="true">›</span></a>
      </section>}

      {(invitesResult.count || 0) > 0 && <section className="circle-invite-notice" aria-label={labels.invites}>
        <span className="circle-notice-icon" aria-hidden="true">✉</span>
        <div><b>Você tem um convite privado</b><p>Abra o link recebido para conhecer o Círculo e aceitar suas regras.</p></div>
        <span className="circle-count">{invitesResult.count}</span>
      </section>}

      <nav className="circle-tabs" aria-label="Seções de Círculos">
        <a href="/circulos" className={tab === 'mine' ? 'on' : ''} aria-current={tab === 'mine' ? 'page' : undefined}>{labels.mine}</a>
        <a href="/circulos?tab=managed" className={tab === 'managed' ? 'on' : ''} aria-current={tab === 'managed' ? 'page' : undefined}>{labels.managed}</a>
      </nav>

      {migrationMissing ? <section className="circle-empty" role="status"><b>Círculos ainda não estão disponíveis.</b><p>A estrutura privada precisa ser instalada antes de ativar este módulo.</p></section>
        : shown.length === 0 ? <section className="circle-empty"><span aria-hidden="true">↗</span><b>{tab === 'managed' ? 'Você ainda não administra um Círculo.' : 'Nenhum Círculo ainda.'}</b><p>{labels.empty}</p>{profile?.is_professional_verified && <a className="circle-primary" href="/circulos/novo">{labels.create}</a>}</section>
        : <section className="circle-card-list" aria-label={labels.mine}>{decorated.map((row) => <a className={`circle-card circle-card-theme-${row.circle.settings?.accent_color || 'sage'}`} href={`/circulos/${row.circle.slug}`} key={row.circle.id}>
          <div className="circle-card-cover" aria-hidden="true" style={row.circle.cover_url ? { backgroundImage: `linear-gradient(180deg,rgba(13,18,40,.02),rgba(13,18,40,.52)),url(${row.circle.cover_url})` } : undefined}><span>⌾</span></div>
          <div className="circle-card-body"><span className="circle-private-pill">▣ {labels.private}</span><h2>{row.circle.name}</h2><p>{row.circle.description || 'Um espaço privado dentro do ONE.'}</p>{row.circle.owner && <div className="circle-card-owner"><span className="circle-avatar" style={{ background: row.circle.owner.avatar_color || 'var(--sage)' }}>{row.circle.owner.avatar_url ? <img src={row.circle.owner.avatar_url} alt="" /> : (row.circle.owner.name || '?')[0]}</span><span>Por {row.circle.owner.name || 'profissional do ONE'}</span></div>}<footer><span>{['owner','admin'].includes(row.role) ? labels.manages : labels.participates}</span><span aria-hidden="true">›</span></footer></div>
        </a>)}</section>}

      {profile?.is_professional_verified
        ? <a className="circle-primary circle-main-create" href="/circulos/novo">+ {labels.create}</a>
        : <p className="circle-professional-note">{labels.professionalOnly}</p>}
    </main>
    <BottomNav active="explore" t={t} />
  </>;
}
