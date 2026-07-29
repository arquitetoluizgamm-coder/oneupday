'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { track } from '../../lib/track';
import ImageCropper from '../../components/ImageCropper';

const MAX_VIDEO = 60 * 1024 * 1024;

// Rascunhos antigos guardavam o texto exibido em vez de um identificador.
// Esta lista permite trocar exemplos já salvos para o idioma atual sem
// traduzir o que a própria pessoa escreveu.
const LEGACY_GOAL_EXAMPLES_PT = [
  'Voltar a treinar', 'Caminhar mais', 'Dormir melhor', 'Cuidar da alimentação', 'Beber mais água',
  'Meditar', 'Ter mais calma', 'Cuidar da ansiedade', 'Fazer terapia', 'Ter mais tempo para mim',
  'Voltar a estudar', 'Aprender inglês', 'Ler mais', 'Fazer um curso', 'Estudar para uma prova',
  'Organizar minha vida', 'Arrumar minha casa', 'Economizar dinheiro', 'Planejar minha rotina', 'Usar menos o celular',
  'Começar um projeto', 'Tirar uma ideia do papel', 'Voltar a desenhar', 'Escrever um livro', 'Começar um negócio',
  'Estar mais presente', 'Ligar para minha família', 'Fazer novos amigos', 'Cuidar do meu relacionamento', 'Aprender a conversar melhor',
];

function goalExamplesFrom(t) {
  return (t.wzGoalGroups || []).flatMap((group) => group[1] || []);
}

function localizeLegacyGoal(value, t) {
  const index = LEGACY_GOAL_EXAMPLES_PT.indexOf(String(value || '').trim());
  const localized = goalExamplesFrom(t);
  return index >= 0 && localized[index] ? localized[index] : value;
}

function normalizeLegacyFrequency(value) {
  const key = String(value || '').trim().toLowerCase();
  if (['todos os dias', 'every day', 'todos los días'].includes(key)) return 'daily';
  if (['3 vezes por semana', 'três vezes por semana', 'three times a week', 'tres veces por semana'].includes(key)) return '3x';
  if (['fins de semana', 'weekends', 'fines de semana'].includes(key)) return 'weekends';
  if (['personalizado', 'custom'].includes(key)) return 'custom';
  return value;
}

// ============================================================
// UMA PERGUNTA POR TELA
//
// Cinco perguntas, e cada uma tem UMA decisão principal. Não é enfeite: um
// formulário com seis campos faz a pessoa decidir seis coisas ao
// mesmo tempo, e ela responde todas mal. Uma pergunta por vez ela
// responde de verdade.
//
// O preço disso é o funil: cada tela é um lugar para desistir. Por
// isso só a PRIMEIRA é obrigatória. Todas as outras têm "Pular
// esta", e a jornada nasce igual sem elas.
//
// A IA aparece nas perguntas de conteúdo, sempre do mesmo jeito: a pessoa
// escreve, ela dá forma, a pessoa edita. Nenhuma tela depende de
// IA para funcionar — sem chave, tudo continua sendo campo livre.
// ============================================================
// Cinco perguntas objetivas + uma tela final de revisão.
// Ritmo e duração são uma única decisão: "como você quer seguir?".
const STEPS = 7;
const S_TITULO = 0, S_PORQUE = 1, S_PRATICA = 2, S_PLANO = 3, S_HOJE = 4, S_MIDIA = 5, S_REV = 6;

const COLORS = {
  art: '#8A6A9B', body: '#5E6B55', health: '#6E8168', mind: '#5B7189',
  study: '#4A6076', work: '#10132D', money: '#6B7F5E', relationship: '#A8637A',
  creative: '#96523C', home: '#C16F54', habit: '#B3874A', life: '#84917A',
  other: '#7A7A72',
};

// Adivinha a categoria pelo título. A pessoa pode trocar na revisão,
// mas não precisa decidir nada se o palpite estiver certo.
const PISTAS = {
  body: ['academia', 'treino', 'malhar', 'correr', 'corrida', 'caminhar', 'caminhada', 'emagrecer', 'muscul', 'gym', 'run', 'walk', 'workout'],
  health: ['saude', 'agua', 'dormir', 'sono', 'fumar', 'beber', 'alcool', 'remedio', 'medico', 'health', 'sleep', 'quit', 'water'],
  study: ['estudar', 'estudo', 'ingles', 'faculdade', 'prova', 'concurso', 'curso', 'aula', 'ler ', 'leitura', 'study', 'read', 'course', 'english'],
  work: ['trabalho', 'emprego', 'carreira', 'curriculo', 'negocio', 'cliente', 'vender', 'work', 'job', 'career'],
  money: ['dinheiro', 'divida', 'economizar', 'poupar', 'financ', 'money', 'debt', 'save'],
  mind: ['ansiedade', 'meditar', 'meditacao', 'calma', 'mente', 'terapia', 'respirar', 'mind', 'anxiety', 'meditate'],
  creative: ['desenhar', 'desenho', 'pintar', 'escrever', 'musica', 'tocar', 'violao', 'foto', 'draw', 'paint', 'write', 'music'],
  relationship: ['familia', 'pai', 'mae', 'filho', 'filha', 'amigo', 'namoro', 'casamento', 'conversar', 'family', 'friend'],
  home: ['casa', 'organizar', 'arrumar', 'limpar', 'quarto', 'cozinha', 'home', 'clean', 'organize'],
  habit: ['habito', 'rotina', 'celular', 'tela', 'habit', 'routine', 'screen'],
};
const semAcento = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function adivinhar(txt) {
  const t = semAcento(txt);
  if (t.length < 3) return '';
  for (const [c, palavras] of Object.entries(PISTAS)) {
    for (const p of palavras) if (t.includes(semAcento(p))) return c;
  }
  return '';
}

