import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import Logo from '../../components/Logo';

export const dynamic = 'force-dynamic';
const OWNER_EMAIL = 'arquitetoluizgamm@gmail.com';

export default async function Metricas() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  if ((user.email || '').toLowerCase() !== OWNER_EMAIL) redirect('/home');

  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { data: journeys } = await supabase.from('journeys').select('id, owner_id');
  const { data: updates } = await supabase.from('updates').select('journey_id, day_number, kind');
  const { data: encs } = await supabase.from('encouragements').select('update_id');

  const js = journeys || [], ups = updates || [];
  const ownerByJourney = {}; js.forEach(j => { ownerByJourney[j.id] = j.owner_id; });

  const withJourney = new Set(js.map(j => j.owner_id));
  const postedDia1 = new Set(), day2 = new Set(), day7 = new Set();
  const setbackJourneys = new Set(), resumedJourneys = new Set();
  const maxDayByJourney = {}, setbackDayByJourney = {};

  ups.forEach(u => {
    const owner = ownerByJourney[u.journey_id];
    if (!owner) return;
    const d = u.day_number || 0;
    if (d >= 1) postedDia1.add(owner);
    if (d >= 2) day2.add(owner);
    if (d >= 7) day7.add(owner);
    if (d > (maxDayByJourney[u.journey_id] || 0)) maxDayByJourney[u.journey_id] = d;
    if (u.kind === 'setback') {
      setbackJourneys.add(u.journey_id);
      if (d > (setbackDayByJourney[u.journey_id] || 0)) setbackDayByJourney[u.journey_id] = d;
    }
  });
  // retomou após pausa: jornada com recaída e um dia posterior à recaída
  const resumedUsers = new Set();
  setbackJourneys.forEach(jid => {
    if ((maxDayByJourney[jid] || 0) > (setbackDayByJourney[jid] || 0)) resumedUsers.add(ownerByJourney[jid]);
  });

  // recebeu apoio
  const encUpdateIds = new Set((encs || []).map(e => e.update_id));
  // precisamos mapear update->owner: buscar updates com id
  const { data: upIds } = await supabase.from('updates').select('id, journey_id').in('id', [...encUpdateIds].slice(0, 1000));
  const receivedSupport = new Set();
  (upIds || []).forEach(u => { const o = ownerByJourney[u.journey_id]; if (o) receivedSupport.add(o); });

  const T = totalUsers || 0;
  const pct = n => T ? Math.round((n / T) * 100) : 0;
  const rows = [
    ['Criaram 1ª jornada', withJourney.size],
    ['Publicaram o Dia 1', postedDia1.size],
    ['Voltaram (Dia 2+)', day2.size],
    ['Continuaram até o Dia 7+', day7.size],
    ['Receberam apoio', receivedSupport.size],
    ['Retomaram após uma pausa', resumedUsers.size],
  ];

  return (
    <>
      <header className="top"><Logo href="/home" /><div className="top-right"><a className="ghost-btn" href="/home">Home</a></div></header>
      <main className="wrap">
        <div className="create-head"><p className="eyebrow">Painel interno</p><h1>Métricas de retorno</h1><p className="consistency">O que importa não é cadastro — é a pessoa voltar amanhã.</p></div>
        <div className="metric-top"><b>{T}</b><span>pessoas cadastradas</span></div>
        <div className="metric-funnel">
          {rows.map(([label, n]) => (
            <div className="metric-row" key={label}>
              <div className="metric-label">{label}</div>
              <div className="metric-bar"><span style={{ width: pct(n) + '%' }} /></div>
              <div className="metric-num"><b>{n}</b><small>{pct(n)}%</small></div>
            </div>
          ))}
        </div>
        <p className="metric-note">Ativação = criou a 1ª jornada. Retenção = voltou no Dia 2 e no Dia 7. Ressurgimento = retomou depois de uma recaída. Estes são os números que dizem se o produto tem significado.</p>
      </main>
    </>
  );
}
