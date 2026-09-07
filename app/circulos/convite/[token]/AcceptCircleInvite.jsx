'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AcceptCircleInvite({ token, circle, rules, owner }) {
  const router = useRouter();
  const [acceptRules, setAcceptRules] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function accept() {
    if (!acceptRules || !acceptPrivacy || busy) return;
    setBusy(true); setError('');
    const response = await fetch('/api/circles/invites/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, accept_rules: true, accept_privacy: true, display_name: displayName }) });
    if (response.ok) { router.push(`/circulos/${circle.slug}`); router.refresh(); return; }
    setError('Não foi possível aceitar o convite. Ele pode ter expirado ou sido cancelado.'); setBusy(false);
  }
  return <section className="circle-invite-card">
    <header><span className="circle-private-pill">▣ Convite privado</span><p className="circle-eyebrow">Você foi convidado</p><h1>{circle.name}</h1><p>{circle.description}</p></header>
    <div className="circle-invite-owner"><span className="circle-avatar" style={{ background: owner?.avatar_color || 'var(--sage)' }}>{owner?.avatar_url ? <img src={owner.avatar_url} alt="" /> : (owner?.name || '?')[0]}</span><div><small>Responsável pelo Círculo</small><b>{owner?.name || 'Profissional verificado'}</b></div></div>
    <aside className="circle-privacy-card"><span aria-hidden="true">▣</span><div><b>O que acontece aqui fica aqui</b><p>Este Círculo não aparece em buscas públicas. Publicações, comentários e membros ficam separados do feed e do perfil público.</p></div></aside>
    <div className="circle-rules"><h2>Regras do Círculo</h2><ol>{(rules.rules || []).map((rule, index) => <li key={`${index}-${rule}`}>{rule}</li>)}</ol></div>
    <label>Como quer aparecer neste Círculo? <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} placeholder="Opcional — seu nome atual será usado" /></label>
    <label className="circle-consent"><input type="checkbox" checked={acceptRules} onChange={(e) => setAcceptRules(e.target.checked)} /><span>Li e aceito as regras deste Círculo.</span></label>
    <label className="circle-consent"><input type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} /><span>Entendo que o conteúdo é privado e não deve ser levado para fora sem autorização.</span></label>
    {error && <p className="circle-error" role="alert">{error}</p>}
    <button className="circle-primary" type="button" disabled={!acceptRules || !acceptPrivacy || busy} onClick={accept}>{busy ? 'Entrando…' : 'Aceitar e entrar no Círculo'}</button>
    <a className="circle-secondary" href="/circulos">Agora não</a>
  </section>;
}