function slugify(title) {
  const base = semAcento(title).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'journey';
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// A prévia usa a mesma fileira visual do feed. Os botões são apenas uma
// amostra, mas os SVGs e as classes são os mesmos usados na publicação real.
function PreviewActions({ t }) {
  return (
    <div className="entry-actions feed-acts wz-preview-actions" aria-hidden="true">
      <div className="support-wrap">
        <button type="button" className="support-pill">
          <svg className="sp-heart" viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1 7.8 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
          <span className="action-label">{t.withYouIdle}</span>
        </button>
        <button type="button" className="supporters-icon" tabIndex={-1}>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M16 14a5 5 0 0 1 4.5 5" /></svg>
        </button>
      </div>
      <button type="button" className="comment-toggle">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12 7.6L3 21l1.9-5.7A8.4 8.4 0 1 1 21 11.5z" /></svg>
        <span className="action-label">{t.comment}</span>
      </button>
      <button type="button" className="feed-share">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" /></svg>
        <span className="action-label">{t.shareShort}</span>
      </button>
    </div>
  );
}

export default function NewJourneyForm({ userId, t, aiOn }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [pratica, setPratica] = useState('');
  const [frequencia, setFrequencia] = useState('');
  const [frequenciaOutro, setFrequenciaOutro] = useState('');
  const [plano, setPlano] = useState('');
  const [ritmo, setRitmo] = useState('');
  const [ritmoOutro, setRitmoOutro] = useState('');
  const [dur, setDur] = useState('30');
  const [customDur, setCustomDur] = useState('');
  const [hoje, setHoje] = useState('');
  const [first, setFirst] = useState('');
  const [cat, setCat] = useState('');
  const [catTocada, setCatTocada] = useState(false);
  const [customCat, setCustomCat] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [privAberta, setPrivAberta] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [rawPhotoFile, setRawPhotoFile] = useState(null);
  const [rawPhotoUrl, setRawPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // ---- estado da ajuda da IA, um por tela ----
  const [ajPergunta, setAjPergunta] = useState('');
  const [ajResposta, setAjResposta] = useState('');
  const [ajItens, setAjItens] = useState([]);
  const [ajBusy, setAjBusy] = useState('');
  const [ajErro, setAjErro] = useState('');
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const [upSugestoes, setUpSugestoes] = useState([]);
  const [upSugestoesTipo, setUpSugestoesTipo] = useState('');
  const [upSugestoesBusy, setUpSugestoesBusy] = useState(false);
  const [organizando, setOrganizando] = useState(false);
  const [iaOrganizou, setIaOrganizou] = useState(false);
  const [rascunhoStatus, setRascunhoStatus] = useState('');
  const rascunhoPronto = useRef(false);

  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const router = useRouter();
  const draftKey = `oneupday:new-journey:${userId}`;

  const CATS = [
    ['body', t.catBody], ['health', t.catHealth], ['mind', t.catMind], ['study', t.catStudy],
    ['work', t.catWork], ['money', t.catMoney], ['relationship', t.catRelationship],
    ['creative', t.catCreative], ['home', t.catHome], ['habit', t.catHabit], ['life', t.catLife],
  ];
  const sugestoes = [t.ex1, t.ex2, t.ex3, t.ex4, t.ex5].filter(Boolean);
  const DURS = [['7', t.dur7], ['30', t.dur30], ['60', t.dur60], ['100', t.dur100], ['other', t.durCustom]];
  const RITMOS = [['diario', t.ritmoDiario], ['3x', t.ritmo3x], ['fds', t.ritmoFds], ['outro', t.ritmoOutro]];
  const VIS = [
    ['public', t.pubPublic, t.pubPublicSub],
    ['followers', t.pubFollowers, t.pubFollowersSub],
    ['private', t.pubPrivate, t.pubPrivateSub],
  ];

  useEffect(() => {
    if (catTocada) return;
    const g = adivinhar(title + ' ' + goal);
    if (g) setCat(g);
  }, [title, goal, catTocada]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recupera o que a pessoa já respondeu quando ela volta ao wizard.
  useEffect(() => {
    if (!userId || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d.step === 'number') setStep(Math.max(0, Math.min(STEPS - 1, d.step)));
        if (d.title) setTitle(localizeLegacyGoal(d.title, t)); if (d.goal) setGoal(d.goal); if (d.pratica) setPratica(d.pratica);
        if (d.frequencia) setFrequencia(normalizeLegacyFrequency(d.frequencia)); if (d.frequenciaOutro) setFrequenciaOutro(d.frequenciaOutro);
        if (d.plano) setPlano(d.plano); if (d.ritmo) setRitmo(d.ritmo); if (d.ritmoOutro) setRitmoOutro(d.ritmoOutro);
        if (d.dur) setDur(d.dur); if (d.customDur) setCustomDur(d.customDur); if (d.hoje) setHoje(d.hoje);
        if (d.first) setFirst(d.first); if (d.cat) { setCat(d.cat); setCatTocada(true); }
        if (d.customCat) setCustomCat(d.customCat); if (d.visibility) setVisibility(d.visibility);
        if (d.photoUrl) setPhotoUrl(d.photoUrl); if (d.videoUrl) setVideoUrl(d.videoUrl);
        setRascunhoStatus(t.wzDraftRestored || 'Rascunho recuperado');
      }
    } catch {}

    // ------------------------------------------------------------
    // O TEMA QUE VEIO DA TELA DE ENTRADA
    //
    // Os exemplos da primeira tela ("Voltar a treinar", "Estudar
    // todo dia") mandam `?tema=`. Ele entra como PALPITE no campo
    // do título — a pessoa apaga e escreve o dela se quiser.
    //
    // Só preenche se o campo estiver vazio: um rascunho já começado
    // vale mais que um exemplo, e sobrescrever o que a pessoa
    // escreveu seria apagar trabalho dela.
    // ------------------------------------------------------------
    try {
      const tema = new URLSearchParams(window.location.search).get('tema');
      if (tema) {
        const limpo = tema.trim().slice(0, 80);
        if (limpo) setTitle((atual) => (atual && atual.trim() ? atual : limpo));
      }
    } catch {}

    rascunhoPronto.current = true;
  }, [userId, draftKey, t.wzDraftRestored]);

  // Salva respostas automaticamente. Arquivos já enviados ficam representados
  // pela URL pública; o arquivo ainda não escolhido não interrompe o rascunho.
  useEffect(() => {
    if (!userId || !rascunhoPronto.current || typeof window === 'undefined') return;
    if (![title, goal, pratica, frequencia, plano, hoje, first].some((v) => String(v || '').trim()) && !photoUrl && !videoUrl) return;
    const payload = { step, title, goal, pratica, frequencia, frequenciaOutro, plano, ritmo, ritmoOutro, dur, customDur, hoje, first, cat, customCat, visibility, photoUrl, videoUrl, savedAt: Date.now() };
    const timer = window.setTimeout(() => {
      try { window.localStorage.setItem(draftKey, JSON.stringify(payload)); setRascunhoStatus(t.wzDraftSaved || 'Rascunho salvo'); } catch {}
    }, 250);
    return () => window.clearTimeout(timer);
  }, [userId, draftKey, step, title, goal, pratica, frequencia, frequenciaOutro, plano, ritmo, ritmoOutro, dur, customDur, hoje, first, cat, customCat, visibility, photoUrl, videoUrl, t.wzDraftSaved]);

  // Trocar de tela limpa a ajuda: sugestão de uma pergunta aparecendo
  // embaixo de outra é o tipo de coisa que faz a pessoa desconfiar do app.
  useEffect(() => { setAjPergunta(''); setAjResposta(''); setAjItens([]); setAjErro(''); setAjudaAberta(false); }, [step]);

  // A IA preenche a revisão por código, sem disparar onInput. Recalcular
  // aqui garante que respostas longas apareçam inteiras também nesse caso.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = window.requestAnimationFrame(() => {
      document.querySelectorAll('.wz-grow-input').forEach((el) => {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [goal, hoje, first, iaOrganizou, step]);

  const heads = [
    [t.wizT1, t.wizS1],
    [t.wizT2, t.wizS2],
    [t.wzTPratica, t.wzSPratica],
    [t.wzTRitmo, t.wzSRitmo],
    [t.wzTHoje, t.wzSHoje],
    [t.wzTMidia, t.wzSMidia],
    [t.wizTpriv || 'Quem vai ver?', t.wizSpriv || 'Escolha quem poderá acompanhar.'],
  ];

  // O Up oferece caminhos concretos sem obrigar a pessoa a escolher um.
  // Cada exemplo preenche apenas a resposta da tela atual e continua editável.
  const ajudaPorEtapa = [
    { fala: t.wzUpQ1 || 'Quer algumas ideias para encontrar um objetivo que tenha a ver com você?', exemplos: t.wzUpEx1 || ['Voltar a treinar', 'Dormir melhor', 'Voltar a estudar', 'Organizar minha vida'], aplicar: setTitle },
    { fala: t.wzUpQ2 || 'Quer transformar esse objetivo em uma ação simples?', exemplos: t.wzUpEx2 || ['Caminhar 20 minutos', 'Estudar uma aula', 'Beber mais água'], aplicar: setGoal },
    { fala: 'Escolha um ritmo que caiba na sua vida real.', exemplos: [], aplicar: setFrequencia },
    { fala: 'Quer começar pequeno ou se dar mais tempo?', exemplos: ['7 dias', '30 dias', '60 dias', '100 dias', 'Vou decidir no caminho'], aplicar: setPlano },
    { fala: t.wzUpQ5 || 'O que fez hoje ser o dia em que você decidiu começar?', exemplos: t.wzUpEx5 || ['Dei o primeiro passo', 'Cansei de adiar', 'Hoje eu tive um pouco de tempo'], aplicar: setHoje },
  ];
  const ajudaAtual = [S_TITULO, S_PORQUE, S_HOJE].includes(step) ? ajudaPorEtapa[step] : null;
  const objetivoCategorias = t.wzGoalGroups || [];
  function escolherExemplo(exemplo) {
    ajudaAtual?.aplicar(exemplo);
    setAjudaAberta(false);
    setErro('');
  }

  const fallbackSugestoes = (tipo) => (
    tipo === 'acao' ? (t.wzUpEx2 || []).slice(0, 3) : (t.wzUpEx5 || []).slice(0, 3)
  );

  async function buscarSugestoes(tipo, contexto) {
    const locais = fallbackSugestoes(tipo, contexto);
    setUpSugestoesTipo(tipo); setUpSugestoes(locais); setUpSugestoesBusy(false);
    if (!aiOn || !contexto.trim()) return;
    setUpSugestoesBusy(true);
    try {
      const r = await fetch('/api/titulo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modo: 'sugestoes', tipo, contexto: contexto.trim() }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && Array.isArray(d.itens) && d.itens.length) setUpSugestoes(d.itens);
    } catch {}
    setUpSugestoesBusy(false);
  }

  // ============================================================
  // A IA. Sempre o mesmo contrato: ela recebe o que a pessoa
  // escreveu e devolve forma. Se falhar, o campo continua lá,
  // livre, e nada no wizard depende dela.
  // ============================================================
  async function pedir(modo, corpo) {
    setAjBusy(modo); setAjErro('');
    try {
      const r = await fetch('/api/titulo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo, ...corpo }),
      });
      const d = await r.json().catch(() => ({}));
      setAjBusy('');
      if (r.ok) return d;
    } catch {}
    setAjBusy(''); setAjErro(t.ajErro || '');
    return null;
  }

  async function pedirPergunta() {
    if (ajBusy || title.trim().length < 2) return;
    const d = await pedir('pergunta', { rascunho: title.trim() });
    if (d?.pergunta) setAjPergunta(d.pergunta);
  }

  async function organizarRascunho() {
    if (organizando) return;
    setOrganizando(true); setAjErro('');
    try {
      const r = await fetch('/api/titulo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modo: 'organizar',
          rascunho: title.trim(),
          porque: goal.trim(),
          pratica: (frequencia === 'custom'
            ? frequenciaOutro
            : ({ daily: t.ritmoDiario, '3x': t.ritmo3x, weekends: t.ritmoFds }[frequencia] || frequencia)).trim(),
          plano: plano.trim(),
          hoje: hoje.trim(),
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.titulo) {
        setIaOrganizou(true);
        setTitle(d.titulo || title);
        setGoal(d.descricao || goal);
        setPratica(d.pratica || goal);
        setFirst(d.primeiro || hoje);
        if (d.dias) { const n = String(d.dias); setDur(['7', '30', '60', '100'].includes(n) ? n : 'other'); if (!['7', '30', '60', '100'].includes(n)) setCustomDur(n); }
        if (d.ritmo === 'diario' || d.ritmo === '3x' || d.ritmo === 'fds') { setRitmo(d.ritmo); setRitmoOutro(''); }
        else if (d.ritmo) { setRitmo('outro'); setRitmoOutro(d.ritmo); }
        const categoria = CATS.find(([v]) => v === d.categoria)?.[0];
        if (categoria) { setCat(categoria); setCatTocada(true); }
      } else {
        setIaOrganizou(false);
        setPratica((current) => current || goal);
        setAjErro(t.ajErro || 'A recomendação não ficou disponível. Você pode tentar novamente.');
      }
    } catch { setIaOrganizou(false); setPratica((current) => current || goal); setAjErro(t.ajErro || 'A recomendação não ficou disponível. Você pode tentar novamente.'); }
    setOrganizando(false);
  }

  async function montarTitulo() {
    if (ajBusy || !ajResposta.trim()) return;
    const d = await pedir('titulo', { rascunho: title.trim(), resposta: ajResposta.trim() });
    if (!d?.titulo) return;
    setTitle(d.titulo);
    // Se a resposta dela trouxe um prazo, a duração já vai marcada.
    // É informação que ela deu — não é o app decidindo por ela.
    const m = ajResposta.match(/(\d{1,3})\s*(dias?|days?)/i);
    if (m) {
      const n = String(parseInt(m[1], 10));
      const conhecido = DURS.some(([v]) => v === n);
      setDur(conhecido ? n : 'other');
      if (!conhecido) setCustomDur(n);
    }
    setAjPergunta(''); setAjResposta('');
  }

  async function pedirPorques() {
    if (ajBusy || !title.trim()) return;
    const d = await pedir('porque', { titulo: title.trim() });
    if (d?.itens?.length) setAjItens(d.itens);
  }

  async function pedirPraticas() {
    if (ajBusy || !title.trim()) return;
    const d = await pedir('pratica', { titulo: title.trim(), rascunho: pratica.trim() });
    if (d?.itens?.length) setAjItens(d.itens);
  }

  async function montarPrimeiro() {
    if (ajBusy || !hoje.trim()) return;
    const d = await pedir('primeiro', {
      titulo: title.trim(), porque: goal.trim(), pratica: pratica.trim(),
      ritmo: ritmoTexto(), dias: totalDias(), resposta: hoje.trim(),
    });
    if (d?.texto) setFirst(d.texto);
  }

  // ---- valores derivados ----
  function totalDias() {
    return dur === 'other'
      ? Math.min(730, Math.max(1, parseInt(customDur || '30', 10) || 30))
      : parseInt(dur, 10);
  }
  function ritmoTexto() {
    if (ritmo === 'outro') return ritmoOutro.trim();
    return (RITMOS.find(([v]) => v === ritmo) || [])[1] || '';
  }
  // No banco vai a CHAVE ('diario', '3x', 'fds'), não o rótulo traduzido —
  // senão a mesma jornada teria ritmo diferente em cada idioma.
  function ritmoValor() {
    if (!ritmo) return null;
    return ritmo === 'outro' ? (ritmoOutro.trim().slice(0, 60) || null) : ritmo;
  }

  // Só a primeira tela prende. As outras seguem em branco.
  const podeAvancar =
    step !== S_TITULO ||
    (title.trim().length >= 2);

  function irPara(n) {
    setErro('');
    setStep(n);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function avancar() {
    if (!podeAvancar || step >= STEPS - 1) return;
    if (step === S_TITULO) buscarSugestoes('acao', title);
    if (step === S_PORQUE) buscarSugestoes('primeiro', `${title}. ${goal}`);
    if (step === S_HOJE) await organizarRascunho();
    irPara(step + 1);
  }
  function voltar() { if (step > 0) irPara(step - 1); }

  async function upload(file, extOverride) {
    try {
      if (!file) return null;
      const supabase = createClient();
      const ext = (extOverride || file.name?.split('.').pop() || 'bin').toLowerCase();
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const path = `${userId}/${id}.${ext}`;
      const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: false });
      if (error) { console.error('[wizard upload] storage:', error); return null; }
      return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
    } catch (error) {
      console.error('[wizard upload] unexpected:', error);
      return null;
    }
  }
  async function onPhoto(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (rawPhotoUrl) URL.revokeObjectURL(rawPhotoUrl);
    setRawPhotoFile(file); setRawPhotoUrl(URL.createObjectURL(file)); setErro('');
  }
  async function onPhotoCropDone(result) {
    const file = result === 'original' || !result ? rawPhotoFile : result;
    const ext = result === 'original' || !result ? undefined : 'jpg';
    if (rawPhotoUrl) URL.revokeObjectURL(rawPhotoUrl);
    setRawPhotoUrl(''); setRawPhotoFile(null);
    if (!file) return;
    setUploading(true); setErro('');
    try {
      const url = await upload(file, ext);
      if (!url) { setErro(t.createError); return; }
      setPhotoUrl(url); setVideoUrl(null); if (videoRef.current) videoRef.current.value = '';
    } finally {
      setUploading(false);
    }
  }
  function onPhotoCropCancel() {
    if (rawPhotoUrl) URL.revokeObjectURL(rawPhotoUrl);
    setRawPhotoUrl(''); setRawPhotoFile(null);
    if (photoRef.current) photoRef.current.value = '';
  }
  async function onVideo(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > MAX_VIDEO) { setErro(t.videoTooBig); e.target.value = ''; return; }
    setUploading(true); setErro('');
    try {
      const url = await upload(file);
      if (!url) { setErro(t.createError); return; }
      setVideoUrl(url); setPhotoUrl(null); if (photoRef.current) photoRef.current.value = '';
    } finally {
      setUploading(false);
    }
  }

  // ============================================================
  // Só cria quando a pessoa toca no botão da última tela.
  // Não existe <form>: nada aqui pode enviar sozinho.
  // ============================================================
  async function criar() {
    if (saving || uploading || step !== S_REV) return;
    setSaving(true); setErro('');

    const category = cat === 'other'
      ? (customCat.trim().toLowerCase() || 'other').slice(0, 24)
      : (cat || 'life');
    const total_days = totalDias();

    const supabase = createClient();
    const slug = slugify(title);
    const payload = {
      owner_id: userId, slug, title: title.trim(), category, goal: goal.trim(), total_days,
      cover_color: COLORS[category] || '#ff7a45', is_public: visibility === 'public', visibility,
      pratica: pratica.trim() || null, ritmo: ritmoValor(),
    };

    // Rede de segurança em duas camadas. Criar a jornada é a ação mais
    // importante do app: ela não pode morrer porque um SQL opcional não
    // foi rodado. Tira primeiro os campos novos, depois a visibilidade.
    let { data: journey, error } = await supabase.from('journeys').insert(payload).select().single();
    if (error && /pratica|ritmo|column/i.test(error.message || '')) {
      console.warn('[wizard] colunas ausentes — rode supabase/jornada-wizard.sql');
      const { pratica: _p, ritmo: _r, ...semNovos } = payload;
      ({ data: journey, error } = await supabase.from('journeys').insert(semNovos).select().single());
      if (error && /visibility|column/i.test(error.message || '')) {
        const { visibility: _v, ...semVis } = semNovos;
        ({ data: journey, error } = await supabase.from('journeys').insert(semVis).select().single());
      }
    } else if (error && /visibility|column/i.test(error.message || '')) {
      const { visibility: _v, ...semVis } = payload;
      ({ data: journey, error } = await supabase.from('journeys').insert(semVis).select().single());
    }
    if (error || !journey) { setSaving(false); setErro(t.createError); return; }

    // O dia 1 nunca pode faltar: sem ele a jornada não aparece no feed.
    //
    // Mas ele não precisa de FRASE para existir. Quem pula esta parte
    // tem o registro criado vazio, e o feed mostra um selo COMECEI —
    // marca, e não voz. O app não escreve no lugar de ninguém.
    const texto = first.trim() || (photoUrl ? '\u{1F4F7}' : (videoUrl ? '\u{1F3A5}' : ''));
    let { error: upErr } = await supabase.from('updates').insert({
      journey_id: journey.id, day_number: 1, kind: 'step', text: texto,
      photo_url: photoUrl, video_url: videoUrl,
    });
    if (upErr) {
      const { error: retry } = await supabase.from('updates').insert({
        journey_id: journey.id, day_number: 1, kind: 'step', text: texto,
      });
      upErr = retry;
    }
    if (upErr) { setSaving(false); setErro(t.createError); return; }

    // Guarda a origem da jornada para a Upi lembrar depois.
    // Nao bloqueia a criacao: se a tabela ainda nao existir ou falhar,
    // a jornada continua publicada normalmente.
    try {
      const origem = [goal, pratica, plano, hoje, first]
        .map((v) => String(v || '').trim())
        .filter(Boolean)
        .join('\n');
      if (origem) {
        await supabase.from('upi_memories').upsert({
          user_id: userId,
          source_type: 'journey_start',
          source_id: String(journey.id),
          kind: 'origin',
          title: title.trim(),
          body: origem.slice(0, 1200),
          summary: (goal.trim() || pratica.trim() || first.trim() || origem).slice(0, 160),
          happened_on: new Date().toISOString().slice(0, 10),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,source_type,source_id' });
      }
    } catch {}

    track('journey_created', { slug, visibility });
    track('day1_posted', { slug });
    try { window.localStorage.removeItem(draftKey); } catch {}
    router.push(`/created/${slug}`);
    router.refresh();
  }

  function salvarRascunhoESair() {
    try {
      window.localStorage.setItem(draftKey, JSON.stringify({ step, title, goal, pratica, frequencia, frequenciaOutro, plano, ritmo, ritmoOutro, dur, customDur, hoje, first, cat, customCat, visibility, photoUrl, videoUrl, savedAt: Date.now() }));
    } catch {}
    setRascunhoStatus(t.wzDraftSaved || 'Rascunho salvo');
    router.push('/home');
  }

  // Enter nunca envia nada: no máximo avança de tela.
  function onKeyDown(e) {
    if (e.key !== 'Enter') return;
    if (e.target.tagName === 'TEXTAREA') return;
    e.preventDefault();
    if (step < STEPS - 1) avancar();
  }

  function crescerCampo(e) {
    e.currentTarget.style.height = 'auto';
    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
  }

  const totalPreview = dur === 'other' ? (parseInt(customDur || '0', 10) || 0) : parseInt(dur, 10);
  const catLabel = cat === 'other'
    ? (customCat.trim() || t.catOther)
    : (CATS.find(([v]) => v === cat) || [])[1];

  // Bloco de ajuda em lista, usado pelo porquê e pela prática.
  const listaDeAjuda = (aoEscolher) => (
    ajItens.length > 0 && (
      <div className="wz-sugs wz-sugs-ia">
        {ajItens.map((it, i) => (
          <button type="button" key={i} className="wz-sug" onClick={() => { aoEscolher(it); setAjItens([]); }}>{it}</button>
        ))}
      </div>
    )
  );

  const botaoIA = (rotulo, acao, modo) => aiOn && (
    <button type="button" className="wz-ajuda" onClick={acao} disabled={!!ajBusy}>
      {ajBusy === modo ? (t.ajPensando || '') : rotulo}
    </button>
  );

  return (
    <div className="wz" onKeyDown={onKeyDown}>
      <div className="wz-rail" aria-hidden="true">
        {Array.from({ length: STEPS }).map((_, i) => (
          <span key={i} className={`wz-bar${i === step ? ' on' : ''}${i < step ? ' done' : ''}`} />
        ))}
      </div>

      <div className="wz-head">
        <span className="wz-count">{(t.wizStep || '{n}/{t}').replace('{n}', step + 1).replace('{t}', STEPS)}</span>
        <h1>{heads[step][0]}</h1>
        <p className="wz-explain">{heads[step][1]}</p>
        {ajudaAtual && (
          <div className={`wz-up-help${ajudaAberta ? ' aberta' : ''}`}>
            <img className="upi-char bob" src="/upi.svg" alt="Upi" aria-hidden="true" />
            <div className="wz-up-help-copy">
              <p>{ajudaAtual.fala}</p>
              <button type="button" onClick={() => setAjudaAberta((v) => !v)} aria-expanded={ajudaAberta}>
                {ajudaAberta ? (t.wzUpClose || 'Esconder exemplos') : (t.wzUpOpen || 'Ver exemplos')}
              </button>
            </div>
          </div>
        )}
        {ajudaAtual && ajudaAberta && step === S_TITULO && (
          <div className="wz-up-modal" role="dialog" aria-modal="true" aria-label={t.wzExamplesDialog}>
            <div className="wz-up-modal-head"><div><b>{t.wzExamplesTitle}</b><span>{t.wzExamplesSub}</span></div><button type="button" className="wz-up-modal-close" onClick={() => setAjudaAberta(false)} aria-label={t.wzExamplesClose}>×</button></div>
            <div className="wz-up-categories">
              {objetivoCategorias.map(([categoria, exemplos]) => (
                <section className="wz-up-category" key={categoria}>
                  <h2>{categoria}</h2>
                  <div className="wz-up-examples">{exemplos.map((exemplo) => <button type="button" key={exemplo} onClick={() => escolherExemplo(exemplo)}>{exemplo}</button>)}</div>
                </section>
              ))}
            </div>
            <button type="button" className="wz-up-write" onClick={() => setAjudaAberta(false)}>{t.wzWriteOther}</button>
          </div>
        )}
      </div>

      {/* ---------------- 1 · o que ---------------- */}
      {step === S_TITULO && (
        <div className="wz-body">
          <input className="wz-input" value={title} onChange={(e) => setTitle(e.target.value)}
            maxLength={80} placeholder={t.fNamePh} autoFocus />

        </div>
      )}

      {/* ---------------- 2 · por que importa ---------------- */}
      {step === S_PORQUE && (
        <div className="wz-body">
          {upSugestoesTipo === 'acao' && (
            <div className="wz-ai-suggestions"><span className="wz-label">{upSugestoesBusy ? t.wzUpThinking : t.wzActionSuggestions}</span>
              <div className="wz-suggestion-row">{upSugestoes.map((item) => <button type="button" key={item} onClick={() => setGoal(item)}>{item}</button>)}</div>
              <button type="button" className="wz-up-write" onClick={() => setUpSugestoes([])}>{t.wzWriteOther}</button>
            </div>
          )}
          <div className="wz-line-area">
            <textarea className="wz-input wz-grow-input" value={goal} onInput={crescerCampo} onChange={(e) => setGoal(e.target.value)}
              maxLength={180} rows={1} placeholder={t.wzActionPh} autoFocus />
            <span className="wz-inline-count">{goal.length}/300</span>
          </div>
        </div>
      )}

      {/* ---------------- 3 · como praticar ---------------- */}
      {step === S_PRATICA && (
        <div className="wz-body">
          <div className="wz-choice-grid">
            {[['daily', t.ritmoDiario], ['3x', t.ritmo3x], ['weekends', t.ritmoFds]].map(([value, label]) => (
              <button type="button" className={`wz-choice${frequencia === value ? ' on' : ''}`} key={value} onClick={() => setFrequencia(value)}>{label}</button>
            ))}
            <button type="button" className={`wz-choice${frequencia === 'custom' ? ' on' : ''}`} onClick={() => setFrequencia('custom')}>{t.ritmoOutro}</button>
          </div>
          {frequencia === 'custom' && <input className="wz-input" value={frequenciaOutro} onChange={(e) => setFrequenciaOutro(e.target.value)} maxLength={80} placeholder={t.wzFrequencyCustomPh} autoFocus />}
        </div>
      )}

      {/* ---------------- 4 · plano ---------------- */}
      {step === S_PLANO && (
        <div className="wz-body">
          <input className="wz-input" value={plano} onChange={(e) => setPlano(e.target.value)}
            maxLength={40} placeholder={t.wzDurationPh} autoFocus />
          <p className="wz-hint">{t.wzDurationHint}</p>
        </div>
      )}

      {/* ---------------- 5 · o primeiro passo ---------------- */}
      {step === S_HOJE && (
        <div className="wz-body">
          {upSugestoesTipo === 'primeiro' && (
            <div className="wz-ai-suggestions"><span className="wz-label">{upSugestoesBusy ? t.wzUpThinking : t.wzStartSuggestions}</span>
              <div className="wz-suggestion-row">{upSugestoes.map((item) => <button type="button" key={item} onClick={() => setHoje(item)}>{item}</button>)}</div>
              <button type="button" className="wz-up-write" onClick={() => setUpSugestoes([])}>{t.wzWriteOther}</button>
            </div>
          )}
          <div className="wz-line-area">
            <textarea className="wz-input wz-grow-input" value={hoje} onInput={crescerCampo} onChange={(e) => setHoje(e.target.value)}
              maxLength={400} rows={1} placeholder={t.wzHojePh} autoFocus />
          </div>
        </div>
      )}

      {step === S_MIDIA && (
        <div className="wz-body wz-media-step">
          <div className="wz-up-help wz-up-media-copy"><img className="upi-char bob" src="/upi.svg" alt="" aria-hidden="true" /><div className="wz-up-help-copy"><p>{t.wzMediaUp}</p></div></div>
          <div className="wz-media-actions">
            <button type="button" className={`wz-media-action${photoUrl ? ' on' : ''}`} onClick={() => photoRef.current?.click()} disabled={uploading}>{uploading ? t.uploading : (photoUrl ? t.photoAdded : t.addPhoto)}</button>
            <button type="button" className={`wz-media-action${videoUrl ? ' on' : ''}`} onClick={() => videoRef.current?.click()} disabled={uploading}>{uploading ? t.uploading : (videoUrl ? t.videoAdded : t.addVideo)}</button>
            <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPhoto} />
            <input ref={videoRef} type="file" accept="video/*" hidden onChange={onVideo} />
          </div>
          <p className="wz-media-note">{t.wzMediaNote}</p>
          {(photoUrl || videoUrl) && <div className="wz-media"><>{photoUrl ? <img src={photoUrl} alt="" /> : <video src={videoUrl} controls playsInline />}</></div>}
          {rawPhotoUrl && (
            <div className="crop-modal" role="dialog" aria-modal="true" aria-label={t.wzCropPhoto}>
              <div className="crop-modal-card">
                <ImageCropper src={rawPhotoUrl} labels={t.crop || {}} aspects={[['portrait', 4 / 5]]}
                  onDone={onPhotoCropDone} onCancel={onPhotoCropCancel} />
              </div>
            </div>
          )}
          <button type="button" className="wz-media-skip" onClick={() => irPara(S_REV)}>{t.wzMediaSkip}</button>
        </div>
      )}

      {step === S_REV && <div className="wz-publish-final" aria-hidden="true" />}

      {step === S_REV && (
        <div className="wz-preview-wrap">
          <span className="wz-preview-kicker">{t.wzPostPreview}</span>
          <article className="entry wz-preview-entry">
            <div className="entry-head">
              <div className="entry-person">
                <span className="entry-ava wz-preview-ava">V</span>
                <span className="entry-id"><b>{t.wzYou}</b><small><span className="entry-journey">{title || t.wzMyJourney}</span> · {t.wzDayOne}</small></span>
              </div>
            </div>
            {(photoUrl || videoUrl) && (
              <div className="entry-media livre wz-preview-media" style={{ aspectRatio: '4 / 5' }}>
                {photoUrl
                  ? <img src={photoUrl} alt={t.wzPreviewPhotoAlt} />
                  : <video src={videoUrl} controls playsInline />}
              </div>
            )}
            {(first || hoje) && <div className="dp-text under wz-preview-text"><p className="entry-text">{first || hoje}</p></div>}
            <PreviewActions t={t} />
          </article>
          <button type="button" className="wz-preview-edit" onClick={voltar}>{t.wzBackEdit}</button>
        </div>
      )}

      {/* Privacidade: não é decisão do fluxo, mas ninguém pode ser
          publicado sem saber. Uma linha declara o que vai acontecer. */}
      {step === S_REV && (
        <div className="wz-priv-simple">
          <div className="wz-priv-options">{VIS.map(([v, l]) => <button type="button" key={v} className={visibility === v ? 'on' : ''} onClick={() => setVisibility(v)}>{l}</button>)}</div>
        </div>
      )}

      {rascunhoStatus && <p className="wz-draft-status" aria-live="polite">{rascunhoStatus}</p>}
      {ajErro && <p className="wz-aj-err">{ajErro}</p>}
      {organizando && <p className="wz-organizando" aria-live="polite">{t.wzOrganizing}</p>}
      {erro && <p className="wz-erro" role="alert">{erro}</p>}

      <div className={`wz-nav${step === STEPS - 1 ? ' wz-nav-final' : ''}`}>
        <button type="button" className="wz-back" onClick={voltar} disabled={step === 0 || saving}>
          {t.wizBack}
        </button>
        {step < STEPS - 1 ? (
          <>
            {/* Pular fica ao lado de Avançar, e não escondido: cada tela
                destas é um lugar onde alguém pode desistir do app inteiro. */}
            {step !== S_TITULO && (
              <button type="button" className="wz-skip" onClick={avancar}>{t.wzPular}</button>
            )}
            <button type="button" className="wz-go" onClick={avancar} disabled={!podeAvancar}>
              {t.wizNext}
            </button>
          </>
        ) : (
          <div className="wz-final-actions">
            <button type="button" className="wz-go" onClick={criar} disabled={saving || uploading}>
              {saving ? t.creating : (t.publishJourney || 'Publicar jornada')}
            </button>
            <button type="button" className="wz-draft-btn" onClick={salvarRascunhoESair} disabled={saving || uploading}>
              {t.wzDraftSave || 'Salvar e continuar depois'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
