import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { rateLimit } from '../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// A IA DO WIZARD DE CRIAÇÃO
//
// Uma rota, quatro momentos. Todos seguem a mesma regra, que é a
// única que importa aqui:
//
//   A PESSOA DÁ O CONTEÚDO. A IA DÁ A FORMA.
//
// Nenhum modo inventa fato, número, prazo ou motivo. Se a pessoa
// não disse, não entra. Um modelo bem-intencionado transforma
// "beber mais água" em "Beber 2 L por dia" — e ela nunca disse
// 2 L. É a diferença entre ajudar e falsificar.
//
//   'pergunta' → lê o rascunho e devolve UMA pergunta sobre o que
//                falta ser concreto. Não propõe nada.
//   'titulo'   → com a resposta dela, monta UM título.
//   'porque'   → devolve pontos de partida curtos para o motivo.
//                Aqui são opções mesmo, porque motivo é da pessoa
//                e ela precisa de um empurrão, não de um texto.
//   'pratica'  → transforma "correr" em algo observável.
//   'primeiro' → dá forma à resposta dela sobre o dia de hoje.
//
// Nada disso é obrigatório em lugar nenhum: sem chave da OpenAI a
// rota responde 503 e o wizard funciona inteiro com campo livre.
// ============================================================
const MODOS = new Set(['pergunta', 'titulo', 'porque', 'pratica', 'primeiro', 'organizar', 'sugestoes']);

