import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import NewJourneyForm from '../new/NewJourneyForm';
import EditBanner from '../../components/EditBanner';
import BottomNav from '../../components/BottomNav';
import EditAvatar from '../../components/EditAvatar';
import CompanionCard from '../home/CompanionCard';
import NextStep from '../home/NextStep';
import ProgressBar from '../../components/ProgressBar';
import MediaGallery from '../../components/MediaGallery';
import Track from '../../components/Track';
import AppTop from '../../components/AppTop';
import NextChapter from '../../components/NextChapter';
import Espelho, { PorQue } from '../../components/Espelho';
import Capacidades from '../../components/Capacidades';
import { PercebidoEm } from '../../components/Percepcao';
import { analisarCapacidades } from '../../lib/capacidades';
import { computeNextChapter, ncLabels } from '../../lib/nextChapter';
import ProfileTabs from '../../components/ProfileTabs';
import EditProfileInfo from '../../components/EditProfileInfo';
import ProfileMenu from '../../components/ProfileMenu';
import CriarMenu from '../../components/CriarMenu';
import DeleteJourney from '../../components/DeleteJourney';
import EditJourney from '../../components/EditJourney';
import JourneyDays from '../../components/JourneyDays';
import JourneyFold from '../../components/JourneyFold';
import { pickUpi } from '../../lib/upi';
import ChallengeRespond from '../../components/ChallengeRespond';
import UpiGreeting from '../../components/UpiGreeting';
import PushToggle from '../../components/PushToggle';
import EcoToggle from '../../components/EcoToggle';

export const dynamic = 'force-dynamic';
const COLORS = ['#C16F54', '#84917A', '#5B7189', '#96523C', '#B3874A', '#A8637A'];

async function ensureProfile(supabase, user) {
  const meta = user.user_metadata || {};
  const googleAvatar = meta.avatar_url || meta.picture || null;
  const { data: existing } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color, banner_url, notif_paused, eco_on').eq('id', user.id).maybeSingle();
  if (existing) {
    if (!existing.avatar_url && googleAvatar) {
      await supabase.from('profiles').update({ avatar_url: googleAvatar }).eq('id', user.id);
      existing.avatar_url = googleAvatar;
    }
    return existing;
  }
  const base = (user.email || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '');
  let handle = '@' + base;
  const { data: taken } = await supabase.from('profiles').select('id').eq('handle', handle).maybeSingle();
  if (taken) handle = '@' + base + Math.floor(1000 + Math.random() * 9000);
  const profile = { id: user.id, name: meta.full_name || meta.name || base, handle, avatar_color: COLORS[Math.floor(Math.random() * COLORS.length)], avatar_url: googleAvatar };
  await supabase.from('profiles').insert(profile);
  try { await supabase.from('events').insert({ user_id: user.id, name: 'signup' }); } catch { }
  return profile;
}

