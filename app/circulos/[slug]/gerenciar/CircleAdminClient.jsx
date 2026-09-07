'use client';
import { useState } from 'react';

const ROLE_LABEL = { owner: 'Responsável', admin: 'Administrador', moderator: 'Moderador', member: 'Membro' };

export default function CircleAdminClient({ circle, actorRole, initialMembers, initialInvites, currentRules, reports, audit }) {
  const [tab, setTab] = useState('members');
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copyState, setCopyState] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState({ name: circle.name, description: circle.description || '', welcome_message: circle.welcome_message || '' });
  const [settings, setSettings] = useState(circle.settings || {});
  const [rulesText, setRulesText] = useState((currentRules.rules || []).join('\n'));
  const [contentKind, setContentKind] = useState('journey');
  const [content, setContent] = useState({ title: '', description: '', objective: '', total_days: 30, url: '' });

  async function createInvite() {
    if (busy) return; setBusy(true); setMessage(''); setCopyState('');
    const response = await fetch('/api/circles/invites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ circle_id: circle.id, expires_in_days: 7, max_uses: 1 }) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setInviteUrl(data.invite_url);
      setInvites((current) => [{ id: data.invite_id, status: 'pending', expires_at: data.expires_at, max_uses: 1, uses: 0, created_at: new Date().toISOString() }, ...current]);
    } else setMessage('Não foi possível criar o convite.');
    setBusy(false);
  }
  async function copyInvite() {
    if (!inviteUrl) return;
    try { await navigator.clipboard.writeText(inviteUrl); setCopyState('Link copiado'); }
    catch { setCopyState('Selecione e copie o link'); }
  }
  async function memberAction(userId, action, role) {
    const response = await fetch('/api/circles/members', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ circle_id: circle.id, user_id: userId, action, role }) });
    if (!response.ok) { setMessage('Esta alteração não foi permitida.'); return; }
    setMembers((current) => current.map((item) => item.user_id !== userId ? item : action === 'set_role' ? { ...item, role } : { ...item, status: action === 'suspend' ? 'suspended' : action === 'restore' ? 'active' : action === 'block' ? 'blocked' : 'removed' }));
    setMessage('Alteração salva.');
  }
  async function save(action, payload) {
    setBusy(true); setMessage('');
    const response = await fetch('/api/circles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ circle_id: circle.id, action, ...payload }) });
    setMessage(response.ok ? 'Alterações salvas.' : 'Não foi possível salvar estas alterações.'); setBusy(false);
  }
  async function createContent(event) {
    event.preventDefault();
    if (!content.title.trim() || busy) return;
    setBusy(true); setMessage('');
    const endpoint = contentKind === 'journey' ? '/api/circles/journeys' : contentKind === 'routine' ? '/api/circles/routines' : '/api/circles/resources';
    const payload = contentKind === 'journey'
      ? { action: 'create', circle_id: circle.id, title: content.title, description: content.description, objective: content.objective, total_days: content.total_days }
      : contentKind === 'routine'
        ? { action: 'create', circle_id: circle.id, title: content.title, description: content.description, schedule: { cadence: 'daily' } }
        : { circle_id: circle.id, title: content.title, description: content.description, kind: content.url ? 'link' : 'text', url: content.url || null };
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setMessage(response.ok ? 'Conteúdo privado criado.' : 'Não foi possível criar este conteúdo.');
    if (response.ok) setContent({ title: '', description: '', objective: '', total_days: 30, url: '' });
    setBusy(false);
  }
  const activeMembers = members.filter((item) => item.status === 'active');
  return <>
    <header className="circle-admin-head"><p className="circle-eyebrow">Administração privada</p><h1>{circle.name}</h1><p>Gerencie participantes, convites, regras e permissões sem alterar o restante do ONE.</p></header>
    <nav className="circle-tabs circle-admin-tabs" aria-label="Administração do Círculo">
      {[['members','Pessoas'],['invites','Convites'],['content','Conteúdo'],['settings','Configurações'],['safety','Segurança']].map(([value,label]) => <button type="button" className={tab === value ? 'on' : ''} onClick={() => setTab(value)} key={value}>{label}</button>)}
    </nav>
    {message && <p className="circle-save-message" role="status">{message}</p>}

    {tab === 'members' && <section className="circle-admin-section"><div className="circle-admin-title"><div><h2>Participantes</h2><p>{activeMembers.length} com acesso ativo</p></div></div>
      <div className="circle-member-list">{members.map((item) => <article className="circle-member" key={item.id}><span className="circle-avatar" style={{ background: item.profiles?.avatar_color || 'var(--sage)' }}>{item.profiles?.avatar_url ? <img src={item.profiles.avatar_url} alt="" /> : (item.profiles?.name || '?')[0]}</span><div><b>{item.display_name || item.profiles?.name || 'Membro'}</b><span>{ROLE_LABEL[item.role]} · {item.status === 'active' ? 'Ativo' : item.status}</span></div>{item.role !== 'owner' && <details><summary aria-label="Gerenciar participante">•••</summary><div>{item.status === 'active' ? <>{actorRole === 'owner' && <>{item.role !== 'admin' && <button onClick={() => memberAction(item.user_id, 'set_role', 'admin')}>Tornar administrador</button>}{item.role !== 'moderator' && <button onClick={() => memberAction(item.user_id, 'set_role', 'moderator')}>Tornar moderador</button>}{item.role !== 'member' && <button onClick={() => memberAction(item.user_id, 'set_role', 'member')}>Tornar membro</button>}</>}<button onClick={() => memberAction(item.user_id, 'suspend')}>Suspender acesso</button><button className="danger" onClick={() => memberAction(item.user_id, 'remove')}>Remover acesso</button>{actorRole === 'owner' && <button className="danger" onClick={() => memberAction(item.user_id, 'block')}>Bloquear retorno</button>}</> : item.status === 'suspended' && <button onClick={() => memberAction(item.user_id, 'restore')}>Reativar acesso</button>}</div></details>}</article>)}</div>
    </section>}

    {tab === 'invites' && <section className="circle-admin-section"><h2>Convites privados</h2><p>O link dá acesso a uma única pessoa, expira em 7 dias e exige aceite das regras.</p><button className="circle-primary" type="button" disabled={busy} onClick={createInvite}>+ Criar convite</button>
      {inviteUrl && <div className="circle-invite-copy"><input readOnly value={inviteUrl} aria-label="Link de convite" /><button type="button" onClick={copyInvite}>{copyState || 'Copiar link'}</button></div>}
      {copyState && <p className="circle-copy-feedback" role="status">✓ {copyState}</p>}
      <div className="circle-invite-history">{invites.map((item) => <div key={item.id}><span>Convite {item.status === 'pending' ? 'ativo' : item.status}</span><small>Expira em {new Intl.DateTimeFormat('pt-BR').format(new Date(item.expires_at))}</small></div>)}</div>
    </section>}

    {tab === 'content' && <section className="circle-admin-section circle-settings-form"><h2>Conteúdo exclusivo</h2><p>Crie uma jornada, rotina ou material que existirá somente dentro deste Círculo.</p>
      <form className="circle-content-create" onSubmit={createContent}>
        <div className="circle-kind-picker">{[['journey','Jornada'],['routine','Rotina'],['resource','Material']].map(([value,label]) => <button type="button" className={contentKind === value ? 'on' : ''} onClick={() => setContentKind(value)} key={value}>{label}</button>)}</div>
        <label>Título<input value={content.title} onChange={(e) => setContent((current) => ({ ...current, title: e.target.value }))} required /></label>
        <label>Descrição<textarea rows={4} value={content.description} onChange={(e) => setContent((current) => ({ ...current, description: e.target.value }))} /></label>
        {contentKind === 'journey' && <><label>Objetivo<textarea rows={3} value={content.objective} onChange={(e) => setContent((current) => ({ ...current, objective: e.target.value }))} /></label><label>Duração em dias<input type="number" min="1" max="366" value={content.total_days} onChange={(e) => setContent((current) => ({ ...current, total_days: e.target.value }))} /></label></>}
        {contentKind === 'resource' && <label>Link opcional<input type="url" value={content.url} onChange={(e) => setContent((current) => ({ ...current, url: e.target.value }))} placeholder="https://" /></label>}
        <p className="circle-private-reminder">▣ Este conteúdo não será exibido no ONE público.</p>
        <button className="circle-primary" disabled={busy}>{busy ? 'Criando…' : `Criar ${contentKind === 'journey' ? 'jornada' : contentKind === 'routine' ? 'rotina' : 'material'}`}</button>
      </form>
    </section>}

    {tab === 'settings' && <section className="circle-admin-section circle-settings-form"><h2>Identidade e permissões</h2>
      <label>Nome<input value={details.name} onChange={(e) => setDetails((current) => ({ ...current, name: e.target.value }))} /></label>
      <label>Descrição<textarea rows={4} value={details.description} onChange={(e) => setDetails((current) => ({ ...current, description: e.target.value }))} /></label>
      <label>Boas-vindas<textarea rows={4} value={details.welcome_message} onChange={(e) => setDetails((current) => ({ ...current, welcome_message: e.target.value }))} /></label>
      <button className="circle-primary" type="button" disabled={busy} onClick={() => save('details', details)}>Salvar identidade</button>
      <hr />
      <label>Quem pode publicar?<select value={settings.who_can_post || 'all'} onChange={(e) => setSettings((current) => ({ ...current, who_can_post: e.target.value }))}><option value="all">Todos</option><option value="moderators">Administradores e moderadores</option><option value="admins">Somente administradores</option></select></label>
      <label>Quem pode comentar?<select value={settings.who_can_comment || 'all'} onChange={(e) => setSettings((current) => ({ ...current, who_can_comment: e.target.value }))}><option value="all">Todos</option><option value="admins">Somente administradores</option><option value="disabled">Desativado</option></select></label>
      {[['show_member_list','Mostrar lista completa de participantes'],['allow_images','Permitir imagens'],['allow_videos','Permitir vídeos'],['allow_journeys','Permitir jornadas'],['allow_reactions','Permitir reações']].map(([key,label]) => <label className="circle-switch" key={key}><span>{label}</span><input type="checkbox" checked={settings[key] === true} onChange={(e) => setSettings((current) => ({ ...current, [key]: e.target.checked }))} /></label>)}
      <button className="circle-primary" type="button" disabled={busy} onClick={() => save('settings', { settings })}>Salvar permissões</button>
    </section>}

    {tab === 'safety' && <section className="circle-admin-section circle-safety"><h2>Regras e segurança</h2><p>Nova versão atual: {currentRules.version}. As regras permanecem visíveis somente aos membros e convidados válidos.</p><label>Uma regra por linha<textarea rows={8} value={rulesText} onChange={(e) => setRulesText(e.target.value)} /></label><button className="circle-primary" type="button" disabled={busy} onClick={() => save('rules', { rules: rulesText.split('\n').map((item) => item.trim()).filter(Boolean), requires_reaccept: false })}>Publicar nova versão</button>
      <h3>Denúncias internas</h3>{reports.length === 0 ? <p>Nenhuma denúncia aberta.</p> : reports.map((item) => <article className="circle-audit-item" key={item.id}><b>{item.reason}</b><span>{item.target_type} · {item.status}</span><p>{item.details}</p></article>)}
      <h3>Registro de administração</h3>{audit.slice(0, 15).map((item) => <div className="circle-audit-row" key={item.id}><span>{item.action.replaceAll('_', ' ')}</span><time>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.created_at))}</time></div>)}
    </section>}
  </>;
}
