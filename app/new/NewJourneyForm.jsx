'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { track } from '../../lib/track';

const MAX_VIDEO = 60 * 1024 * 1024;
const STEPS = 3;

const COLORS = {
  art: '#8A6A9B', body: '#5E6B55', health: '#6E8168', mind: '#5B7189',
  study: '#4A6076', work: '#10132D', money: '#6B7F5E', relationship: '#A8637A',
  creative: '#96523C', home: '#C16F54', habit: '#B3874A', life: '#84917A',
  other: '#7A7A72',
};

// Adivinha a categoria pelo título. A pessoa pode trocar,
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

export default function NewJourneyForm({ userId, t }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  const [title, setTitle] = useState('');
  const [dur, setDur] = useState('30');
  const [customDur, setCustomDur] = useState('');
  const [goal, setGoal] = useState('');
  const [cat, setCat] = useState('');
  const [catTocada, setCatTocada] = useState(false);
  const [customCat, setCustomCat] = useState('');
  const [first, setFirst] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [privAberta, setPrivAberta] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

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
  const VIS = [
    ['public', t.pubPublic, t.pubPublicSub],
    ['followers', t.pubFollowers, t.pubFollowersSub],
    ['private', t.pubPrivate, t.pubPrivateSub],
  ];

  useEffect(() => {
    if (catTocada) return;
    const g = adivinhar(title);
    if (g) setCat(g);
  }, [title, catTocada]); // eslint-disable-line react-hooks/exhaustive-deps

  const heads = [
    [t.wizT1, t.wizS1],
    [t.wizT3, t.wizS3],
    [t.wizT4, t.wizS4],
  ];

  // O motivo deixa de ser obrigatorio. Quem chega com pressa nao sabe
  // responder "por que isso importa" — e travar aqui perde a pessoa
  // justamente no momento em que ela decidiu comecar.
  const podeAvancar =
    (step === 0 && title.trim().length >= 2 && (dur !== 'other' || parseInt(customDur || '0', 10) > 0)) ||
    step === 1 ||
    step === 2;

  function irPara(n) {
    setErro('');
    setStep(n);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function avancar() { if (podeAvancar && step < STEPS - 1) irPara(step + 1); }
  function voltar() { if (step > 0) irPara(step - 1); }

  async function upload(file) {
    const supabase = createClient();
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: false });
    if (error) return null;
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
  }
  async function onPhoto(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); const url = await upload(file); setUploading(false);
    if (!url) { setErro(t.createError); return; }
    setPhotoUrl(url); setVideoUrl(null); if (videoRef.current) videoRef.current.value = '';
  }
  async function onVideo(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > MAX_VIDEO) { setErro(t.videoTooBig); e.target.value = ''; return; }
    setUploading(true); const url = await upload(file); setUploading(false);
    if (!url) { setErro(t.createError); return; }
    setVideoUrl(url); setPhotoUrl(null); if (photoRef.current) photoRef.current.value = '';
  }

  // Só cria quando a pessoa toca no botão da última tela.
  // Não existe <form>: nada aqui pode enviar sozinho.
  async function criar() {
    if (saving || uploading || step !== STEPS - 1) return;
    setSaving(true); setErro('');

    const category = cat === 'other'
      ? (customCat.trim().toLowerCase() || 'other').slice(0, 24)
      : (cat || 'life');
    const total_days = dur === 'other'
      ? Math.min(730, Math.max(1, parseInt(customDur || '30', 10) || 30))
      : parseInt(dur, 10);

    const supabase = createClient();
    const slug = slugify(title);
    const payload = {
      owner_id: userId, slug, title: title.trim(), category, goal: goal.trim(), total_days,
      cover_color: COLORS[category] || '#ff7a45', is_public: visibility === 'public', visibility,
    };

    let { data: journey, error } = await supabase.from('journeys').insert(payload).select().single();
    if (error && /visibility|column/i.test(error.message || '')) {
      const { visibility: _v, ...semVis } = payload;
      ({ data: journey, error } = await supabase.from('journeys').insert(semVis).select().single());
    }
    if (error || !journey) { setSaving(false); setErro(t.createError); return; }

    // O dia 1 nunca pode faltar: sem ele a jornada não aparece no feed.
    const texto = first.trim() || (photoUrl ? '\u{1F4F7}' : (videoUrl ? '\u{1F3A5}' : (t.firstDayDefault || 'Comecei.')));
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

  // Prévia: a jornada vai se montando à medida que a pessoa escreve.
  const totalPreview = dur === 'other' ? (parseInt(customDur || '0', 10) || 0) : parseInt(dur, 10);
  const catLabel = cat === 'other'
    ? (customCat.trim() || t.catOther)
    : (CATS.find(([v]) => v === cat) || [])[1];

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
        <p>{heads[step][1]}</p>
      </div>

      {/* a jornada nascendo — cresce a cada tela */}
      {title.trim() && (
        <aside className="wz-prev" aria-hidden="true">
          <span className="wz-prev-tag">{t.wizPreview}</span>
          <b className="wz-prev-title">{title.trim()}</b>
          {totalPreview > 0 && (
            <div className="wz-prev-line">
              <span className="wz-prev-dots">
                {Array.from({ length: Math.min(totalPreview, 12) }).map((_, i) => (
                  <i key={i} className={i === 0 ? 'on' : ''} />
                ))}
              </span>
              <em>{(t.dayXofY || 'Dia {d} de {t}').replace('{d}', 1).replace('{t}', totalPreview)}</em>
            </div>
          )}
          {step >= 1 && goal.trim() && <q className="wz-prev-why">{goal.trim()}</q>}
          {step >= 1 && catLabel && <span className="wz-prev-cat">{catLabel}</span>}
          {step >= 2 && (first.trim() || photoUrl) && (
            <div className="wz-prev-day">
              {photoUrl && <img src={photoUrl} alt="" />}
              {first.trim() && <p>{first.trim()}</p>}
            </div>
          )}
        </aside>
      )}

      {/* ---------------- 1 · o que e por quanto tempo ---------------- */}
      {step === 0 && (
        <div className="wz-body">
          <input className="wz-input" value={title} onChange={(e) => setTitle(e.target.value)}
            maxLength={80} placeholder={t.fNamePh} autoFocus />

          {!title.trim() && sugestoes.length > 0 && (
            <div className="wz-sugs">
              {sugestoes.map((sg, i) => (
                <button type="button" key={i} className="wz-sug" onClick={() => setTitle(sg)}>{sg}</button>
              ))}
            </div>
          )}

          <div className="wz-field">
            <span className="wz-label">{t.fDuration}</span>
            <div className="wz-chips">
              {DURS.map(([v, l]) => (
                <button type="button" key={v} className={`wz-chip${dur === v ? ' on' : ''}`} onClick={() => setDur(v)}>{l}</button>
              ))}
            </div>
            {dur === 'other' && (
              <div className="wz-num">
                <input type="number" min="1" max="730" value={customDur}
                  onChange={(e) => setCustomDur(e.target.value)} placeholder={t.durCustomPh} />
                <span>{t.durDaysWord}</span>
              </div>
            )}
            <p className="wz-hint">{t.durHint}</p>
          </div>
        </div>
      )}

      {/* ---------------- 2 · por que importa ---------------- */}
      {step === 1 && (
        <div className="wz-body">
          <div className="wz-area">
            <textarea value={goal} onChange={(e) => setGoal(e.target.value)}
              maxLength={300} rows={5} placeholder={t.fWhyPh} autoFocus />
            <span className="wz-opcional">{t.wizWhyOptional}</span>
            <span className="wz-inline-count">{goal.length}/300</span>
          </div>
          <p className="wz-hint">{t.wizWhyNote}</p>

          <div className="wz-field">
            <span className="wz-label">{t.fCategory}</span>
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

      {/* ---------------- 3 · o primeiro dia ---------------- */}
      {step === 2 && (
        <div className="wz-body">
          <div className="wz-area">
            <textarea value={first} onChange={(e) => setFirst(e.target.value)}
              maxLength={500} rows={4} placeholder={t.fFirstPh} autoFocus />
          </div>

          {photoUrl && <div className="wz-media"><img src={photoUrl} alt="" /></div>}
          {videoUrl && <div className="wz-media"><video src={videoUrl} controls playsInline /></div>}

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
      )}

      {/* Privacidade: nao e uma decisao do fluxo, mas ninguem pode ser
          publicado sem saber. Uma linha declara o que vai acontecer e
          abre as tres opcoes so para quem quiser mexer. */}
      {step === STEPS - 1 && (
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

      {erro && <p className="wz-erro" role="alert">{erro}</p>}

      <div className="wz-nav">
        <button type="button" className="wz-back" onClick={voltar} disabled={step === 0 || saving}>
          {t.wizBack}
        </button>
        {step < STEPS - 1 ? (
          <button type="button" className="wz-go" onClick={avancar} disabled={!podeAvancar}>
            {t.wizNext}
          </button>
        ) : (
          <button type="button" className="wz-go" onClick={criar} disabled={saving || uploading}>
            {saving ? t.creating : t.createBtn}
          </button>
        )}
      </div>
    </div>
  );
}
