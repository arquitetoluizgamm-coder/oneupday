import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { sendPush, pushReady } from '../../../../lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Diagnóstico do push. Abra logado: https://oneupday.app/api/push/debug
export async function GET() {
  const out = { passos: {} };

  // 1. variáveis de ambiente
  const pub = process.env.VAPID_PUBLIC_KEY || '';
  const pubPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  const priv = process.env.VAPID_PRIVATE_KEY || '';
  const subj = process.env.VAPID_SUBJECT || '';
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const cron = process.env.CRON_SECRET || '';
  out.passos['0_cron_secret'] = {
    CRON_SECRET: cron ? `ok (${cron.length} caracteres)` : 'FALTANDO',
    tamanho_esperado: '32 caracteres',
    tem_espaco_ou_quebra_de_linha: cron !== cron.trim() ? 'SIM — apague os espacos/quebras no comeco ou fim' : 'nao',
    primeiros_4: cron ? cron.slice(0, 4) : '-',
    ultimos_4: cron ? cron.slice(-4) : '-',
    dica: 'Compare com o valor do SQL: deve comecar com JVno e terminar com vRZX',
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

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    out.passos['2_login'] = 'NAO LOGADO — abra esta pagina logado no app';
    return NextResponse.json(out);
  }
  out.passos['2_login'] = 'ok';

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
