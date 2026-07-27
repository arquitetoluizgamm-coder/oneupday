import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { rateLimit } from '../../../lib/ratelimit';
import { locallyUnsafe, moderarTexto, reprocessarPendentes } from '../../../lib/moderacao';
import { clienteServico } from '../../../lib/dono';

export async function GET(req) {
  const url = new URL(req.url);
  const updateId = url.searchParams.get('updateId');
  const mediaId = url.searchParams.get('mediaId');
  const challengeId = url.searchParams.get('challengeId');
  const col = challengeId ? 'challenge_id' : mediaId ? 'media_id' : 'update_id';
  const val = challengeId || mediaId || updateId;
  if (!val) return NextResponse.json({ comments: [] });
  const supabase = createClient();
  const { data: comments } = await supabase.from('comments')
    .select('id, user_id, parent_id, body, created_at, eco, eco_tipo').eq(col, val)
    .eq('status', 'published').order('created_at', { ascending: true }).limit(50);
  const ids = [...new Set((comments || []).map(c => c.user_id).filter(Boolean))];
  const { data: profiles } = ids.length
    ? await supabase.from('profiles').select('id, name, avatar_url, avatar_color').in('id', ids)
    : { data: [] };
  const map = {}; (profiles || []).forEach(p => { map[p.id] = p; });
  return NextResponse.json({ comments: (comments || []).map(c => ({ ...c, author: map[c.user_id] || {} })) });
}

export async function POST(req) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });
  if (!rateLimit(`comment:${user.id}`, 20, 3600000)) return NextResponse.json({ error: 'rate' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const updateId = String(body.updateId || '');
  const mediaId = body.mediaId ? String(body.mediaId) : '';
  const challengeId = body.challengeId ? String(body.challengeId) : '';
  const col = challengeId ? 'challenge_id' : mediaId ? 'media_id' : 'update_id';
  const val = challengeId || mediaId || updateId;
  const text = String(body.text || '').trim();
  const parentId = body.parentId ? String(body.parentId) : null;
  if (!val || !text || text.length > 500) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  if (challengeId) {
    const { data: ch } = await supabase.from('challenges').select('id, status').eq('id', challengeId).maybeSingle();
    if (!ch || ch.status === 'declined') return NextResponse.json({ error: 'notfound' }, { status: 404 });
  } else if (mediaId) {
    const { data: m } = await supabase.from('media').select('user_id, visibility').eq('id', mediaId).maybeSingle();
    if (!m || (m.visibility === 'private' && m.user_id !== user.id)) return NextResponse.json({ error: 'notfound' }, { status: 404 });
  } else {
    const { data: update } = await supabase.from('updates').select('journey_id').eq('id', updateId).maybeSingle();
    if (!update) return NextResponse.json({ error: 'notfound' }, { status: 404 });
    const { data: journey } = await supabase.from('journeys').select('visibility, owner_id').eq('id', update.journey_id).maybeSingle();
    if (!journey || (journey.visibility !== 'public' && journey.owner_id !== user.id)) return NextResponse.json({ error: 'notfound' }, { status: 404 });
  }
  if (parentId) {
    const { data: parent } = await supabase.from('comments').select('id').eq('id', parentId).eq(col, val).eq('status', 'published').maybeSingle();
    if (!parent) return NextResponse.json({ error: 'invalid_parent' }, { status: 400 });
  }
  // a lista local pega ataque direto a outra pessoa e não depende de rede
  if (locallyUnsafe(text)) return NextResponse.json({ error: 'unsafe' }, { status: 422 });

  // Se a IA não conseguiu analisar, o comentário NÃO é recusado nem
  // publicado: entra como pendente. Ele existe, o autor sabe, e some
  // da tela pública até ser revisto — a política de leitura do banco
  // só mostra o que está com status 'published'.
  const veredito = await moderarTexto(text);
  if (veredito === 'inseguro') return NextResponse.json({ error: 'unsafe' }, { status: 422 });
  const status = veredito === 'indisponivel' ? 'pending' : 'published';

  const { data: comment, error } = await supabase.from('comments').insert({
    [col]: val, user_id: user.id, parent_id: parentId, body: text, status,
  }).select('id, user_id, parent_id, body, created_at').single();
  if (error) return NextResponse.json({ error: 'save' }, { status: 500 });

  // ============================================================
  // A FILA SE ESVAZIA SOZINHA
  //
  // Se chegamos aqui com veredito 'ok', a IA acabou de responder —
  // ou seja, ela está de pé AGORA. Este é o melhor momento possível
  // para reprocessar o que ficou preso durante a queda, e é de graça:
  // já estamos numa requisição quente, com a rede aquecida.
  //
  // Três por vez, em paralelo (~300ms). Não trava o envio de quem
  // está escrevendo, e uma indisponibilidade curta se resolve sem
  // ninguém precisar abrir a fila de revisão.
  // ============================================================
  if (veredito === 'ok') {
    try { await reprocessarPendentes(clienteServico(), 3); } catch { }
  }

  return NextResponse.json({ comment, pendente: status === 'pending' });
}