export default async function Perfil() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const profile = await ensureProfile(supabase, user);
  const t = getDict(getLocale());

  const { data: journeys } = await supabase.from('journeys').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
  const list = journeys || [];
  const statsById = {};
  let maxStreak = 0, updatesCount = 0, setbackCount = 0, followers = [];
  const jIds = list.map(j => j.id);
  if (jIds.length) {
    const { data: stats } = await supabase.from('journey_stats').select('*').in('journey_id', jIds);
    (stats || []).forEach(s => { statsById[s.journey_id] = s; if ((s.streak || 0) > maxStreak) maxStreak = s.streak; });
    const [{ count: uc }, { count: sc }] = await Promise.all([
      supabase.from('updates').select('*', { count: 'exact', head: true }).in('journey_id', jIds),
      supabase.from('updates').select('*', { count: 'exact', head: true }).in('journey_id', jIds).eq('kind', 'setback'),
    ]);
    updatesCount = uc || 0; setbackCount = sc || 0;
  }
  {
    let followerIds = [];
    if (jIds.length) {
      const { data: fl } = await supabase.from('follows').select('user_id').in('journey_id', jIds);
      followerIds = (fl || []).map(f => f.user_id);
    }
    const { data: pf } = await supabase.from('profile_follows').select('follower_id').eq('following_id', user.id);
    followerIds = followerIds.concat((pf || []).map(f => f.follower_id));
    const ids = [...new Set(followerIds.filter(id => id !== user.id))];
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').in('id', ids);
      followers = profs || [];
    }
  }
  // Pontuacao saiu da tela: num app de recomeco, um numero que sobe
  // vira nota — e o dia ruim, que aqui e' parte do processo, passa a
  // parecer prejuizo. O calculo tambem ia embora com ela.

  const kindLabels = { step: t.kindStep, win: t.kindWin, setback: t.kindSetback, learned: t.kindLearned };
  let aiPrefOff = false;
  try { const { data: pref } = await supabase.from('profiles').select('ai_opt_out').eq('id', user.id).maybeSingle(); aiPrefOff = !!pref?.ai_opt_out; } catch { }
  const aiConfigured = !!process.env.OPENAI_API_KEY && list.length > 0;
  const aiOn = aiConfigured && !aiPrefOff;
  let myMedia = [];
  // ============================================================
  // LER MÍDIA SEM DEPENDER DE UMA COLUNA
  //
  // `caption` não existe em todo banco: o supabase/media.sql a
  // declara, mas tabelas criadas antes daquela linha não a têm.
  // E o Supabase não lança exceção — ele devolve { data: null },
  // que o `|| []` transforma em lista vazia.
  //
  // Traduzindo: pedir uma coluna que não existe faz o ÁLBUM
  // INTEIRO sumir da tela, sem erro nenhum aparecer. Por isso
  // aqui se tenta com a legenda e, se ela faltar, se lê sem.
  // Perde-se o texto da citação para o leitor de tela; não se
  // perde o acervo da pessoa.
  // ============================================================
  try {
    let { data: md, error } = await supabase.from('media')
      .select('id, url, kind, visibility, caption').eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error && /caption|column/i.test(error.message || '')) {
      ({ data: md } = await supabase.from('media')
        .select('id, url, kind, visibility').eq('user_id', user.id)
        .order('created_at', { ascending: false }));
    }
    myMedia = md || [];
  } catch {}
  // ============================================================
  // CITAÇÃO NÃO É FOTO DE ÁLBUM
  //
  // As duas moram na mesma tabela `media`, e até aqui a citação
  // entrava como kind 'photo' — então uma frase desenhada aparecia
  // no meio das fotos da pessoa, como se fosse mais uma.
  //
  // Agora a citação nasce com kind 'quote' e ganha aba própria. As
  // publicadas ANTES desta mudança continuam no álbum: não dá para
  // saber quais eram citações sem chutar, e chutar aqui significa
  // mexer no acervo de alguém. Ver supabase/citacao-aba.sql.
  // ============================================================
  const ehCitacao = (m) => m.kind === 'quote';
  const myQuotes = myMedia.filter(ehCitacao);
  const myAlbum = myMedia.filter((m) => !ehCitacao(m));

  // ---- Próximo Capítulo (casa fixa: sempre disponível aqui) ----
  const primary = list[0] || null;
  const nc = await computeNextChapter(supabase, user.id, primary, t);

  // O porquê resgatado: aparece no dia difícil e na volta — nunca sempre.
  // É o que a própria pessoa escreveu ao criar a jornada, guardado sem uso até agora.
  let porque = '';
  try {
    if (primary?.goal && (nc.mode === 'return' || nc.mode === 'reveal')) {
      const { data: last } = await supabase.from('updates').select('kind, created_at')
        .eq('journey_id', primary.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      const parou = last ? (Date.now() - new Date(last.created_at).getTime()) / 86400000 >= 2 : false;
      if (parou || last?.kind === 'setback') porque = primary.goal;
    }
  } catch {}

  // ---- Capacidades em construção: o que ela aprendeu a fazer ----
  // Roda sobre os registros que já existem. Nenhum dado novo é pedido.
  let capacidades = [];
  try {
    if (jIds.length) {
      const { data: todos } = await supabase.from('updates')
        .select('day_number, kind, created_at').in('journey_id', jIds)
        .order('created_at', { ascending: true }).limit(400);
      capacidades = analisarCapacidades(todos || []);
    }
  } catch {}

  // ---- O que as pessoas percebem em você ----
  let percebido = [];
  try {
    const { data: pcs } = await supabase.from('percepcoes').select('tipo').eq('to_id', user.id);
    const conta = {};
    (pcs || []).forEach((x) => { conta[x.tipo] = (conta[x.tipo] || 0) + 1; });
    percebido = Object.entries(conta).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([tipo, n]) => ({ tipo, n }));
  } catch {}

  // ---- Upi: o pingo que acompanha ----
  let upi = null;
  try {
    let last = null;
    if (jIds.length) {
      const { data: lu } = await supabase.from('updates').select('kind, created_at').in('journey_id', jIds).order('created_at', { ascending: false }).limit(1).maybeSingle();
      last = lu;
    }
    const daysSince = last ? Math.floor((Date.now() - new Date(last.created_at).getTime()) / 86400000) : 0;
    const pDay = (statsById[primary?.id] || {}).current_day || 0;
    upi = pickUpi({ locale: getLocale(), userId: user.id, hasJourney: list.length > 0, day: pDay, streak: maxStreak, lastKind: last?.kind || '', daysSince, updatesCount });
  } catch {}

  // ---- Desafios (caminhada junta) ----
  let chInvites = [], chWaiting = [], chActive = [];
  const chProfiles = {};
  try {
    const { data: chs } = await supabase.from('challenges').select('*')
      .or(`from_id.eq.${user.id},to_id.eq.${user.id}`)
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false }).limit(20);
    const chList = chs || [];
    const otherIds = [...new Set(chList.flatMap((c) => [c.from_id, c.to_id]).filter((id) => id !== user.id))];
    if (otherIds.length) {
      const { data: cps } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').in('id', otherIds);
      (cps || []).forEach((p) => { chProfiles[p.id] = p; });
    }
    chInvites = chList.filter((c) => c.status === 'pending' && c.to_id === user.id);
    chWaiting = chList.filter((c) => c.status === 'pending' && c.from_id === user.id);
    chActive = chList.filter((c) => c.status === 'active');
  } catch {}

  // ---- Quem te apoia: abraços recebidos + apoios nos seus posts ----
  let supporters = [];
  try {
    let uids = [];
    if (jIds.length) { const { data: ups } = await supabase.from('updates').select('id').in('journey_id', jIds); uids = (ups || []).map(u => u.id); }
    const mids = myMedia.map(m => m.id);
    const agg = {};
    const bump = (id, ts) => { if (!id || id === user.id) return; const cur = agg[id] || { count: 0, last: 0 }; cur.count++; const tt = ts ? new Date(ts).getTime() : 0; if (tt > cur.last) cur.last = tt; agg[id] = cur; };
    const guard = (pr) => Promise.resolve(pr).then((r) => r).catch(() => ({ data: [] }));
    const queries = [];
    if (uids.length) queries.push(guard(supabase.from('encouragements').select('user_id, created_at').in('update_id', uids).neq('user_id', user.id)));
    if (mids.length) queries.push(guard(supabase.from('encouragements').select('user_id, created_at').in('media_id', mids).neq('user_id', user.id)));
    queries.push(guard(supabase.from('hugs').select('from_id, created_at').eq('to_id', user.id).neq('from_id', user.id)));
    const res = await Promise.all(queries);
    res.forEach((r) => (r.data || []).forEach((row) => bump(row.user_id || row.from_id, row.created_at)));
    const ids = Object.keys(agg);
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').in('id', ids);
      supporters = (profs || []).map((p) => ({ ...p, count: agg[p.id].count, last: agg[p.id].last })).sort((a, b) => b.last - a.last).slice(0, 40);
    }
  } catch {}

  return (
    <>
      <AppTop backLabel={t.back} />

      <Track type="visit" meta={{ page: "perfil" }} />
      <main className="wrap">
        <section className="profile-card">
          <div className="pc-banner" style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})` } : undefined} />
          <div className="pc-info">
            <div className="pc-avatar" style={{ background: profile.avatar_color || 'var(--orange)' }}>
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : profile.name[0]}
            </div>
            <div className="pc-meta">
              <h1>{profile.name}</h1>
              <div className="pc-sub">
                <span>{profile.handle}</span>
              </div>
              {maxStreak > 0 && <p className="consistency pc-consistency">{t.consistencyLine.replace('{n}', maxStreak)}</p>}
            </div>

            {/* criar e ajustar sao acoes de dono: moram no canto do card,
                na mesma linha do nome. Fora do card elas competiam com o
                Upi pela largura e empurravam a fala dele para baixo. */}
            <div className="pc-acoes">
              <CriarMenu t={t} className="pf-add" tamanho={21} rotulo={t.navCreate} />

              <ProfileMenu
                label={t.settings}
                closeLabel={t.epCancel}
                sair={<form action="/auth/signout" method="post"><button className="pm-sair-btn" type="submit">{t.signOut}</button></form>}
              >
                <div className="pm-linhas">
                  <p className="pm-section-hint">Personalize sua foto e sua capa</p>
                  <EditAvatar userId={user.id} label={t.editPhoto} uploadingLabel={t.uploading} modo="linha" />
                  <EditBanner userId={user.id} label={t.editBanner} uploadingLabel={t.uploading} modo="linha" cropLabels={{ cover: t.cropCover, use: t.cropUse, cancel: t.cropCancel, hint: t.cropHint, zoom: t.cropZoom }} />
                  <EditProfileInfo userId={user.id} initialName={profile.name} initialHandle={profile.handle} labels={{ btn: t.epBtn, title: t.epTitle, name: t.epName, handle: t.epHandle, hint: t.epHint, save: t.epSave, saving: t.epSaving, cancel: t.epCancel, errName: t.epErrName, errHandle: t.epErrHandle, errTaken: t.epErrTaken, errSave: t.epErrSave }} />
                  <a className="ghost-btn" href={`/${profile.handle}`}>{t.viewPublic}</a>
                </div>

                <PushToggle vapidKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''}
                  labels={{ title: t.pushTitle, onSub: t.pushOnSub, offSub: t.pushOffSub, denied: t.pushDenied, turnOn: t.pushTurnOn, turnOff: t.pushTurnOff, wait: t.pushWait, test: t.pushTest, testSent: t.pushTestSent, testFail: t.pushTestFail }} />

                <EcoToggle inicial={profile.eco_on !== false} labels={{ title: t.ecoTitle, sub: t.ecoSub, on: t.ecoOn, off: t.ecoOff }} />
              </ProfileMenu>
            </div>
          </div>
        </section>

        {/* o Upi ficou com a linha inteira: e' uma frase, precisa de largura.
            Sem fala, a linha nao existe — antes sobrava um vao de 12px. */}
        {upi?.line && (
          <div className="pc-bar">
            <div className="pc-bar-upi">
              <UpiGreeting line={upi.line} cat={upi.cat}
                msgKey={`${new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10)}:${upi.cat}`} />
            </div>
          </div>
        )}

        <section className="ch-block">
            <p className="eyebrow">{t.chTitle}</p>
            {chInvites.length === 0 && chActive.length === 0 && chWaiting.length === 0 && (
              <p className="ch-empty">{t.chEmpty}</p>
            )}
            {chInvites.map((c) => { const p = chProfiles[c.from_id] || {}; return (
              <div className="ch-card" key={c.id}>
                <span className="ch-ava" style={{ background: p.avatar_color || 'var(--orange)' }}>{p.avatar_url ? <img src={p.avatar_url} alt="" /> : (p.name || '?')[0]}</span>
                <div className="ch-info"><b>{fill(t.chInviteFrom, { name: (p.name || '').split(' ')[0] })}</b><p>{c.title} · {fill(t.chDays, { d: c.days })}</p></div>
                <ChallengeRespond id={c.id} labels={{ accept: t.chAccept, decline: t.chDecline }} />
              </div>
            ); })}
            {chActive.map((c) => { const p = chProfiles[c.from_id === user.id ? c.to_id : c.from_id] || {}; return (
              <a className="ch-card link" key={c.id} href={`/desafio/${c.id}`}>
                <span className="ch-ava" style={{ background: p.avatar_color || 'var(--orange)' }}>{p.avatar_url ? <img src={p.avatar_url} alt="" /> : (p.name || '?')[0]}</span>
                <div className="ch-info"><b>{c.title}</b><p>{t.chTogether} · {fill(t.chDays, { d: c.days })}</p></div>
                <span className="view-link">{t.chOpen}</span>
              </a>
            ); })}
            {chWaiting.map((c) => { const p = chProfiles[c.to_id] || {}; return (
              <div className="ch-card muted" key={c.id}>
                <span className="ch-ava" style={{ background: p.avatar_color || 'var(--orange)' }}>{p.avatar_url ? <img src={p.avatar_url} alt="" /> : (p.name || '?')[0]}</span>
                <div className="ch-info"><b>{c.title}</b><p>{fill(t.chWaiting, { name: (p.name || '').split(' ')[0] })}</p></div>
              </div>
            ); })}
        </section>

        {/* as abas existem sempre: sem jornada, a pessoa ainda tem álbum
            e pessoas para explorar — e o vazio precisa de uma saída */}
        <ProfileTabs
            labels={{ journeys: t.profTabJourneys, album: t.profTabAlbum, quotes: t.profTabQuotes, people: t.profTabPeople }}
            journeys={(
              <>
                {list.length === 0 && (
                  <div className="tab-empty">
                    <p>{t.obSub}</p>
                    <a className="cta" href="/new">{t.newJourney}</a>
                  </div>
                )}
                {list.map(j => {
                  const s = statsById[j.id] || {};
                  const day = s.current_day || 0;
                  return (
                    <a className="jcard jcard-link" key={j.id} href={`/perfil/jornada/${j.slug}`}>
                      <div className="jcard-head">
                        <div>
                          <h2>{j.title}</h2>
                          <span>{fill(t.dayOf, { d: day, t: j.total_days, s: s.streak || 0 })}</span>
                        </div>
                        <svg className="jcard-seta" viewBox="0 0 24 24" width="20" height="20" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                      <ProgressBar day={day} total={j.total_days} dayTpl={t.dayXofY} goalWord={t.goalWord} />
                    </a>
                  );
                })}
                {aiConfigured && <CompanionCard userId={user.id} title={t.companionTitle} btn={t.companionBtn} loading={t.companionLoading} initialOff={aiPrefOff} labels={{ consent: t.aiConsent, off: t.aiOff, offState: t.aiOffState, reactivate: t.aiReactivate, err: t.aiErr, rateErr: t.aiRateErr }} />}
              </>
            )}
            album={myAlbum.length > 0 ? (
              <MediaGallery items={myAlbum} showVis visLabels={{ public: t.pubPublic, followers: t.pubFollowers, private: t.pubPrivate }} own deleteLabel={t.mediaDelete} deleteConfirm={t.mediaDeleteConfirm} />
            ) : (
              <div className="tab-empty">
                <p>{t.albumEmpty}</p>
                <a className="cta" href="/midia">{t.albumEmptyCta}</a>
              </div>
            )}
            quotes={myQuotes.length > 0 ? (
              <MediaGallery items={myQuotes} showVis visLabels={{ public: t.pubPublic, followers: t.pubFollowers, private: t.pubPrivate }} own deleteLabel={t.mediaDelete} deleteConfirm={t.mediaDeleteConfirm} />
            ) : (
              <div className="tab-empty">
                <p>{t.quotesEmpty}</p>
                <a className="cta" href="/citacao">{t.quotesEmptyCta}</a>
              </div>
            )}
            people={(
              <>
                {supporters.length > 0 && (
                  <section className="followers-block supporters-block">
                    <div className="fb-head">
                      <p className="eyebrow">{t.supportersMineTitle}</p>
                      <b className="fb-count">{supporters.length}</b>
                    </div>
                    <p className="fb-who">{t.supportersMineWho}</p>
                    <div className="followers-list">
                      {supporters.map((s) => (
                        <a className="follower-chip" key={s.id} href={`/${s.handle}`}>
                          <span className="fc-ava" style={{ background: s.avatar_color || 'var(--orange)' }}>
                            {s.avatar_url ? <img src={s.avatar_url} alt="" /> : (s.name || '?')[0]}
                          </span>
                          <span className="fc-name">{s.name}</span>
                          {s.count > 1 && <span className="fc-count">{s.count}×</span>}
                        </a>
                      ))}
                    </div>
                  </section>
                )}
                <section className="followers-block">
                  <div className="fb-head">
                    <p className="eyebrow">{t.followersTitle}</p>
                    <b className="fb-count">{followers.length}</b>
                  </div>
                  {followers.length === 0
                    ? <p className="fb-empty">{t.followersNone}</p>
                    : (<>
                      <p className="fb-who">{t.followersWho}</p>
                      <div className="followers-list">
                        {followers.map(f => (
                          <a className="follower-chip" key={f.id} href={`/${f.handle}`}>
                            <span className="fc-ava" style={{ background: f.avatar_color || 'var(--orange)' }}>
                              {f.avatar_url ? <img src={f.avatar_url} alt="" /> : (f.name || '?')[0]}
                            </span>
                            <span className="fc-name">{f.name}</span>
                          </a>
                        ))}
                      </div>
                    </>)}
                </section>
              </>
            )}
          />


        {nc.mode && (
          <div className="nc-neutral">
            {porque && <PorQue texto={porque} labels={{ eyebrow: t.pqEyebrow }} />}
            <PercebidoEm itens={percebido} labels={{ blockTitle: t.pcBlockTitle, byN: t.pcByN, tipos: t.pcTipos }} />
            <Capacidades lista={capacidades} labels={{ title: t.capTitle, note: t.capNote,
              voltarTitulo: t.capVoltar, voltarAntes: t.capVoltarAntes, voltarAgora: t.capVoltarAgora, voltarMaior: t.capVoltarMaior,
              dificilTitulo: t.capDificil, dificilProva: t.capDificilProva,
              presencaTitulo: t.capPresenca, presencaProva: t.capPresencaProva }} />
            <Espelho labels={{ teaser: t.espTeaser, eyebrow: t.espEyebrow, dayFmt: t.dayShort, palavra: t.espPalavra, tempo: t.espTempo, tom: t.espTom, ritmo: t.espRitmo, close: t.espClose }} />
            <NextChapter mode={nc.mode} line={nc.line} env={nc.env} labels={ncLabels(t, nc)} />
          </div>
        )}
      </main>
      <BottomNav active="profile" t={t} />
    </>
  );
}
