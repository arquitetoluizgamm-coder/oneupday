import { notFound } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { getDict, fill } from '../../../lib/i18n';
import AppTop from '../../../components/AppTop';
import ChallengeCheck from '../../../components/ChallengeCheck';
import ChallengeRespond from '../../../components/ChallengeRespond';
import Comments from '../../../components/Comments';
import ChallengeStamp from '../../../components/ChallengeStamp';

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

  let checks = null;
  {
    // tolerante: se a coluna photo_url ainda não existir, busca sem ela
    const r1 = await supabase.from('challenge_checks').select('user_id, day_key, photo_url').eq('challenge_id', ch.id);
    if (r1.error) {
      const r2 = await supabase.from('challenge_checks').select('user_id, day_key').eq('challenge_id', ch.id);
      checks = r2.data;
    } else checks = r1.data;
  }
  const byUser = {};
  const photoBy = {};
  (checks || []).forEach((c) => {
    (byUser[c.user_id] ||= new Set()).add(String(c.day_key));
    if (c.photo_url) (photoBy[c.user_id] ||= {})[String(c.day_key)] = c.photo_url;
  });

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
                      {dayKeys.map((k) => {
                        const ph = (photoBy[id] || {})[k];
                        return ph
                          ? <ChallengeStamp key={k} challengeId={ch.id} dayKey={k} photo={ph} today={k === today}
                              canRemove={!!user && user.id === id} labels={{ remove: t.chRemovePhoto, confirm: t.chRemovePhotoConfirm }} />
                          : <i key={k} className={`${set.has(k) ? 'on' : ''}${k === today ? ' today' : ''}`} />;
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="chp-comments">
                <Comments challengeId={ch.id}
                  labels={{ comment: t.comment, close: t.commentClose, empty: t.commentEmpty, placeholder: t.commentPlaceholder, send: t.commentSend, sending: t.commentSending, unsafe: t.commentUnsafe, pendente: t.commentPendente, error: t.commentError, someone: t.commentSomeone, reply: t.commentReply, more: t.commentMore, less: t.commentLess, replying: t.commentReplying, cancel: t.commentCancel }} />
              </div>

              {ended
                ? <p className="chp-done gold">{t.chDone}</p>
                : isPart && (
                  <>
                    {checkedToday && <p className="chp-done">{t.chChecked}</p>}
                    <ChallengeCheck id={ch.id} userId={user.id} label={t.chCheck} photoLabel={t.chStamp} checkedToday={checkedToday}
                      cropLabels={{ square: t.cropSquare, use: t.cropUse, cancel: t.cropCancel, hint: t.cropHint, zoom: t.cropZoom }} />
                  </>
                )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
