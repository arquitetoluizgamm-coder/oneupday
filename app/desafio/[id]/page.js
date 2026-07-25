import { notFound } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { getDict, fill } from '../../../lib/i18n';
import AppTop from '../../../components/AppTop';
import ChallengeCheck from '../../../components/ChallengeCheck';
import ChallengeRespond from '../../../components/ChallengeRespond';

export const dynamic = 'force-dynamic';

const dayKeyOf = (ms) => new Date(ms - 3 * 3600 * 1000).toISOString().slice(0, 10);

export default async function Desafio({ params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = getDict(getLocale());

  const { data: ch } = await supabase.from('challenges').select('*').eq('id', params.id).maybeSingle();
  if (!ch || ch.status === 'declined') notFound();

  const { data: ps } = await supabase.from('profiles')
    .select('id, name, handle, avatar_url, avatar_color').in('id', [ch.from_id, ch.to_id]);
  const pmap = {};
  (ps || []).forEach((p) => { pmap[p.id] = p; });

  const { data: checks } = await supabase.from('challenge_checks')
    .select('user_id, day_key').eq('challenge_id', ch.id);
  const byUser = {};
  (checks || []).forEach((c) => { (byUser[c.user_id] ||= new Set()).add(String(c.day_key)); });

  const today = dayKeyOf(Date.now());
  const start = ch.accepted_at ? new Date(ch.accepted_at) : null;
  const dayKeys = [];
  if (start) for (let i = 0; i < ch.days; i++) dayKeys.push(dayKeyOf(start.getTime() + i * 86400000));
  const ended = start ? dayKeys[dayKeys.length - 1] < today : false;
  const isPart = !!user && (user.id === ch.from_id || user.id === ch.to_id);
  const checkedToday = !!user && !!byUser[user.id] && byUser[user.id].has(today);

  const Ava = ({ p, size = 44 }) => (
    <span className="chp-ava" style={{ width: size, height: size, background: (p && p.avatar_color) || 'var(--orange)' }}>
      {p && p.avatar_url ? <img src={p.avatar_url} alt="" /> : ((p && p.name) || '?')[0]}
    </span>
  );

  return (
    <>
      <AppTop backLabel={t.back} />
      <main className="wrap">
        <section className="chp">
          <p className="eyebrow">{t.chPageEyebrow}</p>
          <h1 className="chp-title">{ch.title}</h1>
          <p className="chp-sub">{t.chTogether} · {fill(t.chDays, { d: ch.days })}</p>

          {ch.status === 'pending' && (
            <div className="chp-pending">
              <div className="chp-who-row">
                <Ava p={pmap[ch.from_id]} />
                <span className="ch-sline big" aria-hidden="true"><i /></span>
                <Ava p={pmap[ch.to_id]} />
              </div>
              {user && user.id === ch.to_id
                ? (<>
                    <p className="chp-inv">{fill(t.chInviteFrom, { name: ((pmap[ch.from_id] || {}).name || '').split(' ')[0] })}</p>
                    <ChallengeRespond id={ch.id} labels={{ accept: t.chAccept, decline: t.chDecline }} />
                  </>)
                : <p className="chp-inv">{fill(t.chWaiting, { name: ((pmap[ch.to_id] || {}).name || '').split(' ')[0] })}</p>}
            </div>
          )}

          {ch.status === 'active' && (
            <>
              {[ch.from_id, ch.to_id].map((id) => {
                const p = pmap[id] || {};
                const set = byUser[id] || new Set();
                const n = dayKeys.filter((k) => set.has(k)).length;
                return (
                  <div className="chp-part" key={id}>
                    <div className="chp-who">
                      <Ava p={p} size={38} />
                      <b>{p.name}</b>
                      <span className="chp-count">{fill(t.chPresence, { n, d: ch.days })}</span>
                    </div>
                    <div className="chp-dots">
                      {dayKeys.map((k) => (
                        <i key={k} className={`${set.has(k) ? 'on' : ''}${k === today ? ' today' : ''}`} />
                      ))}
                    </div>
                  </div>
                );
              })}

              {ended
                ? <p className="chp-done gold">{t.chDone}</p>
                : isPart && (checkedToday
                    ? <p className="chp-done">{t.chChecked}</p>
                    : <ChallengeCheck id={ch.id} label={t.chCheck} />)}
            </>
          )}
        </section>
      </main>
    </>
  );
}
