import { fill } from './i18n';

// ============================================================
// A PERGUNTA DO DIA
//
// O compositor mostrava quatro sugestões fixas, iguais para uma
// jornada de água e uma de inglês:
//
//   "O que foi difícil hoje" · "Um passo pequeno que dei"
//   "Algo que aprendi"       · "Por que eu continuo"
//
// E havia um problema pior que a repetição: tocar num chip
// fazia `setText(chip + ' ')`. A frase do app entrava DENTRO do
// texto da pessoa, e ia publicada assim. É a mesma doença do
// patch 78, dentro do compositor.
//
// Agora a pergunta fica ACIMA do campo e nunca entra nele. Ela
// é pergunta, não começo de frase — quem responde é a pessoa,
// com as palavras dela.
//
// ------------------------------------------------------------
// DUAS CAMADAS, E A ORDEM IMPORTA
//
// 1. SITUAÇÃO (aqui, sem IA). O que está acontecendo NESTA
//    jornada hoje: é o dia 1? ontem foi difícil? ficou um passo
//    combinado em aberto? É determinística, instantânea, de
//    graça, e funciona sem chave nenhuma.
//
// 2. ASSUNTO (a IA, em /api/perguntas). Sobre o que a jornada
//    trata: litros de água, minutos de inglês, quilômetros.
//    Entra DEPOIS, no rodízio, e some sem quebrar nada.
//
// A camada 1 vem primeiro de propósito. "Você conseguiu beber
// 1,8 L?" é uma boa pergunta. "Você conseguiu comprar a
// garrafa que deixou combinado ontem?" é melhor — porque cita
// o que a própria pessoa disse que ia fazer.
// ============================================================

const MARCOS = [7, 30, 60, 100];

/**
 * Devolve a lista de perguntas, já na ordem de rodízio.
 * A primeira é a mais específica que a situação permite.
 *
 * ctx: { dia, ultimoKind, passoAberto }
 */
export function perguntasDoDia(ctx = {}, t = {}) {
  const dia = Number(ctx.dia) || 1;
  const lista = [];

  // 1. O PASSO EM ABERTO — a pergunta mais específica que existe,
  //    porque não é nossa: é a frase que a pessoa escreveu ontem.
  //    O app já guarda isso em updates.next_step e só usava para
  //    fechar capítulo.
  const passo = String(ctx.passoAberto || '').trim();
  if (passo) lista.push(fill(t.pergPasso || 'Você conseguiu {p}?', { p: limpaPasso(passo) }));

  // 2. DIA 1 — não há ontem para comparar. A pergunta útil aqui
  //    é a que define o que vai contar como avanço, e é a mesma
  //    que deixa o registro concreto em vez de "Comecei.".
  if (dia <= 1) lista.push(t.pergDia1);

  // 3. DEPOIS DE UM DIA DIFÍCIL — nunca "por que você parou?".
  //    Essa pergunta cobra. A que serve olha para frente.
  if (ctx.ultimoKind === 'setback') lista.push(t.pergDepoisDeDificil);

  // 4. MARCO — dia redondo é quando a comparação fica visível.
  if (MARCOS.includes(dia)) lista.push(t.pergMarco);

  // 5. AS GERAIS — o caso comum. Continuam concretas: o que foi
  //    FEITO, o que atrapalhou, o que vem amanhã. Nenhuma
  //    pergunta sobre sentimento: isso é consultório, e este app
  //    não é.
  const gerais = Array.isArray(t.pergGerais) ? t.pergGerais : [];
  gerais.forEach((p) => lista.push(p));

  return lista.filter(Boolean);
}

// "vou comprar uma garrafa de 1 L" -> "comprar uma garrafa de 1 L"
// Sem isso a pergunta sai "Você conseguiu vou comprar…".
function limpaPasso(p) {
  return p
    .replace(/^\s*(eu\s+)?(vou|irei|pretendo|quero|preciso|tenho que|vou tentar)\s+/i, '')
    .replace(/^\s*(i\s+)?(will|am going to|want to|need to|plan to)\s+/i, '')
    .replace(/[.!?]+\s*$/, '')
    .trim();
}
