import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { sendPush, pushReady } from '../../../../lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// DIAGNÓSTICO DO PUSH — só o dono abre.
//
// Antes bastava estar logado, e a resposta trazia pedaços do
// CRON_SECRET (primeiros e últimos caracteres) mais uma dica com
// o começo e o fim do valor escrito à mão no código. Qualquer
// testador com conta conseguia ler. Agora: mesma proteção por
// e-mail que a /metricas, e nenhum pedaço de chave na resposta.
// ============================================================
const DONO = 'arquitetoluizgamm@gmail.com';

export async function GET() {
  const out = { passos: {} };

  const supabaseGuard = createClient();
  const { data: { user: dono } } = await supabaseGuard.auth.getUser();
  if (!dono) return NextResponse.json({ error: 'nao-logado' }, { status: 401 });
  if ((dono.email || '').toLowerCase() !== DONO) {
    return NextResponse.json({ error: 'nao-encontrado' }, { status: 404 });
  }

  // 1. variáveis de ambiente
  const pub = process.env.VAPID_PUBLIC_KEY || '';
  const pubPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  const priv = process.env.VAPID_PRIVATE_KEY || '';
  const subj = process.env.VAPID_SUBJECT || '';
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const cron = process.env.CRON_SECRET || '';
  // impressão digital: confere se bate com o banco sem revelar o valor
  // md5 porque do lado do banco md5() é nativa — o sha256 exigiria o
  // pgcrypto, que não está no caminho de busca do editor do Supabase.
  // Aqui serve só para comparar dois valores, não para proteger nada.
  const digital = cron
    ? crypto.createHash('md5').update(cron).digest('hex').slice(0, 12)
    : '-';
  out.passos['0_cron_secret'] = {
    CRON_SECRET: cron ? `ok (${cron.length} caracteres)` : 'FALTANDO',
    tamanho_esperado: '32 caracteres',
    tem_espaco_ou_quebra_de_linha: cron !== cron.trim() ? 'SIM — apague os espacos/quebras no comeco ou fim' : 'nao',
    impressao_digital: digital,
    como_comparar: 'Rode no Supabase: select left(md5(SEU_VALOR),12); os dois tem que dar igual.',
  };
  out.passos['1_variaveis'] = {
    VAPID_PUBLIC_KEY: pub ? `ok (${pub.length} caracteres)` : 'FALTANDO',
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: pubPublic ? `ok (${pubPublic.length} caracteres)` : 'FALTANDO',
    as_duas_sao_iguais: pub && pubPublic ? (pub === pubPublic ? 'sim (correto)' : 'NAO — precisam ser IDÊNTICAS') : 'nao da pra comparar',
    VAPID_PRIVATE_KEY: priv ? `ok (${priv.length} caracteres)` : 'FALTANDO',
    VAPID_SUBJECT: subj || 'FALTANDO',
    SUPABASE_SERVICE_ROLE_KEY: svc ? `ok (${svc.length} caracteres, começa com ${svc.slice(0, 10)}…)` : 'FALTANDO (o cron nao roda sem ela)',
    tamanho_esperado_publica: '87 ou 88 caracteres',
    tamanho_esperado_privada: '42 ou 43 caracteres',
  };

  const supabase = supabaseGuard;
  const user = dono;
  out.passos['2_login'] = 'ok (dono)';

  // 3. tabela push_subs existe? tem inscricao deste usuario?
  const r = await supabase.from('push_subs').select('id, endpoint, created_at').eq('user_id', user.id);
  if (r.error) {
    out.passos['3_tabela_push_subs'] = {
      PROBLEMA: 'erro ao ler a tabela',
      detalhe: r.error.message,
      provavel_causa: /does not exist|schema cache/i.test(r.error.message)
        ? 'A TABELA NAO EXISTE — rode o arquivo supabase/push.sql no Supabase'
        : 'permissao (RLS)',
    };
    return NextResponse.json(out);
  }
  // 3b. quem sou eu e quais notificacoes chegaram pra mim
  try {
    const { data: me } = await supabase.from('profiles').select('name, handle, push_on, notif_paused').eq('id', user.id).maybeSingle();
    const { data: notifs } = await supabase.from('notifications')
      .select('type, actor_id, pushed, read, created_at')
      .eq('recipient_id', user.id).order('created_at', { ascending: false }).limit(8);
    const pend = (notifs || []).filter((n) => n.pushed === false).length;
    out.passos['3b_quem_sou_eu'] = {
      conta_logada_agora: `${me?.name || '?'} (${me?.handle || '?'})`,
      ATENCAO: 'As notificacoes chegam para o DONO do post. Se voce curtiu com esta mesma conta, nada e enviado (ninguem se notifica sozinho). O celular precisa estar logado na conta que RECEBE.',
      push_ligado_no_perfil: me?.push_on === false ? 'NAO — reative no Perfil' : 'sim',
      notificacoes_pausadas: me?.notif_paused ? 'SIM — desative a pausa nas notificacoes' : 'nao',
      minhas_ultimas_notificacoes: (notifs || []).map((n) => ({
        tipo: n.type, enviada_por_push: n.pushed ? 'sim' : 'ainda nao', quando: n.created_at,
      })),
      total_esperando_envio: pend,
      LEITURA: (notifs || []).length === 0
        ? 'NENHUMA NOTIFICACAO CHEGOU PARA ESTA CONTA. Ou a curtida veio desta mesma conta, ou foi em post de outra pessoa.'
        : pend > 0
          ? 'Existem notificacoes esperando. O disparador ainda nao rodou ou falhou.'
          : 'As notificacoes ja foram processadas para push.',
    };
  } catch (e) {}

  const subs = r.data || [];
  out.passos['3_inscricoes_deste_aparelho'] = {
    total: subs.length,
    PROBLEMA: subs.length === 0
      ? 'NENHUMA INSCRICAO — o botao Ativar nao chegou a salvar. Ative de novo no Perfil.'
      : null,
    servico: subs.map((s) => {
      const h = (() => { try { return new URL(s.endpoint).host; } catch { return '?'; } })();
      return { servico: h, criada: s.created_at };
    }),
  };
  if (!subs.length) return NextResponse.json(out);

  // 4. tenta enviar de verdade e mostra a resposta do servico de push
  if (!pushReady()) {
    out.passos['4_envio'] = 'NAO TENTADO — faltam as chaves VAPID no servidor';
    return NextResponse.json(out);
  }
  const results = [];
  for (const s of subs) {
    const full = await supabase.from('push_subs').select('*').eq('id', s.id).maybeSingle();
    const res = await sendPush(full.data, { title: 'Upi', body: 'Teste de diagnóstico.', url: '/home', tag: 'oud-debug' });
    let leitura = 'desconhecido';
    if (res.status === 201 || res.status === 200) leitura = 'ACEITO — a notificacao foi entregue ao servico';
    else if (res.status === 400) leitura = 'REQUISICAO INVALIDA — provavel erro na criptografia ou no cabecalho';
    else if (res.status === 401 || res.status === 403) leitura = 'NAO AUTORIZADO — as chaves VAPID nao batem (a publica salva no aparelho e diferente da que o servidor usa). Desative e ative as notificacoes de novo.';
    else if (res.status === 404 || res.status === 410) leitura = 'INSCRICAO EXPIRADA — ative as notificacoes de novo';
    else if (res.status === 413) leitura = 'PAYLOAD GRANDE DEMAIS';
    else if (res.status === 0) leitura = 'FALHA DE REDE ao falar com o servico de push';
    results.push({ status_http: res.status, leitura });
  }
  out.passos['4_envio'] = results;
  out.RESULTADO = results.some((x) => x.status_http === 201 || x.status_http === 200)
    ? 'Push enviado com sucesso. Se nao apareceu no aparelho, verifique se as notificacoes do app estao liberadas nas configuracoes do Android.'
    : 'O envio falhou. Veja a leitura acima.';

  return NextResponse.json(out);
}
