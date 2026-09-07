'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLE_LABEL = { owner: 'Responsável', admin: 'Administrador', moderator: 'Moderador', member: 'Membro' };

function Avatar({ profile }) {
  const name = profile?.name || 'Pessoa';
  return <span className="circle-avatar" style={{ background: profile?.avatar_color || 'var(--sage)' }}>
    {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : name.slice(0, 1).toUpperCase()}
  </span>;
}

function Comments({ post, currentUserId, onCount }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  async function toggle() {
    const next = !open; setOpen(next);
    if (next && !loaded) {
      const response = await fetch(`/api/circles/comments?postId=${encodeURIComponent(post.id)}`);
      const data = await response.json().catch(() => ({}));
      if (response.ok) { setItems(data.comments || []); setLoaded(true); }
    }
  }
  async function submit(event) {
    event.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    const response = await fetch('/api/circles/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ circle_id: post.circle_id, post_id: post.id, body: text }) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) { setItems((current) => [...current, { ...data.comment, profiles: { id: currentUserId, name: 'Você' } }]); setText(''); onCount(1); }
    setBusy(false);
  }
  return <div className="circle-comments">
    <button type="button" className="circle-action-link" onClick={toggle} aria-expanded={open}>◯ {post.comment_count} comentário{post.comment_count === 1 ? '' : 's'}</button>
    {open && <div className="circle-comment-panel">
      {items.map((item) => <div className="circle-comment" key={item.id}><Avatar profile={item.profiles} /><p><b>{item.profiles?.name || 'Membro'}</b>{item.body}</p></div>)}
      {items.length === 0 && <p className="circle-comment-empty">Ainda não há comentários.</p>}
      {post.comments_enabled && <form onSubmit={submit}><label className="sr-only" htmlFor={`comment-${post.id}`}>Escreva um comentário</label><input id={`comment-${post.id}`} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva com cuidado…" /><button disabled={busy || !text.trim()}>{busy ? '…' : 'Enviar'}</button></form>}
    </div>}
  </div>;
}

function PostCard({ initial, currentUserId, canModerate }) {
  const [post, setPost] = useState(initial);
  const [removed, setRemoved] = useState(false);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState('');
  if (removed) return null;
  const profile = post.profiles;
  const mine = post.reactions?.mine?.includes('support');
  async function react() {
    if (working) return; setWorking(true);
    const response = await fetch('/api/circles/reactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ circle_id: post.circle_id, post_id: post.id, reaction: 'support' }) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setPost((current) => ({ ...current, reactions: { count: Math.max(0, current.reactions.count + (data.active ? 1 : -1)), mine: data.active ? ['support'] : [] } }));
    setWorking(false);
  }
  async function postAction(action) {
    const method = action === 'delete' ? 'DELETE' : 'PATCH';
    const response = await fetch('/api/circles/posts', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(action === 'delete' ? { post_id: post.id } : { post_id: post.id, action }) });
    if (response.ok) {
      if (action === 'delete' || action === 'hide' || action === 'remove') setRemoved(true);
      if (action === 'pin') setPost((current) => ({ ...current, pinned_at: new Date().toISOString() }));
      if (action === 'unpin') setPost((current) => ({ ...current, pinned_at: null }));
      if (action === 'close_comments') setPost((current) => ({ ...current, comments_enabled: false }));
    }
  }
  async function reportPost() {
    const details = window.prompt('Conte brevemente o que precisa ser revisado. Esta denúncia será vista somente pela moderação do Círculo.');
    if (details === null) return;
    const response = await fetch('/api/circles/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ circle_id: post.circle_id, target_type: 'post', target_id: post.id, reason: 'other', details }) });
    setNotice(response.ok ? 'Denúncia enviada à moderação do Círculo.' : 'Não foi possível enviar a denúncia.');
  }
  return <article className="circle-post">
    {post.pinned_at && <span className="circle-pinned">⌾ Fixado</span>}
    <header><Avatar profile={profile} /><div><b>{profile?.name || 'Membro do Círculo'}</b><span>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(post.created_at))}</span></div><span className="circle-private-mini">▣ Privado</span></header>
    {post.body && <p className="circle-post-body">{post.body}</p>}
    {post.media_url && <div className="circle-post-media">{post.media_type === 'video'
      ? <video src={post.media_url} controls playsInline preload="metadata" />
      : <img src={post.media_url} alt="Mídia compartilhada no Círculo" />}</div>}
    {post.link_url && <a className="circle-post-link" href={post.link_url} target="_blank" rel="noreferrer">Abrir conteúdo relacionado ↗</a>}
    <div className="circle-post-actions">
      <button type="button" className={mine ? 'on' : ''} onClick={react} disabled={working}>♡ {post.reactions.count} apoio{post.reactions.count === 1 ? '' : 's'}</button>
      <Comments post={post} currentUserId={currentUserId} onCount={(amount) => setPost((current) => ({ ...current, comment_count: current.comment_count + amount }))} />
      <details className="circle-post-menu"><summary aria-label="Opções da publicação">•••</summary><div>
        {canModerate && <button type="button" onClick={() => postAction(post.pinned_at ? 'unpin' : 'pin')}>{post.pinned_at ? 'Desafixar' : 'Fixar'}</button>}
        {canModerate && post.comments_enabled && <button type="button" onClick={() => postAction('close_comments')}>Fechar comentários</button>}
        {canModerate && post.author_id !== currentUserId && <button type="button" onClick={() => postAction('hide')}>Ocultar</button>}
        {post.author_id === currentUserId && <button type="button" className="danger" onClick={() => postAction('delete')}>Excluir</button>}
        {post.author_id !== currentUserId && <button type="button" onClick={reportPost}>Denunciar à moderação</button>}
      </div></details>
    </div>
    {notice && <p className="circle-post-notice" role="status">{notice}</p>}
  </article>;
}

export default function CircleFeed({ circle, membership, currentUserId, initialPosts, resources, templates, ownJourneys: initialOwnJourneys, routines, ownRoutines: initialOwnRoutines, routineCheckins }) {
  const router = useRouter();
  const [posts] = useState(initialPosts);
  const [tab, setTab] = useState('feed');
  const [ownJourneys, setOwnJourneys] = useState(initialOwnJourneys);
  const [ownRoutines, setOwnRoutines] = useState(initialOwnRoutines);
  const [checkins, setCheckins] = useState(routineCheckins);
  const [leaving, setLeaving] = useState(false);
  const canManage = ['owner','admin'].includes(membership.role);
  const canModerate = canManage || membership.role === 'moderator';
  async function leave() {
    if (membership.role === 'owner' || leaving || !window.confirm('Sair deste Círculo? Você perderá o acesso imediato ao conteúdo privado.')) return;
    setLeaving(true);
    const response = await fetch('/api/circles/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'leave', circle_id: circle.id }) });
    if (response.ok) { router.push('/circulos'); router.refresh(); } else setLeaving(false);
  }
  async function joinJourney(templateId) {
    const response = await fetch('/api/circles/journeys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'join', circle_id: circle.id, template_id: templateId }) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setOwnJourneys((current) => [...current, data.journey]);
  }
  async function joinRoutine(routineId) {
    const response = await fetch('/api/circles/routines', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'join', circle_id: circle.id, routine_id: routineId }) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setOwnRoutines((current) => [...current, data.membership]);
  }
  async function routineCheckin(routineId) {
    const today = new Date().toISOString().slice(0, 10);
    const response = await fetch('/api/circles/routines', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'checkin', circle_id: circle.id, routine_id: routineId, checkin_date: today }) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setCheckins((current) => [data.checkin, ...current]);
  }
  return <>
    <section className="circle-hero" style={circle.cover_url ? { backgroundImage: `linear-gradient(180deg,rgba(13,18,40,.05),rgba(13,18,40,.72)),url(${circle.cover_url})` } : undefined}>
      <span className="circle-private-pill">▣ Círculo privado</span><h1>{circle.name}</h1><p>{circle.description || 'Um espaço de confiança dentro do ONE.'}</p>
      <footer><span>{ROLE_LABEL[membership.role]}</span>{canManage && <a href={`/circulos/${circle.slug}/gerenciar`}>Gerenciar</a>}</footer>
    </section>
    {circle.welcome_message && <aside className="circle-welcome"><span aria-hidden="true">Ü</span><div><b>Boas-vindas</b><p>{circle.welcome_message}</p></div></aside>}
    <nav className="circle-tabs circle-section-tabs" aria-label="Conteúdo do Círculo">
      {[['feed','Mural'],['journeys','Jornadas'],['routines','Rotinas'],['resources','Recursos']].map(([value,label]) => <button type="button" key={value} className={tab === value ? 'on' : ''} onClick={() => setTab(value)}>{label}</button>)}
    </nav>

    {tab === 'feed' && <section className="circle-feed-list">
      <a className="circle-compose-cta" href={`/circulos/publicar?circle=${encodeURIComponent(circle.slug)}`}><span>+</span><div><b>Compartilhar neste Círculo</b><p>Este conteúdo ficará somente aqui.</p></div><i aria-hidden="true">›</i></a>
      {posts.length === 0 ? <div className="circle-empty"><b>O mural está começando.</b><p>Quando alguém publicar, o conteúdo aparecerá somente para os membros.</p></div> : posts.map((post) => <PostCard key={post.id} initial={post} currentUserId={currentUserId} canModerate={canModerate} />)}
    </section>}

    {tab === 'journeys' && <section className="circle-content-list">
      {templates.length === 0 ? <div className="circle-empty"><b>Nenhuma jornada proposta.</b><p>Administradores podem criar jornadas exclusivas para o Círculo.</p></div> : templates.map((item) => {
        const mine = ownJourneys.find((journey) => journey.template_id === item.id);
        return <article className="circle-content-card" key={item.id}>{item.cover_url && <img src={item.cover_url} alt="" />}<div><span>Jornada do Círculo</span><h2>{item.title}</h2><p>{item.description || item.objective}</p><small>{item.total_days} dias{mine ? ` · Dia ${mine.current_day}` : ''}</small>{!mine && <button className="circle-inline-button" type="button" onClick={() => joinJourney(item.id)}>Começar esta jornada</button>}</div></article>;
      })}
    </section>}

    {tab === 'routines' && <section className="circle-content-list">
      {routines.length === 0 ? <div className="circle-empty"><b>Nenhuma rotina proposta.</b><p>Rotinas exclusivas do Círculo aparecerão aqui.</p></div> : routines.map((item) => {
        const mine = ownRoutines.find((entry) => entry.routine_id === item.id && entry.status === 'active');
        const checkedToday = checkins.some((entry) => entry.routine_id === item.id && entry.checkin_date === new Date().toISOString().slice(0, 10));
        return <article className="circle-routine-card" key={item.id}><span aria-hidden="true">↻</span><div><b>{item.title}</b><p>{item.description}</p></div>{mine ? <button type="button" disabled={checkedToday} onClick={() => routineCheckin(item.id)}>{checkedToday ? 'Feito hoje ✓' : 'Marcar como feito'}</button> : <button type="button" onClick={() => joinRoutine(item.id)}>Participar</button>}</article>;
      })}
    </section>}

    {tab === 'resources' && <section className="circle-content-list">
      {resources.length === 0 ? <div className="circle-empty"><b>Nenhum recurso publicado.</b><p>Materiais do Círculo aparecerão aqui.</p></div> : resources.map((item) => <a className="circle-resource" key={item.id} href={item.storage_url || item.url || '#'} target="_blank" rel="noreferrer"><span aria-hidden="true">□</span><div><b>{item.title}</b><p>{item.description}</p></div><i aria-hidden="true">›</i></a>)}
    </section>}
    {membership.role !== 'owner' && <button type="button" className="circle-leave" onClick={leave} disabled={leaving}>{leaving ? 'Saindo…' : 'Sair do Círculo'}</button>}
  </>;
}
