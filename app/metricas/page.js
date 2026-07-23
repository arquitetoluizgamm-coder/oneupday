import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import Logo from '../../components/Logo';

export const dynamic = 'force-dynamic';
const OWNER_EMAIL = 'arquitetoluizgamm@gmail.com';
const DAY = 86400000;

export default async function Metricas() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  if ((user.email || '').toLowerCase() !== OWNER_EMAIL) redirect('/home');

  const [{ data: profiles }, { data: journeys }, { data: updates }, { count: encCount }] = await Promise.all([
    supabase.from('profiles').select('id, created_at'),
    supabase.from('journeys').select('id, owner_id, created_at'),
    supabase.from('updates').select('journey_id, day_number, created_at'),
    supabase.from('encouragements').select('*', { count: 'exact', head: true }),
  ]);
  let events = [];
  try { const { data } = await supabase.from('events').select('name, user_id, anon_id, created_at').order('created_at', { ascending: false }).limit(20000); events = data || []; } catch { }

  const profs = profiles || [], js = journeys || [], ups = updates || [];
  const now = Date.now();
  const ownerBy = {}; js.forEach(j => { ownerBy[j.id] = j.owner_id; });

  // cadastro por usuário (created_at do profile)
  const signupBy = {}; profs.forEach(p => { signupBy[p.id] = new Date(p.created_at || now).getTime(); });

  // atividade por usuário: eventos + posts
  const activeIdx = {};   // userId -> Set(dayIndex)
  const activeAt = {};    // userId -> [timestamps]
  function addAct(uid, when) {
    if (!uid || !signupBy[uid]) return;
    const w = new Date(when).getTime();
    (activeAt[uid] ||= []).push(w);
    (activeIdx[uid] ||= new Set()).add(Math.floor((w - signupBy[uid]) / DAY));
  }
  events.forEach(e => { if (e.user_id) addAct(e.user_id, e.created_at); });
  ups.forEach(u => addAct(ownerBy[u.journey_id], u.created_at));

  // contadores de eventos
  const evCount = t => events.filter(e => e.name === t).length;
  const uniqVisitors = new Set(events.filter(e => e.name === 'landing_view').map(e => e.user_id || e.anon_id)).size;
  const cardGen = evCount('card_generated'), cardShared = evCount('card_shared'), cardClick = evCount('card_clicked');

  // funil de entrada
  const usersWithJourney = new Set(js.map(j => j.owner_id));
  const usersDay1 = new Set(ups.filter(u => (u.day_number || 0) >= 1).map(u => ownerBy[u.journey_id]).filter(Boolean));

  // retenção por cohort
  let d2e = 0, d2r = 0, d7e = 0, d7r = 0, retAnyE = 0, retAnyR = 0;
  for (const uid of Object.keys(signupBy)) {
    const age = Math.floor((now - signupBy[uid]) / DAY);
    const idx = activeIdx[uid] || new Set();
    const has = (arr) => arr.some(d => idx.has(d));
    if (age >= 1) { retAnyE++; if ([...idx].some(d => d >= 1)) retAnyR++; }
    if (age >= 2) { d2e++; if (has([1, 2])) d2r++; }
    if (age >= 7) { d7e++; if (has([6, 7, 8])) d7r++; }
  }

  // ativos (DAU/WAU/MAU): qualquer atividade na janela
  const activeWithin = (days) => {
    const cut = now - days * DAY;
    const set = new Set();
    for (const uid of Object.keys(activeAt)) if (activeAt[uid].some(w => w >= cut)) set.add(uid);
    return set.size;
  };
  const dau = activeWithin(1), wau = activeWithin(7), mau = activeWithin(30);

  const T = profs.length;
  const pctOf = (n, base) => base ? Math.round((n / base) * 100) : 0;
  const rate = (r, e) => e ? Math.round((r / e) * 100) : 0;

  const funnel = [
    ['Visitantes (landing)', uniqVisitors, T],
    ['Cadastros', T, uniqVisitors || T],
    ['Criaram jornada', usersWithJourney.size, T],
    ['Publicaram Dia 1', usersDay1.size, T],
  ];
  const viral = [
    ['Cards gerados', cardGen],
    ['Cards compartilhados', cardShared],
    ['Cliques nos cards', cardClick],
  ];

  return (
    <>
      <header className="top"><Logo href="/home" /><div className="top-right"><a className="ghost-btn" href="/home">Home</a></div></header>
      <main className="wrap">
        <div className="create-head"><p className="eyebrow">Painel interno</p><h1>Dados de tração</h1><p className="consistency">O valuation deixa de ser opinião quando estes números existem.</p></div>

        <div className="kpi-row">
          <div className="kpi"><b>{T}</b><span>cadastros</span></div>
          <div className="kpi"><b>{dau}</b><span>ativos hoje</span></div>
          <div className="kpi"><b>{wau}</b><span>ativos 7d</span></div>
          <div className="kpi"><b>{mau}</b><span>ativos 30d</span></div>
        </div>

        <h2 className="metric-h2">Funil de entrada</h2>
        <div className="metric-funnel">
          {funnel.map(([label, n, base]) => (
            <div className="metric-row" key={label}>
              <div className="metric-label">{label}</div>
              <div className="metric-bar"><span style={{ width: pctOf(n, T || 1) + '%' }} /></div>
              <div className="metric-num"><b>{n}</b><small>{pctOf(n, base)}%</small></div>
            </div>
          ))}
        </div>

        <h2 className="metric-h2">Retenção por cohort</h2>
        <div className="ret-grid">
          <div className="ret-card"><span>Voltou depois do Dia 1</span><b>{rate(retAnyR, retAnyE)}%</b><small>{retAnyR}/{retAnyE} elegíveis</small></div>
          <div className="ret-card"><span>Retenção Dia 2</span><b>{rate(d2r, d2e)}%</b><small>{d2r}/{d2e} elegíveis</small></div>
          <div className="ret-card hi"><span>Retenção Dia 7</span><b>{rate(d7r, d7e)}%</b><small>{d7r}/{d7e} elegíveis</small></div>
        </div>

        <h2 className="metric-h2">Funil viral (compartilhamento)</h2>
        <div className="metric-funnel">
          {viral.map(([label, n]) => (
            <div className="metric-row" key={label}>
              <div className="metric-label">{label}</div>
              <div className="metric-bar"><span style={{ width: pctOf(n, cardGen || 1) + '%' }} /></div>
              <div className="metric-num"><b>{n}</b></div>
            </div>
          ))}
          <p className="metric-note">Clique por compartilhamento: <b>{rate(cardClick, cardShared)}%</b> · Compartilhamento por card gerado: <b>{rate(cardShared, cardGen)}%</b></p>
        </div>

        <h2 className="metric-h2">Engajamento</h2>
        <div className="kpi-row">
          <div className="kpi"><b>{js.length}</b><span>jornadas</span></div>
          <div className="kpi"><b>{ups.length}</b><span>publicações</span></div>
          <div className="kpi"><b>{encCount || 0}</b><span>apoios enviados</span></div>
          <div className="kpi"><b>{evCount('journey_view')}</b><span>views de jornada</span></div>
        </div>

        <p className="metric-note">
          Definições: <b>elegível</b> = cadastrou há tempo suficiente pra a janela ter passado. Dia 2 = ativo no 2º dia após o cadastro; Dia 7 = ativo entre o 6º e o 8º dia. Atividade = qualquer visita, publicação ou ação registrada. Funil e cohorts acumulam a partir da instalação do rastreamento — números pequenos no início são esperados.
        </p>
      </main>
    </>
  );
}
