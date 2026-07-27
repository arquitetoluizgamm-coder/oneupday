'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import ImageCropper from './ImageCropper';

// ============================================================
// EDITAR JORNADA — um lugar só
//
// Antes as configurações da jornada moravam em dois controles com
// lógicas diferentes, lado a lado: um modal "Editar" (nome, motivo,
// capa) e um botão de privacidade que CICLAVA entre três estados a
// cada toque, sem mostrar as alternativas. Categoria e duração não
// podiam ser mudadas de jeito nenhum — o wizard obrigava a decidir
// e não havia volta.
//
// Agora tudo que define a jornada está nesta tela.
// ============================================================

const COLORS = {
  art: '#8A6A9B', body: '#5E6B55', health: '#6E8168', mind: '#5B7189',
  study: '#4A6076', work: '#10132D', money: '#6B7F5E', relationship: '#A8637A',
  creative: '#96523C', home: '#C16F54', habit: '#B3874A', life: '#84917A',
  other: '#7A7A72',
};

const PADROES = ['7', '30', '60', '100'];

export default function EditJourney({ journey, currentDay = 0, t }) {
  const L = t || {};
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState(journey.title || '');
  const [goal, setGoal] = useState(journey.goal || '');
  const [coverUrl, setCoverUrl] = useState(journey.cover_url || '');
  const [cat, setCat] = useState(journey.category || 'life');
  const [customCat, setCustomCat] = useState('');
  const [dur, setDur] = useState(String(journey.total_days || 30));
  const [customDur, setCustomDur] = useState('');
  const [vis, setVis] = useState(journey.visibility || (journey.is_public ? 'public' : 'private'));

  const [rawUrl, setRawUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);
  const router = useRouter();

  const CATS = [
    ['body', L.catBody], ['health', L.catHealth], ['mind', L.catMind], ['study', L.catStudy],
    ['work', L.catWork], ['money', L.catMoney], ['relationship', L.catRelationship],
    ['creative', L.catCreative], ['home', L.catHome], ['habit', L.catHabit], ['life', L.catLife],
  ];
  const DURS = [['7', L.dur7], ['30', L.dur30], ['60', L.dur60], ['100', L.dur100], ['other', L.durCustom]];
  const VIS = [
    ['public', L.pubPublic, L.pubPublicSub],
    ['followers', L.pubFollowers, L.pubFollowersSub],
    ['private', L.pubPrivate, L.pubPrivateSub],
  ];

  const diaAtual = Math.max(1, currentDay || 1);

  // sempre reabre com o estado real da jornada, nunca com o rascunho anterior
  function abrir() {
    setTitle(journey.title || '');
    setGoal(journey.goal || '');
    setCoverUrl(journey.cover_url || '');
    const c = journey.category || 'life';
    const conhecida = CATS.some(([v]) => v === c);
    setCat(conhecida ? c : 'other');
    setCustomCat(conhecida ? '' : c);
    const td = String(journey.total_days || 30);
    setDur(PADROES.includes(td) ? td : 'other');
    setCustomDur(PADROES.includes(td) ? '' : td);
    setVis(journey.visibility || (journey.is_public ? 'public' : 'private'));
    setErr('');
    setOpen(true);
  }

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
    if (error) { setErr(L.epErrSave); return; }
    setCoverUrl(sb.storage.from('photos').getPublicUrl(path).data.publicUrl);
  }

  async function save() {
    if (busy) return;
    setErr('');

    const cleanTitle = title.trim();
    if (!cleanTitle) { setErr(L.ejErrTitle); return; }

    const category = cat === 'other'
      ? (customCat.trim().toLowerCase() || 'other').slice(0, 24)
      : (cat || 'life');

    let total = dur === 'other'
      ? (parseInt(customDur || '0', 10) || 0)
      : parseInt(dur, 10);
    total = Math.min(730, Math.max(1, total || 30));

    // a meta não pode ficar menor que o dia já vivido: a barra passaria
    // de 100% e a pessoa veria progresso apagado sem ter parado nada
    if (total < diaAtual) {
      setErr((L.ejDurMin || '').replace('{d}', diaAtual));
      return;
    }

    setBusy(true);
    const sb = createClient();
    const patch = {
      title: cleanTitle,
      goal: goal.trim(),
      cover_url: coverUrl || null,
      category,
      cover_color: COLORS[category] || journey.cover_color || '#ff7a45',
      total_days: total,
      visibility: vis,
      is_public: vis === 'public',
    };

    let { error } = await sb.from('journeys').update(patch).eq('id', journey.id);
    // banco antigo pode não ter alguma coluna: tenta de novo sem as opcionais
    if (error && /cover_url|visibility|category|column/i.test(error.message || '')) {
      const { cover_url: _c, visibility: _v, ...basico } = patch;
      ({ error } = await sb.from('journeys').update(basico).eq('id', journey.id));
    }
    setBusy(false);
    if (error) { setErr(L.epErrSave); return; }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" className="view-link" onClick={abrir}>{L.ejBtn}</button>

      {open && (
        <div className="crop-modal" role="dialog" aria-modal="true"
          onClick={() => !busy && !rawUrl && setOpen(false)}>
          <div className="crop-modal-card ep-card ej-card" onClick={(e) => e.stopPropagation()}>
            {rawUrl ? (
              <ImageCropper src={rawUrl} aspects={[['card', 16 / 10]]}
                labels={{ use: L.cropUse, cancel: L.cropCancel, hint: L.cropHint, zoom: L.cropZoom }}
                onDone={onCropDone} onCancel={() => { URL.revokeObjectURL(rawUrl); setRawUrl(''); }} />
            ) : (
              <>
                <b className="ep-title">{L.ejTitle}</b>

                <div className="ej-scroll">
                  <label className="ep-field">{L.ejName}
                    <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
                  </label>

                  <label className="ep-field">{L.ejGoal}
                    <textarea className="ej-goal" value={goal} onChange={(e) => setGoal(e.target.value)}
                      maxLength={300} rows={3} />
                  </label>

                  {/* ---- capa ---- */}
                  <div className="ep-field">{L.ejCover}
                    <div className="ej-cover" style={coverUrl
                      ? { backgroundImage: `url(${coverUrl})` }
                      : { background: `linear-gradient(135deg, var(--night), ${journey.cover_color || '#84917A'})` }}>
                      <div className="ej-cover-actions">
                        <button type="button" className="ej-cover-btn" onClick={() => fileRef.current?.click()} disabled={busy}>
                          {coverUrl ? L.ejCoverChange : L.ejCoverAdd}
                        </button>
                        {coverUrl && (
                          <button type="button" className="ej-cover-btn ej-cover-del" onClick={() => setCoverUrl('')} disabled={busy}>
                            {L.ejCoverRemove}
                          </button>
                        )}
                      </div>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
                  </div>

                  {/* ---- categoria ---- */}
                  <div className="ep-field">{L.ejCategory}
                    <div className="ej-chips">
                      {CATS.map(([v, l]) => (
                        <button type="button" key={v} className={`wz-chip${cat === v ? ' on' : ''}`}
                          onClick={() => setCat(v)}>{l}</button>
                      ))}
                      <button type="button" className={`wz-chip${cat === 'other' ? ' on' : ''}`}
                        onClick={() => setCat('other')}>{L.catOther}</button>
                    </div>
                    {cat === 'other' && (
                      <input className="ej-small" value={customCat} onChange={(e) => setCustomCat(e.target.value)}
                        maxLength={24} placeholder={L.customCatPh} />
                    )}
                  </div>

                  {/* ---- duração ---- */}
                  <div className="ep-field">{L.ejDuration}
                    <div className="ej-chips">
                      {DURS.map(([v, l]) => (
                        <button type="button" key={v} className={`wz-chip${dur === v ? ' on' : ''}`}
                          onClick={() => setDur(v)}>{l}</button>
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

                  {/* ---- privacidade: as três opções à vista ---- */}
                  <div className="ep-field">{L.ejPrivacy}
                    <div className="wz-vis ej-vis">
                      {VIS.map(([v, l, sub]) => (
                        <button type="button" key={v} className={`wz-opt${vis === v ? ' on' : ''}`}
                          onClick={() => setVis(v)}>
                          <i aria-hidden="true" />
                          <span><b>{l}</b><em>{sub}</em></span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {err && <p className="ep-err" role="alert">{err}</p>}

                <div className="crop-actions">
                  <button type="button" className="ghost-btn" onClick={() => setOpen(false)} disabled={busy}>{L.epCancel}</button>
                  <button type="button" className="cta grow" onClick={save} disabled={busy}>{busy ? L.epSaving : L.epSave}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
