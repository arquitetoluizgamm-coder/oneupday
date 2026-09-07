'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';

const INITIAL_SETTINGS = {
  who_can_post: 'all', who_can_comment: 'all', member_interaction: true,
  private_messages: false, show_member_list: false, allow_images: true,
  allow_videos: true, allow_journeys: true, allow_reactions: true, allow_mentions: false,
};

export default function CreateCircleForm({ userId }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', welcome_message: '', rules: 'Respeite o tempo e os limites de cada pessoa.\nNão leve relatos de membros para fora do Círculo.\nConverse sem julgamentos ou comparações.', settings: INITIAL_SETTINGS });
  const [cover, setCover] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setting = (key, value) => setForm((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    const response = await fetch('/api/circles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, rules: form.rules.split('\n').map((item) => item.trim()).filter(Boolean) }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setError(result.error === 'verified_professional_required' ? 'Este perfil ainda não está verificado como profissional.' : 'Não foi possível criar o Círculo. Revise os campos e tente novamente.'); setBusy(false); return; }
    if (cover && result.circle?.id) {
      const ext = (cover.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${result.circle.id}/${userId}/cover-${crypto.randomUUID()}.${ext}`;
      const supabase = createClient();
      const upload = await supabase.storage.from('circle-media').upload(path, cover, { upsert: false, contentType: cover.type });
      if (!upload.error) {
        const saveCover = await fetch('/api/circles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ circle_id: result.circle.id, action: 'cover', cover_path: path }) });
        if (!saveCover.ok) await supabase.storage.from('circle-media').remove([path]);
      }
    }
    router.push(`/circulos/${result.circle.slug}`);
    router.refresh();
  }

  return <form className="circle-create-form" onSubmit={submit}>
    <header><span className="circle-verified-pill">✓ Perfil profissional verificado</span><p className="circle-eyebrow">Novo espaço de confiança</p><h1>Crie seu Círculo</h1><p>Defina um espaço acolhedor para acompanhar pessoas com privacidade e intenção.</p></header>
    <aside className="circle-privacy-card"><span aria-hidden="true">▣</span><div><b>Sempre privado e por convite</b><p>O Círculo não poderá ser convertido em público. Conteúdos, membros e conversas não aparecem no feed ou perfil público.</p></div></aside>
    <section className="circle-form-section"><h2><span>1</span> Identidade</h2>
      <label>Nome do Círculo <input required minLength={3} maxLength={80} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ex.: Caminhos com presença" /></label>
      <label>Descrição <textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Conte o propósito do espaço." /></label>
      <label>Capa opcional <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCover(e.target.files?.[0] || null)} /></label>
      <label>Mensagem de boas-vindas <textarea rows={4} value={form.welcome_message} onChange={(e) => update('welcome_message', e.target.value)} placeholder="Uma mensagem para quem chegar." /></label>
    </section>
    <section className="circle-form-section"><h2><span>2</span> Regras</h2><p className="circle-field-help">Uma regra por linha. Nenhuma opção vem aceita automaticamente para os convidados.</p><label>Regras do Círculo <textarea required rows={7} value={form.rules} onChange={(e) => update('rules', e.target.value)} /></label></section>
    <details className="circle-form-section circle-advanced"><summary>3 · Permissões dos membros</summary>
      <label>Quem pode publicar?<select value={form.settings.who_can_post} onChange={(e) => setting('who_can_post', e.target.value)}><option value="all">Todos</option><option value="moderators">Administrador e moderadores</option><option value="admins">Somente administradores</option></select></label>
      <label>Quem pode comentar?<select value={form.settings.who_can_comment} onChange={(e) => setting('who_can_comment', e.target.value)}><option value="all">Todos</option><option value="admins">Somente administradores</option><option value="disabled">Desativado</option></select></label>
      {[['member_interaction','Membros podem interagir entre si?'],['private_messages','Mensagens privadas entre membros?'],['show_member_list','Mostrar a lista completa de participantes?'],['allow_images','Permitir imagens?'],['allow_videos','Permitir vídeos?'],['allow_journeys','Permitir jornadas?'],['allow_reactions','Permitir reações?'],['allow_mentions','Permitir menções?']].map(([key,label]) => <label className="circle-switch" key={key}><span>{label}</span><input type="checkbox" checked={form.settings[key]} onChange={(e) => setting(key, e.target.checked)} /></label>)}
    </details>
    {error && <p className="circle-error" role="alert">{error}</p>}
    <button className="circle-primary" disabled={busy}>{busy ? 'Criando…' : 'Criar Círculo'}</button>
  </form>;
}
