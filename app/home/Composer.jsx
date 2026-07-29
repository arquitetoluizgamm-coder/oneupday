'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { ALT_MAX } from '../../lib/alt';
import { perguntasDoDia } from '../../lib/perguntas';
import TrackPicker from './TrackPicker';
import ImageCropper from '../../components/ImageCropper';
import { track as trackEvent } from '../../lib/track';
import CampoMencao from '../../components/CampoMencao';
import { salvarMencoes } from '../../lib/mencoes';

// Frases que podem indicar sofrimento intenso — mostra apoio, nunca bloqueia.
const RISK = [
  'nao aguento mais', 'não aguento mais', 'quero morrer', 'não quero mais viver', 'nao quero mais viver',
  'me matar', 'tirar minha vida', 'acabar com tudo', 'quero sumir', 'quero desaparecer', 'me machucar',
  'sem saida', 'sem saída', 'desistir de tudo', 'nao vale a pena viver', 'não vale a pena viver',
  'i want to die', 'kill myself', 'end it all', 'hurt myself', 'cant go on', "can't go on", 'no reason to live',
];
function looksRisky(t) {
  const x = (t || '').toLowerCase();
  return RISK.some(w => x.includes(w));
}
const MAX_VIDEO = 60 * 1024 * 1024; // 60MB

