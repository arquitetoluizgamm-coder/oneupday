'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';

export default function CircleDestinationComposer({ userId, memberships, initialSlug }) {
  const router = useRouter();
  const initial = useMemo(() => memberships.find((item) => item.circles.slug === initialSlug)?.circle_id || memberships[0]?.circle_id || '', [memberships, initialSlug]);
  const [circleId, setCircleId] = useState(initial);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function publish(event) {
    event.preventDefault();
    if (!circleId || (!text.trim() && !file) || busy) return;
    setBusy(true); setError('');
    let mediaPath = null; let kind = 'text'; let mediaType = null;
    const supabase = createClient();
    if (file) {
      const allowed = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!allowed || file.size > 50 * 1024 * 1024) { setError('Use uma imagem ou vídeo de até 50 MB.'); setBusy(false); return; }
      kind = file.type.startsWith('video/') ? 'video' : 'image'; mediaType = kind;
      const ext = (file.name.split('.').pop() || (kind === 'video' ? 'mp4' : 'jpg')).replace(/[^a-z0-9]/gi, '').toLowerCase();
      mediaPath = `${circleId}/${userId}/${crypto.randomUUID()}.${ext}`;
      const upload = await supabase.storage.from('circle-media').upload(mediaPath, file, { upsert: false, contentType: file.type });
      if (upload.error) { setError('Não foi possível enviar a mídia privada.'); setBusy(false); return; }
    }
    const response = await fetch('/api/circles/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ circle_id: circleId, body: text, media_path: mediaPath, media_type: mediaType, kind }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (mediaPath) await supabase.storage.from('circle-media').remove([mediaPath]);
      setError('Você não tem permissão para publicar nesse Círculo.'); setBusy(false); return;
    }
    const selected = memberships.find((item) => item.circle_id === circleId);
    router.push(`/circulos/${selected?.circles.slug || ''}`); router.refresh();
  }

  return <section className="circle-compose-page">
    <header><p className="circle-eyebrow">Escolha um único destino</p><h1>Onde você quer publicar?</h1><p>Você pode continuar publicando normalmente no ONE ou manter este conteúdo somente dentro de um Círculo.</p></header>
    <div className="circle-destination-grid">
      <a className="circle-destination" href="/home"><span aria-hidden="true">◎</span><b>Publicar no ONE</b><p>Use o fluxo normal e as opções públicas, seguidores ou somente eu.</p></a>
      <div className="circle-destination on"><span aria-hidden="true">▣</span><b>Somente em um Círculo</b><p>Visível exclusivamente para membros autorizados.</p></div>
    </div>
    {memberships.length === 0 ? <div className="circle-empty"><b>Você ainda não participa de um Círculo.</b><p>Quando aceitar um convite, poderá publicar aqui.</p></div> : <form className="circle-post-form" onSubmit={publish}>
      <label>Escolha seu Círculo<select required value={circleId} onChange={(e) => setCircleId(e.target.value)}>{memberships.map((item) => <option value={item.circle_id} key={item.circle_id}>{item.circles.name}</option>)}</select></label>
      <label>O que fez sentido hoje?<textarea rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder="Compartilhe no seu tempo…" /></label>
      <label>Mídia opcional<input type="file" accept="image/*,video/mp4,video/webm" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
      <p className="circle-private-reminder">▣ Este conteúdo não aparecerá no feed público nem no perfil público.</p>
      {error && <p className="circle-error" role="alert">{error}</p>}
      <button className="circle-primary" disabled={busy || (!text.trim() && !file)}>{busy ? 'Publicando…' : 'Publicar no Círculo'}</button>
    </form>}
  </section>;
}
