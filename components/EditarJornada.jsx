'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import ImageCropper from './ImageCropper';

// ============================================================
// EDITAR JORNADA — versão de página, sem modal
//
// Mesma lógica do antigo modal, só que aberta. O modal fazia
// sentido quando a edição era um detalhe dentro do perfil; agora
// a jornada tem página própria e o formulário é o conteúdo dela.
// ============================================================

const COLORS = {
  art: '#6c5ce7', body: '#0ea5e9', home: '#ff7a45', work: '#111827', life: '#16a34a',
  study: '#2563eb', health: '#16a34a', mind: '#6c5ce7', money: '#0e9f6e',
  relationship: '#f02f87', habit: '#ff7a45', creative: '#a855f7', other: '#8a8a8a',
};
const PADROES = ['7', '30', '60', '100'];

export default function EditarJornada({ journey, currentDay = 0, t }) {
  const L = t || {};
  const CATS = [
    ['body', L.catBody], ['health', L.catHealth], ['mind', L.catMind], ['study', L.catStudy],
    ['work', L.catWork], ['money', L.catMoney], ['relationship', L.catRelationship],
    ['creative', L.catCreative], ['home', L.catHome], ['habit', L.catHabit], ['life', L.catLife],
  ];
  const conhecida = CATS.some(([v]) => v === journey.category);
  const td = String(journey.total_days || 30);

  const [title, setTitle] = useState(journey.title || '');
  const [goal, setGoal] = useState(journey.goal || '');
  const [coverUrl, setCoverUrl] = useState(journey.cover_url || '');
  const [cat, setCat] = useState(conhecida ? journey.category : 'other');
  const [customCat, setCustomCat] = useState(conhecida ? '' : (journey.category || ''));
  const [dur, setDur] = useState(PADROES.includes(td) ? td : 'other');
  const [customDur, setCustomDur] = useState(PADROES.includes(td) ? '' : td);
  const [vis, setVis] = useState(journey.visibility || (journey.is_public ? 'public' : 'private'));

  const [rawUrl, setRawUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');
  const [salvo, setSalvo] = useState(false);
  const fileRef = useRef(null);
  const router = useRouter();

  const DURS = [['7', L.dur7], ['30', L.dur30], ['60', L.dur60], ['100', L.dur100], ['other', L.durCustom]];
  const VIS = [
    ['public', L.pubPublic, L.pubPublicSub],
    ['followers', L.pubFollowers, L.pubFollowersSub],
    ['private', L.pubPrivate, L.pubPrivateSub],
  ];
  const diaAtual = Math.max(1, currentDay || 1);

  function onPick(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl(URL.createObjectURL(file));
  }

  async function onCropDone(result) {
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl('');
    if (!result || result === 'original') return;
    setBusy(true);
    const sb = createClient();
    const path = `covers/${journey.id}/${crypto.randomUUID()}.jpg`;
    const { error } = await sb.storage.from('photos').upload(path, result, { upsert: false });
    setBusy(false);
    if (error) { setErro(L.epErrSave); return; }
    setCoverUrl(sb.storage.from('photos').getPublicUrl(path).data.publicUrl);
  }

  async function salvar() {
    if (busy) return;
    setErro(''); setSalvo(false);

    const cleanTitle = title.trim();
    if (!cleanTitle) { setErro(L.ejErrTitle); return; }

    const category = cat === 'other'
      ? (customCat.trim().toLowerCase() || 'other').slice(0, 24)
      : (cat || 'life');

    let total = dur === 'other' ? (parseInt(customDur || '0', 10) || 0) : parseInt(dur, 10);
    total = Math.min(730, Math.max(1, total || 30));

    // a meta não pode ficar menor que o dia já vivido: a barra passaria de
    // 100% e a pessoa veria progresso apagado sem ter parado nada
    if (total < diaAtual) { setErro((L.ejDurMin || '').replace('{d}', diaAtual)); return; }

    setBusy(true);
    const sb = createClient();
    const patch = {
      title: cleanTitle, goal: goal.trim(), cover_url: coverUrl || null,
      category, cover_color: COLORS[category] || journey.cover_color || '#ff7a45',
      total_days: total, visibility: vis, is_public: vis === 'public',
    };
    let { error } = await sb.from('journeys').update(patch).eq('id', journey.id);
    if (error && /cover_url|visibility|category|column/i.test(error.message || '')) {
      const { cover_url: _c, visibility: _v, ...basico } = patch;
      ({ error } = await sb.from('journeys').update(basico).eq('id', journey.id));
    }
    setBusy(false);
    if (error) { setErro(L.epErrSave); return; }
    setSalvo(true);
    router.refresh();
  }

  if (rawUrl) {
    return (
      <div className="ej-page">
        <ImageCropper src={rawUrl} aspects={[['card', 16 / 10]]}
          labels={{ use: L.cropUse, cancel: L.cropCancel, hint: L.cropHint, zoom: L.cropZoom }}
          onDone={onCropDone} onCancel={() => { URL.revokeObjectURL(rawUrl); setRawUrl(''); }} />
      </div>
    );
  }

  return (
    <div className="ej-page">
      <label className="ep-field">{L.ejName}
        <input value={title} onChange={(e) => { setTitle(e.target.value); setSalvo(false); }} maxLength={80} />
      </label>

      <label className="ep-field">{L.ejGoal}
        <textarea className="ej-goal" value={goal} onChange={(e) => { setGoal(e.target.value); setSalvo(false); }}
          maxLength={300} rows={3} />
      </label>

      <div className="ep-field">{L.ejCover}
        <div className="ej-cover" style={coverUrl
          ? { backgroundImage: `url(${coverUrl})` }
          : { background: `linear-gradient(135deg, var(--night), ${journey.cover_color || '#84917A'})` }}>
          <div className="ej-cover-actions">
            <button type="button" className="ej-cover-btn" onClick={() => fileRef.current?.click()} disabled={busy}>
              {coverUrl ? L.ejCoverChange : L.ejCoverAdd}
            </button>
            {coverUrl && (
              <button type="button" className="ej-cover-btn ej-cover-del" onClick={() => { setCoverUrl(''); setSalvo(false); }} disabled={busy}>
                {L.ejCoverRemove}
              </button>
            )}
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
      </div>

      <div className="ep-field">{L.ejCategory}
        <div className="ej-chips">
          {CATS.map(([v, l]) => (
            <button type="button" key={v} className={`wz-chip${cat === v ? ' on' : ''}`}
              onClick={() => { setCat(v); setSalvo(false); }}>{l}</button>
          ))}
          <button type="button" className={`wz-chip${cat === 'other' ? ' on' : ''}`}
            onClick={() => { setCat('other'); setSalvo(false); }}>{L.catOther}</button>
        </div>
        {cat === 'other' && (
          <input className="ej-small" value={customCat} onChange={(e) => setCustomCat(e.target.value)}
            maxLength={24} placeholder={L.customCatPh} />
        )}
      </div>

      <div className="ep-field">{L.ejDuration}
        <div className="ej-chips">
          {DURS.map(([v, l]) => (
            <button type="button" key={v} className={`wz-chip${dur === v ? ' on' : ''}`}
              onClick={() => { setDur(v); setSalvo(false); }}>{l}</button>
          ))}
        </div>
        {dur === 'other' && (
          <div className="ej-num">
            <input type="number" min={diaAtual} max="730" value={customDur}
              onChange={(e) => setCustomDur(e.target.value)} placeholder={L.durCustomPh} />
            <span>{L.durDaysWord}</span>
          </div>
        )}
        <p className="ej-note">{L.ejDurNote}</p>
      </div>

      <div className="ep-field">{L.ejPrivacy}
        <div className="wz-vis ej-vis">
          {VIS.map(([v, l, sub]) => (
            <button type="button" key={v} className={`wz-opt${vis === v ? ' on' : ''}`}
              onClick={() => { setVis(v); setSalvo(false); }}>
              <i aria-hidden="true" />
              <span><b>{l}</b><em>{sub}</em></span>
            </button>
          ))}
        </div>
      </div>

      {erro && <p className="ep-err" role="alert">{erro}</p>}

      <button type="button" className="cta grow ej-salvar" onClick={salvar} disabled={busy}>
        {busy ? L.epSaving : (salvo ? L.ejSaved : L.epSave)}
      </button>
    </div>
  );
}
