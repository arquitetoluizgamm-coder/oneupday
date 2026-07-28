'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { track } from '../../lib/track';

const MAX_VIDEO = 60 * 1024 * 1024;

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
const STEPS = 6;
const S_TITULO = 0, S_PORQUE = 1, S_PRATICA = 2, S_PLANO = 3, S_HOJE = 4, S_REV = 5;

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

export default function NewJourneyForm({ userId, t, aiOn }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [pratica, setPratica] = useState('');
  const [frequencia, setFrequencia] = useState('');
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
  const [uploading, setUploading] = useState(false);

  // ---- estado da ajuda da IA, um por tela ----
  const [ajPergunta, setAjPergunta] = useState('');
  const [ajResposta, setAjResposta] = useState('');
  const [ajItens, setAjItens] = useState([]);
  const [ajBusy, setAjBusy] = useState('');
  const [ajErro, setAjErro] = useState('');
  const [organizando, setOrganizando] = useState(false);
  const [iaOrganizou, setIaOrganizou] = useState(false);

  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const router = useRouter();

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

  // Trocar de tela limpa a ajuda: sugestão de uma pergunta aparecendo
  // embaixo de outra é o tipo de coisa que faz a pessoa desconfiar do app.
  useEffect(() => { setAjPergunta(''); setAjResposta(''); setAjItens([]); setAjErro(''); }, [step]);

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
    [t.wzTRev, t.wzSRev],
  ];

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
        body: JSON.stringify({ modo: 'organizar', rascunho: title.trim(), porque: goal.trim(), pratica: frequencia.trim(), plano: plano.trim(), hoje: hoje.trim() }),
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
    if (step === S_HOJE) await organizarRascunho();
    irPara(step + 1);
  }
  function voltar() { if (step > 0) irPara(step - 1); }

  async function upload(file) {
    try {
      if (!file) return null;
      const supabase = createClient();
      const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
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
    setUploading(true); setErro('');
    try {
      const url = await upload(file);
      if (!url) { setErro(t.createError); return; }
      setPhotoUrl(url); setVideoUrl(null); if (videoRef.current) videoRef.current.value = '';
    } finally {
      setUploading(false);
    }
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

    track('journey_created', { slug, visibility });
    track('day1_posted', { slug });
    router.push(`/created/${slug}`);
    router.refresh();
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
          <input className="wz-input" value={frequencia} onChange={(e) => setFrequencia(e.target.value)}
            maxLength={80} placeholder={t.wzPraticaPh} autoFocus />
        </div>
      )}

      {/* ---------------- 4 · plano ---------------- */}
      {step === S_PLANO && (
        <div className="wz-body">
          <input className="wz-input" value={plano} onChange={(e) => setPlano(e.target.value)}
            maxLength={40} placeholder="Ex.: 30" autoFocus />
          <p className="wz-hint">A IA organiza o ritmo e a duração na revisão final.</p>
        </div>
      )}

      {/* ---------------- 5 · o primeiro passo ---------------- */}
      {step === S_HOJE && (
        <div className="wz-body">
          <div className="wz-line-area">
            <textarea className="wz-input wz-grow-input" value={hoje} onInput={crescerCampo} onChange={(e) => setHoje(e.target.value)}
              maxLength={400} rows={1} placeholder={t.wzHojePh} autoFocus />
          </div>
        </div>
      )}

      {/* ---------------- 7 · revisão ----------------
          Tudo editável, no lugar. Se a pessoa precisar voltar quatro
          telas para trocar uma palavra, ela publica errado ou desiste. */}
      {step === S_REV && (
        <div className="wz-body wz-rev">
          <div className={`wz-ai-status${iaOrganizou ? ' ready' : ''}`}>
            <span>{iaOrganizou ? 'Recomendação da IA pronta para editar' : 'A recomendação ainda não foi gerada'}</span>
            <button type="button" onClick={organizarRascunho} disabled={organizando}>
              {organizando ? (t.ajPensando || 'Organizando…') : (t.ajRetry || 'Tentar novamente')}
            </button>
          </div>
          <label className="wz-rev-campo">
            <span>{t.wzRevTitulo}</span>
            <textarea className="wz-input wz-grow-input" value={title} maxLength={80} rows={1}
              onInput={crescerCampo} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label className="wz-rev-campo">
            <span>{t.wzRevPorque}</span>
            <textarea className="wz-input wz-grow-input" value={goal} maxLength={300} rows={1}
              onInput={crescerCampo} onChange={(e) => setGoal(e.target.value)} />
          </label>

          <label className="wz-rev-campo">
            <span>{t.wzRevPratica}</span>
            <input className="wz-input" value={pratica} maxLength={120} onChange={(e) => setPratica(e.target.value)} />
          </label>

          <div className="wz-rev-linha">
            <span className="wz-rev-par"><b>{t.wzRevRitmo}</b> {ritmoTexto() || '—'}</span>
            <span className="wz-rev-par"><b>{t.wzRevTempo}</b> {totalDias()} {t.durDaysWord}</span>
          </div>

          <label className="wz-rev-campo">
            <span>{t.wzRevDia1}</span>
            <textarea className="wz-input wz-grow-input" value={first} maxLength={500} rows={1}
              onInput={crescerCampo} onChange={(e) => setFirst(e.target.value)} />
          </label>
          {(photoUrl || videoUrl) && (
            <div className="wz-media">
              {photoUrl ? <img src={photoUrl} alt="" /> : <video src={videoUrl} controls playsInline />}
            </div>
          )}

          <div className="wz-review-media">
            <span className="wz-label">{t.addPhoto} / {t.addVideo}</span>
            <div className="wz-chips">
              <button type="button" className={`wz-chip${photoUrl ? ' on' : ''}`}
                onClick={() => photoRef.current?.click()} disabled={uploading}>
                {uploading ? t.uploading : (photoUrl ? t.photoAdded : t.addPhoto)}
              </button>
              <button type="button" className={`wz-chip${videoUrl ? ' on' : ''}`}
                onClick={() => videoRef.current?.click()} disabled={uploading}>
                {uploading ? t.uploading : (videoUrl ? t.videoAdded : t.addVideo)}
              </button>
              <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPhoto} />
              <input ref={videoRef} type="file" accept="video/*" hidden onChange={onVideo} />
            </div>
          </div>

          <div className="wz-field">
            <span className="wz-label">{t.wzRevCat}</span>
            <div className="wz-chips">
              {CATS.map(([v, l]) => (
                <button type="button" key={v} className={`wz-chip${cat === v ? ' on' : ''}`}
                  onClick={() => { setCat(v); setCatTocada(true); }}>{l}</button>
              ))}
              <button type="button" className={`wz-chip${cat === 'other' ? ' on' : ''}`}
                onClick={() => { setCat('other'); setCatTocada(true); }}>{t.catOther}</button>
            </div>
            {cat === 'other' && (
              <input className="wz-input small" value={customCat} onChange={(e) => setCustomCat(e.target.value)}
                maxLength={24} placeholder={t.customCatPh} />
            )}
          </div>
        </div>
      )}

      {/* Privacidade: não é decisão do fluxo, mas ninguém pode ser
          publicado sem saber. Uma linha declara o que vai acontecer. */}
      {step === S_REV && (
        <div className={`wz-priv${privAberta ? ' aberta' : ''}`}>
          <div className="wz-priv-line">
            <span>{(t.wizPrivShort || '').replace('{v}', (VIS.find(([v]) => v === visibility) || [])[1] || '')}</span>
            <button type="button" onClick={() => setPrivAberta((v) => !v)}>{t.wizPrivChange}</button>
          </div>
          {privAberta && (
            <div className="wz-vis">
              {VIS.map(([v, l, sub]) => (
                <button type="button" key={v} className={`wz-opt${visibility === v ? ' on' : ''}`}
                  onClick={() => { setVisibility(v); setPrivAberta(false); }}>
                  <i aria-hidden="true" />
                  <span><b>{l}</b><em>{sub}</em></span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {ajErro && <p className="wz-aj-err">{ajErro}</p>}
      {organizando && <p className="wz-organizando" aria-live="polite">Organizando sua jornada…</p>}
      {erro && <p className="wz-erro" role="alert">{erro}</p>}

      <div className="wz-nav">
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
          <button type="button" className="wz-go" onClick={criar} disabled={saving || uploading}>
            {saving ? t.creating : t.createBtn}
          </button>
        )}
      </div>
    </div>
  );
}