export async function POST(req) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({}, { status: 503 });

  const { data: { user } } = await createClient().auth.getUser();
  if (!user) return NextResponse.json({}, { status: 401 });
  if (!rateLimit('titulo:' + user.id, 40, 3600000)) return NextResponse.json({}, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const modo = MODOS.has(body.modo) ? body.modo : (body.resposta ? 'titulo' : 'pergunta');
  const corte = (v, n) => String(v || '').trim().slice(0, n);

  const rascunho = corte(body.rascunho, 80);
  const resposta = corte(body.resposta, 200);
  const titulo = corte(body.titulo, 80);
  const porque = corte(body.porque, 300);
  const pratica = corte(body.pratica, 120);
  const ritmo = corte(body.ritmo, 60);
  const dias = parseInt(body.dias, 10) || 0;
  const plano = corte(body.plano, 180);
  const hoje = corte(body.hoje, 400);
  const tipoSugestoes = corte(body.tipo, 20);
  const contextoSugestoes = corte(body.contexto, 300);

  const locale = getLocale();
  const lang = locale === 'en' ? 'English' : locale === 'es' ? 'español' : 'português do Brasil';
  const NUNCA_INVENTE = 'Use SOMENTE informação que a pessoa deu. Nunca invente número, prazo, motivo ou detalhe.';
  const SEM_MOTIVACAO = 'Nada de motivação genérica, elogio, adjetivo de valor, emoji, exclamação ou dois-pontos.';

  let system, entrada, minimo = 4, maximo = 90;

  if (modo === 'sugestoes') {
    if (!contextoSugestoes) return NextResponse.json({}, { status: 400 });
    system = [
      'Você é o Up, guia de um app de jornadas pessoais.',
      tipoSugestoes === 'acao'
        ? 'Sugira 3 ações pequenas, observáveis e realistas relacionadas ao objetivo da pessoa.'
        : 'Sugira 3 formas curtas e humanas de escrever o primeiro dia, usando apenas o contexto dado.',
      `Cada sugestão deve ter no máximo ${tipoSugestoes === 'acao' ? 9 : 14} palavras, em ${lang}, sem emojis, sem promessa e sem motivação genérica.`,
      'Responda somente com 3 linhas, sem números ou marcadores.', NUNCA_INVENTE, SEM_MOTIVACAO,
    ].join(' ');
    entrada = `Contexto da jornada: "${contextoSugestoes}"`;
    minimo = 3; maximo = 80;
  } else if (modo === 'pergunta') {
    if (rascunho.length < 2) return NextResponse.json({}, { status: 400 });
    system = [
      'Alguém está criando uma jornada pessoal num app e escreveu só uma palavra ou duas.',
      'Devolva UMA pergunta que descubra o que falta para aquilo virar algo concreto:',
      'quantidade, frequência, duração ou momento do dia — o que fizer mais sentido.',
      `Uma pergunta só, no máximo 12 palavras, em ${lang}, terminando em "?".`,
      'Não proponha nenhum título. Não dê exemplos de resposta.',
      'Nunca pergunte sobre sentimento, motivo profundo ou autoestima.', SEM_MOTIVACAO,
      'Responda só com a pergunta.',
    ].join(' ');
    entrada = `Rascunho: "${rascunho}"`;
    minimo = 10;
  } else if (modo === 'titulo') {
    if (rascunho.length < 2 || !resposta) return NextResponse.json({}, { status: 400 });
    system = [
      'Escreva UM título curto de jornada pessoal a partir do rascunho e da resposta da pessoa.',
      `Máximo 60 caracteres, em ${lang}, sem ponto final, sem aspas.`, NUNCA_INVENTE,
      'Comece por um verbo quando couber ("Beber 1,8 L de água por dia").', SEM_MOTIVACAO,
      'Responda só com o título.',
    ].join(' ');
    entrada = `Rascunho: "${rascunho}"\nResposta da pessoa: "${resposta}"`;
    maximo = 80;
  } else if (modo === 'porque') {
    if (!titulo) return NextResponse.json({}, { status: 400 });
    system = [
      'Alguém está criando a jornada abaixo e precisa dizer por que aquilo importa para ela.',
      'Devolva 4 pontos de partida curtos, um por linha, sem numerar, sem marcador.',
      `Cada um: no máximo 5 palavras, em ${lang}, sem ponto final.`,
      // Motivo é da pessoa. Estes são começos de frase para ela completar,
      // e por isso precisam ser amplos — não uma leitura do que ela sente.
      'São começos de frase genéricos e amplos, para ela completar com a própria história.',
      'Nunca afirme o que ela sente, nem suponha problema de saúde, trabalho ou família.', SEM_MOTIVACAO,
      'Responda só com as 4 linhas.',
    ].join(' ');
    entrada = `Jornada: "${titulo}"`;
  } else if (modo === 'pratica') {
    if (!titulo) return NextResponse.json({}, { status: 400 });
    system = [
      'Alguém vai praticar algo numa jornada pessoal. Transforme a intenção em algo OBSERVÁVEL:',
      'uma ação que dá para saber, no fim do dia, se aconteceu ou não.',
      'Devolva até 3 opções, uma por linha, sem numerar, sem marcador.',
      `Cada uma: no máximo 8 palavras, em ${lang}, começando por um verbo, sem ponto final.`,
      NUNCA_INVENTE, SEM_MOTIVACAO,
      'Responda só com as linhas.',
    ].join(' ');
    entrada = `Jornada: "${titulo}"\nO que a pessoa escreveu: "${rascunho || pratica}"`;
  } else if (modo === 'organizar') {
    if (!rascunho) return NextResponse.json({}, { status: 400 });
    system = [
      'Organize as respostas de uma pessoa em uma recomendação clara e específica para uma jornada pessoal.',
      `Responda SOMENTE um JSON válido, em ${lang}, sem markdown, com estas chaves exatas:`,
      'titulo, descricao, pratica, ritmo, dias, primeiro, categoria.',
      'titulo: curto, concreto e começando por verbo quando couber. Não copie apenas as palavras soltas da resposta.',
      'descricao: una o objetivo e a ação em 1 ou 2 frases naturais. Dê clareza para quem ler no feed, sem inventar sentimento.',
      'pratica: transforme a ação em uma frase observável e específica, usando somente o que foi dito.',
      'ritmo: interprete a resposta de frequência e use diario, 3x, fds ou outro texto curto; se não houver informação, use vazio.',
      'dias: interprete a resposta de duração; use o número informado e, se não houver número, use 30.',
      'primeiro: registro curto, humano e em primeira pessoa sobre o primeiro passo. Combine as respostas quando isso deixar o Dia 1 mais claro.',
      'categoria: escolha somente body, health, mind, study, work, money, relationship, creative, home, habit, life ou other.',
      NUNCA_INVENTE, SEM_MOTIVACAO,
    ].join(' ');
    entrada = [
      `O que quero mudar: "${rascunho}"`,
      porque && `Ação que vou fazer: "${porque}"`,
      pratica && `Frequência: "${pratica}"`,
      plano && `Duração: "${plano}"`,
      `Meu primeiro passo hoje: "${hoje}"`,
    ].filter(Boolean).join('\n');
  } else {
    // primeiro
    if (!resposta) return NextResponse.json({}, { status: 400 });
    system = [
      'A pessoa acabou de criar uma jornada e contou o que fez hoje ser o dia de começar.',
      'Dê forma ao que ela disse: um registro de primeiro dia, em primeira pessoa,',
      `1 ou 2 frases, no máximo 220 caracteres, em ${lang}.`,
      NUNCA_INVENTE,
      'Mantenha as palavras e o tom dela. Não repita o título nem o motivo — isso já aparece na página.',
      'Não prometa resultado, não diga que vai dar certo, não se compare com ninguém.', SEM_MOTIVACAO,
      'Responda só com o texto.',
    ].join(' ');
    entrada = [
      titulo && `Jornada: "${titulo}"`,
      porque && `Motivo: "${porque}"`,
      pratica && `Prática: "${pratica}"`,
      ritmo && `Ritmo: ${ritmo}`,
      dias && `Duração: ${dias} dias`,
      `O que a pessoa respondeu sobre hoje: "${resposta}"`,
    ].filter(Boolean).join('\n');
    maximo = 240;
  }

  try {
    const sinal = AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined;
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      signal: sinal,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: system }, { role: 'user', content: entrada }],
        max_tokens: modo === 'primeiro' ? 140 : (modo === 'organizar' ? 260 : 90),
        temperature: modo === 'porque' ? 0.7 : 0.4,
        ...(modo === 'organizar' ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    if (!r.ok) return NextResponse.json({}, { status: 502 });
    const j = await r.json();
    const bruto = (j.choices?.[0]?.message?.content || '').trim();
    if (!bruto) return NextResponse.json({}, { status: 502 });

    const limpaLinha = (l) => l
      .replace(/^\s*[-*•\d.)\s]+/, '')
      .replace(/^["“]|["”]$/g, '')
      .replace(/[.]+\s*$/, '')
      .trim();

    if (modo === 'organizar') {
      try {
        const objeto = JSON.parse(bruto);
        return NextResponse.json({
          titulo: corte(objeto.titulo, 80),
          descricao: corte(objeto.descricao, 300),
          pratica: corte(objeto.pratica, 120),
          ritmo: corte(objeto.ritmo, 60),
          dias: Math.min(730, Math.max(1, parseInt(objeto.dias, 10) || 30)),
          primeiro: corte(objeto.primeiro, 500),
          categoria: corte(objeto.categoria, 24),
        });
      } catch {
        return NextResponse.json({}, { status: 502 });
      }
    }

    // Listas
    if (modo === 'porque' || modo === 'pratica' || modo === 'sugestoes') {
      const proibido = /sentindo|orgulh|autoestima|voc[êe] consegue|feeling|proud/i;
      const itens = bruto.split('\n').map(limpaLinha)
        .filter((l) => l.length >= 3 && l.length <= 60 && !proibido.test(l))
        .slice(0, modo === 'porque' ? 4 : 3);
      if (!itens.length) return NextResponse.json({}, { status: 502 });
      return NextResponse.json({ itens });
    }

    // Texto único
    let texto = bruto.split('\n')[0].replace(/^["“]|["”]$/g, '').replace(/\s+/g, ' ').trim();

    if (modo === 'pergunta') {
      const proibido = /sentindo|sente|orgulh|autoestima|feeling|proud/i;
      if (!texto.endsWith('?') || texto.length < minimo || texto.length > maximo || proibido.test(texto)) {
        return NextResponse.json({}, { status: 502 });
      }
      return NextResponse.json({ pergunta: texto });
    }

    if (modo === 'primeiro') {
      texto = bruto.replace(/^["“]|["”]$/g, '').replace(/\s+/g, ' ').trim();
      if (texto.length < 12 || texto.length > maximo) return NextResponse.json({}, { status: 502 });
      return NextResponse.json({ texto });
    }

    texto = texto.replace(/[.]+$/, '');
    if (texto.length < minimo || texto.length > maximo) return NextResponse.json({}, { status: 502 });
    return NextResponse.json({ titulo: texto.slice(0, 80) });
  } catch {
    return NextResponse.json({}, { status: 502 });
  }
}
