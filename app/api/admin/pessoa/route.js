import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { clienteServico, ehDono } from '../../../../lib/dono';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// SUSPENDER · REATIVAR · EXCLUIR
//
// Três travas, e cada uma existe por um motivo diferente:
//
//   1. Só o dono chega aqui.
//   2. Excluir exige digitar o @ da pessoa. Não é burocracia:
//      é o intervalo entre o impulso e o irreversível. Botão de
//      apagar conta ao lado de botão de suspender, sem fricção,
//      é acidente esperando data marcada.
//   3. Nunca em lote. Uma pessoa por chamada, sempre.
//
// E o dono não pode excluir a si mesmo — perder o próprio acesso
// ao painel é o único erro daqui que não tem conserto pela tela.
// ============================================================
export async function POST(req) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!ehDono(user)) return NextResponse.json({ error: 'sem permissao' }, { status: 403 });

  const admin = clienteServico();
  if (!admin) return NextResponse.json({ error: 'sem chave de servico' }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const acao = String(body.acao || '');
  const id = String(body.id || '');
  if (!id) return NextResponse.json({ error: 'sem id' }, { status: 400 });
  if (id === user.id && ['suspender', 'reativar', 'excluir'].includes(acao)) {
    return NextResponse.json({ error: 'voce mesmo' }, { status: 400 });
  }

  const { data: alvo } = await admin.from('profiles')
    .select('id, handle, name, suspenso_em, is_professional_verified, professional_title').eq('id', id).maybeSingle();
  if (!alvo) return NextResponse.json({ error: 'nao encontrado' }, { status: 404 });

  const registrar = async (motivo) => {
    try {
      await admin.from('admin_log').insert({
        admin_id: user.id, acao, alvo_id: alvo.id,
        alvo_handle: alvo.handle, motivo: motivo || null,
      });
    } catch { }
  };

  if (acao === 'aprovar_verificacao_profissional' || acao === 'rejeitar_verificacao_profissional') {
    const requestId = String(body.request_id || '');
    if (!requestId) return NextResponse.json({ error: 'pedido_invalido' }, { status: 400 });
    const { data: verificationRequest, error: requestError } = await admin
      .from('professional_verification_requests')
      .select('id, user_id, status')
      .eq('id', requestId)
      .maybeSingle();
    if (requestError || verificationRequest?.user_id !== id || verificationRequest?.status !== 'pending') {
      return NextResponse.json({ error: 'pedido_invalido' }, { status: 400 });
    }
    const aprovado = acao === 'aprovar_verificacao_profissional';
    const { data, error } = await admin.rpc('review_professional_verification', {
      p_request_id: requestId,
      p_reviewer_id: user.id,
      p_approved: aprovado,
      p_review_note: String(body.motivo || '').slice(0, 1000),
    });
    const reviewed = Array.isArray(data) ? data[0] : data;
    if (error || !reviewed || reviewed.user_id !== id) {
      console.error('[admin/pessoa] professional request review failed', { code: error?.code, message: error?.message });
      return NextResponse.json({ error: 'pedido_invalido' }, { status: 500 });
    }
    await registrar(aprovado ? 'solicitação profissional aprovada' : 'solicitação profissional recusada');
    return NextResponse.json({ ok: true, estado: aprovado ? 'profissional_verificado' : 'solicitacao_recusada' });
  }

  // A criação de Círculos exige uma decisão explícita do dono do ONE.
  // O usuário nunca consegue conceder essa verificação a si mesmo via RLS.
  if (acao === 'verificar_profissional' || acao === 'remover_verificacao_profissional') {
    const verificado = acao === 'verificar_profissional';
    const { error } = await admin.from('profiles').update({
      is_professional_verified: verificado,
      professional_verified_at: verificado ? new Date().toISOString() : null,
      professional_verified_by: verificado ? user.id : null,
      professional_title: verificado ? alvo.professional_title : null,
    }).eq('id', id);
    if (error) {
      console.error('[admin/pessoa] professional verification failed', { code: error.code, message: error.message });
      return NextResponse.json({ error: 'db' }, { status: 500 });
    }
    await registrar(verificado ? 'perfil profissional verificado para Círculos' : 'verificação profissional removida');
    return NextResponse.json({ ok: true, estado: verificado ? 'profissional_verificado' : 'verificacao_removida' });
  }

  // ---------- suspender ----------
  if (acao === 'suspender') {
    const motivo = String(body.motivo || '').slice(0, 300);
    const { error } = await admin.from('profiles').update({
      suspenso_em: new Date().toISOString(),
      suspenso_por: user.id,
      suspenso_motivo: motivo || null,
    }).eq('id', id);
    if (error) return NextResponse.json({ error: 'db', detalhe: error.message }, { status: 500 });
    await registrar(motivo);
    return NextResponse.json({ ok: true, estado: 'suspenso' });
  }

  // ---------- reativar ----------
  if (acao === 'reativar') {
    const { error } = await admin.from('profiles').update({
      suspenso_em: null, suspenso_por: null, suspenso_motivo: null,
    }).eq('id', id);
    if (error) return NextResponse.json({ error: 'db', detalhe: error.message }, { status: 500 });
    await registrar(null);
    return NextResponse.json({ ok: true, estado: 'ativo' });
  }

  // ---------- excluir ----------
  if (acao === 'excluir') {
    // A confirmação tem que bater com o @ da pessoa. Quem digitou
    // olhou para o nome antes de apagar.
    const conf = String(body.confirmacao || '').trim().toLowerCase();
    const esperado = String(alvo.handle || '').trim().toLowerCase();
    if (!esperado || conf !== esperado) {
      return NextResponse.json({ error: 'confirmacao', esperado: alvo.handle }, { status: 400 });
    }

    // Registra ANTES de apagar. Depois do delete o handle não
    // existe mais em lugar nenhum, e o registro ficaria sem nome.
    await registrar(String(body.motivo || '').slice(0, 300));

    // Tabelas sem vínculo em cascata, limpas à mão.
    for (const t of ['notifications', 'envelopes', 'reports', 'events']) {
      try {
        const col = t === 'notifications' ? 'recipient_id'
                  : t === 'reports' ? 'reporter_id' : 'user_id';
        await admin.from(t).delete().eq(col, id);
      } catch { }
    }

    // auth.users cai por cascata sobre profiles e todo o resto.
    // Apagar o login é o que impede a pessoa de voltar a entrar —
    // apagar só o perfil deixaria uma conta órfã que recria tudo
    // no próximo acesso.
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      // sem o Admin API, ao menos o perfil sai (e leva o conteúdo junto)
      const { error: e2 } = await admin.from('profiles').delete().eq('id', id);
      if (e2) return NextResponse.json({ error: 'db', detalhe: e2.message }, { status: 500 });
      return NextResponse.json({ ok: true, estado: 'perfil apagado', aviso: 'o login continua existindo' });
    }
    return NextResponse.json({ ok: true, estado: 'excluido' });
  }

  return NextResponse.json({ error: 'acao desconhecida' }, { status: 400 });
}