function ToolIcon({ type }) {
  const paths = {
    photo: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8" cy="9" r="1.4" /><path d="m4 17 4.5-4 3 2.5 2.2-2 6.3 5.5" /></>,
    video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3z" /></>,
    ai: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6z" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>;
}

export default function Composer({ journeyId, startDate, labels, t, aiOn }) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState('');
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  // Descrição da foto para quem não enxerga. Rascunho da IA,
  // decisão da pessoa: o campo abre preenchido e editável.
  const [alt, setAlt] = useState('');
  const [altBusy, setAltBusy] = useState(false);
  // A pergunta acima do campo. `situacao` vem do banco (último
  // registro e passo em aberto); `daIA` é a camada de assunto, que
  // pode simplesmente não chegar.
  const [situacao, setSituacao] = useState({});
  const [daIA, setDaIA] = useState([]);
  const [qi, setQi] = useState(0);
  const [track, setTrack] = useState(null);
  const [aiErr, setAiErr] = useState('');
  const [posted, setPosted] = useState(false);
  const [postedKind, setPostedKind] = useState('step');
  const [envText, setEnvText] = useState('');
  const [envBusy, setEnvBusy] = useState(false);
  const [lastId, setLastId] = useState(null);
  const [quando, setQuando] = useState('');
  const [rawFile, setRawFile] = useState(null);
  const [rawUrl, setRawUrl] = useState('');
  const [extrasOpen, setExtrasOpen] = useState(false);
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const el = inputRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 220) + 'px'; }
  }, [text]);

  // ============================================================
  // DE ONDE VEM A PERGUNTA
  //
  // Uma consulta só, no carregamento: o último registro desta
  // jornada. Dele saem as duas coisas que tornam a pergunta
  // específica — se ontem foi um dia difícil, e se ficou um passo
  // combinado sem resposta.
  //
  // A camada de assunto (a IA) vem em seguida e é opcional. Ela
  // roda uma vez por montagem, não a cada tecla.
  // ============================================================
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const sb = createClient();
        const { data: ultimo } = await sb.from('updates')
          .select('kind, next_step, closed_by')
          .eq('journey_id', journeyId)
          .order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (!vivo || !ultimo) return;
        setSituacao({
          ultimoKind: ultimo.kind,
          // só conta como aberto o passo que ainda não foi fechado
          passoAberto: ultimo.closed_by ? '' : (ultimo.next_step || ''),
        });
      } catch {}
    })();
    return () => { vivo = false; };
  }, [journeyId]);

  useEffect(() => {
    if (!aiOn) return;
    let vivo = true;
    (async () => {
      try {
        const r = await fetch('/api/perguntas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ journeyId }) });
        if (!r.ok) return;
        const d = await r.json();
        if (vivo && Array.isArray(d.perguntas) && d.perguntas.length) setDaIA(d.perguntas);
      } catch {}
    })();
    return () => { vivo = false; };
  }, [journeyId, aiOn]);


  async function upload(file, extOverride) {
    try {
      if (!file) return null;
      const supabase = createClient();
      const ext = (extOverride || file.name?.split('.').pop() || 'bin').toLowerCase();
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const path = `${journeyId}/${id}.${ext}`;
      const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: false });
      if (error) { console.error('[upload] storage:', error); return null; }
      return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
    } catch (error) {
      console.error('[upload] unexpected:', error);
      return null;
    }
  }

  function onPickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawFile(file);
    setRawUrl(URL.createObjectURL(file));
  }
  async function onCropDone(result) {
    let toUpload, ext;
    if (result === 'original' || !result) { toUpload = rawFile; ext = (rawFile?.name.split('.').pop() || 'jpg').toLowerCase(); }
    else { toUpload = result; ext = 'jpg'; }
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl('');
    if (!toUpload) return;
    setUploading(true);
    try {
      const url = await upload(toUpload, ext);
      if (!url) { alert(t.error); return; }
      setPhotoUrl(url); setVideoUrl(null);
      if (videoRef.current) videoRef.current.value = '';
      descrever(url);
    } finally {
      setUploading(false);
    }
  }
  // O rascunho da descrição. Falhar aqui não custa nada: sem
  // chave, sem rede ou com o modelo fora do ar, o campo fica
  // vazio e a exibição usa a reserva factual de lib/alt.js.
  async function descrever(url) {
    setAlt('');
    setAltBusy(true);
    try {
      const r = await fetch('/api/alt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      if (r.ok) { const d = await r.json(); if (d.alt) setAlt(d.alt); }
    } catch {}
    setAltBusy(false);
  }

  function onCropCancel() {
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl('');
    if (!photoUrl) { setRawFile(null); if (photoRef.current) photoRef.current.value = ''; }
  }
  function reframe() { if (rawFile) setRawUrl(URL.createObjectURL(rawFile)); }

  async function onPickVideo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_VIDEO) { alert(t.videoTooBig); e.target.value = ''; return; }
    setUploading(true);
    try {
      const url = await upload(file);
      if (!url) { alert(t.error); return; }
      setVideoUrl(url); setPhotoUrl(null); setAlt('');
      if (photoRef.current) photoRef.current.value = '';
    } finally {
      setUploading(false);
    }
  }

  async function aiSoftWrite() { await aiWrite(); }
  async function aiSmallStep() {
    if (saving || uploading) return;
    setSaving(true); setAiErr('');
    try {
      const r = await fetch('/api/assist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'nextstep', journeyId, draft: text }) });
      if (r.status === 429) { setAiErr(t.aiRateErr); setSaving(false); return; }
      if (!r.ok) { setAiErr(t.aiErr); setSaving(false); return; }
      const j = await r.json();
      if (j.text) setText(j.text); else setAiErr(t.aiErr);
    } catch { setAiErr(t.aiErr); }
    setSaving(false);
  }

  async function aiWrite() {
    if (saving || uploading) return;
    setSaving(true); setAiErr('');
    try {
      const r = await fetch('/api/assist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'write', journeyId, draft: text }) });
      if (r.status === 429) { setAiErr(t.aiRateErr); setSaving(false); return; }
      if (!r.ok) { setAiErr(t.aiErr); setSaving(false); return; }
      const j = await r.json();
      if (j.text) setText(j.text); else setAiErr(t.aiErr);
    } catch { setAiErr(t.aiErr); }
    setSaving(false);
  }

  // ============================================================
  // O BOTÃO NÃO ESCREVE MAIS NO LUGAR DA PESSOA
  //
  // Antes ele gravava uma frase pronta — "Fiz o que eu tinha pra
  // fazer hoje." — e o feed publicava aquilo como se fosse relato
  // dela. Cinco pessoas apertando o mesmo botão produziam a mesma
  // frase cinco vezes. Era o app escrevendo, não elas.
  //
  // Agora o botão grava só o FATO: o `kind`. O dia continua
  // contando igual — sequência, progresso, marco, tudo olha para
  // o registro existir, não para o texto. No feed isso aparece
  // como selo, que se lê como marca e não como voz.
  //
  // Texto vazio, e não NULL, porque há telas que fazem
  // `u.text.slice()` sem guarda.
  // ============================================================
  async function quick(kind) {
    // O ritual escolhe o estado; a publicação só acontece depois da edição
    // e da confirmação no botão "Postar".
    if (saving || uploading) return;
    setKind(kind);
    setAiErr('');
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  // fecha o capítulo aberto do dia anterior desta jornada
  async function fecharCapituloAnterior(sb, novoId) {
    try {
      const { data: aberto } = await sb.from('updates')
        .select('id').eq('journey_id', journeyId)
        .not('next_step', 'is', null).is('closed_by', null)
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (aberto && aberto.id && aberto.id !== novoId) {
        await sb.from('updates').update({ closed_by: novoId }).eq('id', aberto.id);
      }
    } catch {}
  }

  async function post() {
    const value = text.trim();
    if (!kind || (!value && !photoUrl && !videoUrl) || saving) return;
    setSaving(true);
    const supabase = createClient();
    const fallback = photoUrl ? '📷' : (videoUrl ? '🎥' : '');
    const row = {
      journey_id: journeyId, day_number: dayNumber, kind,
      text: value || fallback, photo_url: photoUrl, video_url: videoUrl,
    };
    if (photoUrl && alt.trim()) row.alt = alt.trim().slice(0, ALT_MAX);
    if (track) { row.track_title = track.title; row.track_artist = track.artist; row.track_audio_url = track.audio_url; }
    let { data: novo, error } = await supabase.from('updates').insert(row).select('id').maybeSingle();
    // Se o supabase/alt-imagem.sql ainda não foi rodado, a coluna não
    // existe e o insert falha inteiro. Publicar é a ação central do app:
    // ela não pode morrer por causa de um campo de acessibilidade.
    // Tenta de novo sem a descrição e avisa no console, não na cara da pessoa.
    if (error && /alt/.test(error.message || '') && row.alt) {
      console.warn('[alt] coluna ausente — rode supabase/alt-imagem.sql');
      const semAlt = { ...row }; delete semAlt.alt;
      ({ data: novo, error } = await supabase.from('updates').insert(semAlt).select('id').maybeSingle());
    }
    setSaving(false);
    if (error) { alert(t.error); return; }
    if (novo?.id) {
      setLastId(novo.id);
      await fecharCapituloAnterior(supabase, novo.id);
      // As menções são gravadas DEPOIS e sem travar o post. Se a
      // tabela `mentions` ainda não existir (supabase/mencoes.sql não
      // rodado), `salvarMencoes` engole o erro: publicar o dia é a
      // ação central do app e não pode morrer por causa de um extra.
      const { data: { user: eu } } = await supabase.auth.getUser();
      if (eu) await salvarMencoes(supabase, { texto: row.text, autorId: eu.id, alvo: { update_id: novo.id } });
    }
    trackEvent('update_posted', { journeyId, kind });
    setPostedKind(kind);
    try { localStorage.removeItem(`oud-day-draft:${journeyId}:${dayNumber}`); } catch {}
    setText(''); setKind(''); setPhotoUrl(null); setVideoUrl(null); setTrack(null); setAlt(''); setQi(0);
    if (photoRef.current) photoRef.current.value = '';
    if (videoRef.current) videoRef.current.value = '';
    setPosted(true);
  }

  async function doneEnvelope(save) {
    if (envBusy) return;
    setEnvBusy(true);
    const passo = envText.trim().slice(0, 200);
    if (save && passo) {
      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        // carta pra si (o Próximo Capítulo continua funcionando)
        if (user) await sb.from('envelopes').insert({ user_id: user.id, journey_id: journeyId, text: passo });
        // e o mesmo passo fica visível no post, abrindo o capítulo
        if (lastId) await sb.from('updates').update({ next_step: passo, next_when: quando || null }).eq('id', lastId);
      } catch {}
    }
    setEnvBusy(false);
    setPosted(false); setEnvText(''); setQuando(''); setLastId(null);
    router.refresh();
  }

  const showCare = looksRisky(text);
  const dayNumber = Math.max(1, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000) + 1);
  // situação primeiro, assunto depois: "você conseguiu comprar a
  // garrafa que combinou ontem?" ganha de qualquer pergunta sobre água.
  const perguntas = [...perguntasDoDia({ dia: dayNumber, ...situacao }, t), ...daIA];
  const pergunta = perguntas.length ? perguntas[qi % perguntas.length] : '';
  const ph = t.placeholder.replace('{n}', dayNumber);
  const draftKey = `oud-day-draft:${journeyId}:${dayNumber}`;
  const kindText = kind === 'win' ? t.rDid : (kind === 'setback' ? t.rPaused : (kind === 'step' ? t.rTried : ''));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d?.text) setText(String(d.text).slice(0, 500));
      if (['win', 'step', 'setback'].includes(d?.kind)) setKind(d.kind);
    } catch {}
  }, [draftKey]);

  useEffect(() => {
    try {
      const value = text.trim();
      if (!value && !kind) localStorage.removeItem(draftKey);
      else localStorage.setItem(draftKey, JSON.stringify({ text: value, kind, savedAt: Date.now() }));
    } catch {}
  }, [draftKey, text, kind]);

  if (posted) {
    return (
      <div className="composer2 env-box">
        <p className="env-meaning">{dayNumber === 1 ? t.meaning?.first : (postedKind === 'setback' ? t.meaning?.setback : t.meaning?.step)}</p>
        <span className="env-eyebrow">{t.step?.q}</span>
        <textarea className="env-input" value={envText} onChange={e => setEnvText(e.target.value)}
          maxLength={200} placeholder={t.step?.ph} rows={2} autoFocus />
        {envText.trim() && (
          <>
            <span className="step-when-q">{t.step?.whenQ}</span>
            <div className="step-when">
              {(t.step?.whens || []).map((w, i) => (
                <button type="button" key={i} className={`when-chip${quando === w ? ' on' : ''}`}
                  onClick={() => setQuando(quando === w ? '' : w)}>{w}</button>
              ))}
            </div>
          </>
        )}
        <p className="step-note">{t.step?.note}</p>
        <div className="env-actions">
          <button type="button" className="ghost-btn" onClick={() => doneEnvelope(false)} disabled={envBusy}>{t.env?.skip}</button>
          <button type="button" className="cta" onClick={() => doneEnvelope(true)} disabled={envBusy || !envText.trim()}>{t.step?.save}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="composer2">
      <div className="day-ritual-head">
        <img src="/upi.svg" alt="" aria-hidden="true" />
        <div>
          <b>{t.dayRegisterTitle || t.ritualQ}</b>
          <p>{t.dayRegisterSub || ''}</p>
        </div>
      </div>
      <div className="ritual">
        <span className="ritual-q">{t.ritualQ}</span>
        <div className="ritual-btns">
          <button type="button" className={`ritual-btn did${kind === 'win' ? ' selected' : ''}`} onClick={() => quick('win')} aria-pressed={kind === 'win'} disabled={saving || uploading}>{t.rDid}</button>
          <button type="button" className={`ritual-btn tried${kind === 'step' ? ' selected' : ''}`} onClick={() => quick('step')} aria-pressed={kind === 'step'} disabled={saving || uploading}>{t.rTried}</button>
          <button type="button" className={`ritual-btn paused${kind === 'setback' ? ' selected' : ''}`} onClick={() => quick('setback')} aria-pressed={kind === 'setback'} disabled={saving || uploading}>{t.rPaused}</button>
        </div>
      </div>
      {kind && (
        <p className="ritual-picked">
          {(t.dayPicked || 'Escolhido: {kind}. Agora conte em uma frase.').replace('{kind}', kindText)}
        </p>
      )}
      {showCare && (
        <div className="care-box" role="note">
          <b>{t.crisisTitle}</b>
          <p>{t.crisisText}</p>
        </div>
      )}
      {/* A PERGUNTA FICA ACIMA E NUNCA ENTRA NO CAMPO.
          Os chips antigos faziam setText(chip + ' '): a frase do app ia
          publicada como se fosse o começo da frase da pessoa. Aqui ela é
          pergunta — quem responde é ela, com as palavras dela. */}
      {pergunta && (
        <div className="perg-linha">
          <p className="perg-texto" id="perg-do-dia">{pergunta}</p>
          {perguntas.length > 1 && (
            <button type="button" className="perg-outra" onClick={() => { setQi((v) => v + 1); inputRef.current?.focus(); }}>
              {t.pergOutra}
            </button>
          )}
        </div>
      )}
      {/* O Enter aqui publica. Mas enquanto a lista de @ está aberta,
          quem manda no Enter é o CampoMencao: escolher a pessoa não
          pode publicar o registro sem querer. Por isso o onKeyDown de
          publicar checa se a lista está aberta antes de agir. */}
      <CampoMencao textareaRef={inputRef} className="composer2-input" valor={text}
        onChange={e => setText(e.target.value)}
        maxLength={500} placeholder={kind ? (pergunta || ph) : (t.dayChooseFirst || ph)} rows={1}
        aria-describedby={pergunta ? 'perg-do-dia' : undefined}
        onKeyDown={e => {
          if (e.defaultPrevented) return;
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); post(); }
        }} />
      {photoUrl && (
        <div className="photo-preview">
          <img src={photoUrl} alt={alt} />
          {rawFile && <button type="button" className="tiny-link" onClick={reframe}>{(t.crop || {}).edit || 'Editar enquadramento'}</button>}
        </div>
      )}
      {/* A descrição fica VISÍVEL, não escondida atrás de um botão
          "acessibilidade". Quem publica precisa ver o que vai ser dito
          sobre a foto dela — inclusive para discordar. */}
      {photoUrl && (
        <div className="alt-campo">
          <label htmlFor="alt-foto">{t.altLabel}</label>
          <textarea id="alt-foto" value={alt} maxLength={ALT_MAX} rows={2}
            placeholder={altBusy ? t.altPensando : t.altPh}
            onChange={(e) => setAlt(e.target.value)} />
          <span className="alt-dica">{alt.trim() ? t.altOk : t.altVazio}</span>
        </div>
      )}
      {videoUrl && <div className="photo-preview"><video src={videoUrl} controls playsInline /></div>}
      {rawUrl && (
        <div className="crop-modal" role="dialog" aria-modal="true">
          <div className="crop-modal-card">
            {/* O compositor só oferecia 4:3, e o recorte aqui é DESTRUTIVO:
                o arquivo sobe já cortado. Toda foto de dia postada até agora
                virou 4:3 no arquivo — nenhum CSS traz de volta. Agora abre em
                "original" e o corte é escolha, não obrigação. */}
            <ImageCropper src={rawUrl} labels={t.crop || {}}
              aspects={[['original', null], ['portrait', 4 / 5], ['square', 1], ['landscape', 16 / 9]]}
              onDone={onCropDone} onCancel={onCropCancel} />
          </div>
        </div>
      )}

      <div className="composer-extra">
        <button type="button" className="composer-extra-toggle" onClick={() => setExtrasOpen((v) => !v)} aria-expanded={extrasOpen}>
          <span>{extrasOpen ? (t.extraHide || 'Esconder opções') : (t.extraShow || 'Adicionar foto, vídeo, música ou ajuda')}</span>
          <b aria-hidden="true">{extrasOpen ? '−' : '+'}</b>
        </button>
      </div>
      <div className={`composer-toolbar composer-extra-panel${extrasOpen ? ' open' : ''}`}>
        <div className="tools">
          <button type="button" className={`tool${photoUrl ? ' set' : ''}`} title={t.addPhoto} aria-label={t.addPhoto} onClick={() => photoRef.current?.click()} disabled={uploading}><ToolIcon type="photo" /></button>
          <button type="button" className={`tool${videoUrl ? ' set' : ''}`} title={t.addVideo} aria-label={t.addVideo} onClick={() => videoRef.current?.click()} disabled={uploading}><ToolIcon type="video" /></button>
          <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPickPhoto} />
          <input ref={videoRef} type="file" accept="video/*" hidden onChange={onPickVideo} />
          <TrackPicker selected={track} onSelect={setTrack} labels={{ add: '🎵', title: t.musicTitle, use: t.musicUse, remove: t.musicRemove, empty: t.musicEmpty, searchPh: t.musicSearchPh, keyNeeded: t.musicKeyNeeded }} />
          {aiOn && <button type="button" className="tool ai" title={t.aiWrite} aria-label={t.aiWrite} onClick={aiWrite} disabled={saving || uploading}><ToolIcon type="ai" /></button>}
        </div>
        <button className="post-btn" onClick={post} disabled={saving || uploading || !kind || (!text.trim() && !photoUrl && !videoUrl)}>
          {saving ? t.posting : (t.dayPost || t.post)}
        </button>
      </div>
      {(text.trim() || kind) && !saving && <p className="draft-mini">{t.draftSaved || 'Rascunho salvo'}</p>}
      {aiErr && <p className="ai-err">{aiErr}</p>}
      {kind === 'setback' && <p className="setback-note">{t.setbackNote}</p>}
      {aiOn && kind === 'setback' && (
        <div className="ai-context">
          <span className="ai-context-q">{t.aiCareQ}</span>
          <div className="ai-context-btns">
            <button type="button" onClick={aiSoftWrite} disabled={saving || uploading}>{t.aiCareLight}</button>
            <button type="button" onClick={aiSmallStep} disabled={saving || uploading}>{t.aiCareStep}</button>
          </div>
        </div>
      )}
    </div>
  );
}
