'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import TrackPicker from '../home/TrackPicker';

const WIDTH = 1080;
const HEIGHT = 1350;
const TEXT_FONT = "'Montserrat', Arial, sans-serif";
const DISPLAY_FONT = "'Fraunces', Georgia, serif";

function localDateKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date()).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function wrap(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of String(text || '').split('\n')) {
    let line = '';
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word;
      if (!line || ctx.measureText(test).width <= maxWidth) line = test;
      else { lines.push(line); line = word; }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawLines(ctx, lines, x, y, lineHeight) {
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function drawCard(canvas, message, labels) {
  if (!canvas || !message) return;
  const ctx = canvas.getContext('2d');
  const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  background.addColorStop(0, '#FBF8F0');
  background.addColorStop(0.55, '#F4F1E7');
  background.addColorStop(1, '#E8EEE3');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = '#CAD5C1';
  ctx.beginPath(); ctx.arc(1030, 90, 270, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E9CDBE';
  ctx.beginPath(); ctx.arc(-40, 1280, 260, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(112,129,101,.30)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(873, 155); ctx.bezierCurveTo(840, 205, 860, 260, 822, 318);
  ctx.moveTo(852, 222); ctx.bezierCurveTo(808, 194, 778, 202, 754, 232);
  ctx.moveTo(842, 255); ctx.bezierCurveTo(886, 242, 917, 256, 932, 288);
  ctx.stroke();

  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#718064';
  ctx.font = `800 28px ${TEXT_FONT}`;
  ctx.letterSpacing = '7px';
  ctx.fillText('ONE UP DAY', 86, 78);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#A85A43';
  ctx.font = `800 26px ${TEXT_FONT}`;
  ctx.fillText(String(labels.bibleCardLabel || '').toUpperCase(), 86, 165);

  roundRect(ctx, 84, 228, 430, 62, 31);
  ctx.fillStyle = 'rgba(255,253,248,.74)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(112,129,101,.22)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#59644F';
  ctx.font = `750 27px ${TEXT_FONT}`;
  ctx.fillText(message.reference, 116, 245);

  let titleSize = 64;
  let titleLines = [];
  do {
    ctx.font = `650 ${titleSize}px ${DISPLAY_FONT}`;
    titleLines = wrap(ctx, message.title, 900);
    if (titleLines.length <= 2) break;
    titleSize -= 3;
  } while (titleSize > 46);
  ctx.fillStyle = '#171A31';
  let y = drawLines(ctx, titleLines.slice(0, 3), 86, 354, Math.round(titleSize * 1.12));
  y += 42;

  let bodySize = 40;
  let bodyLines = [];
  do {
    ctx.font = `520 ${bodySize}px ${TEXT_FONT}`;
    bodyLines = wrap(ctx, message.explanation, 900);
    if (y + bodyLines.length * bodySize * 1.46 < 970) break;
    bodySize -= 2;
  } while (bodySize > 32);
  ctx.fillStyle = '#42483F';
  y = drawLines(ctx, bodyLines, 86, y, Math.round(bodySize * 1.46));

  const boxY = Math.max(1020, Math.min(1080, y + 48));
  roundRect(ctx, 72, boxY, 936, 200, 34);
  ctx.fillStyle = 'rgba(255,253,248,.78)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(193,111,84,.20)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#A85A43';
  ctx.font = `800 20px ${TEXT_FONT}`;
  ctx.fillText(String(labels.bibleTodayLabel || '').toUpperCase(), 108, boxY + 32);
  ctx.fillStyle = '#343A34';
  ctx.font = `650 31px ${TEXT_FONT}`;
  drawLines(ctx, wrap(ctx, message.application, 850).slice(0, 3), 108, boxY + 76, 42);

  ctx.fillStyle = '#70786B';
  ctx.font = `650 22px ${TEXT_FONT}`;
  ctx.fillText(labels.bibleNoQuote, 86, 1300);
}

function asCaption(message) {
  return `${message.reference}\n${message.title}\n\n${message.explanation}\n\n${message.application}`.trim();
}

function trackFields(track) {
  if (!track) return {};
  return {
    track_title: track.title,
    track_artist: track.artist,
    track_audio_url: track.audio_url,
    track_id: track.id,
    track_start_seconds: Number(track.start_seconds) || 0,
    track_duration_seconds: Number(track.duration_seconds) || 30,
    track_full: !!track.full,
  };
}

function removeTrackFields(row) {
  const clean = { ...row };
  ['track_title', 'track_artist', 'track_audio_url', 'track_id', 'track_start_seconds', 'track_duration_seconds', 'track_full']
    .forEach((key) => delete clean[key]);
  return clean;
}

async function canvasBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('image')), 'image/png');
  });
}

export default function BiblicalMessageForm({ t, userId }) {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visibility, setVisibility] = useState('private');
  const [track, setTrack] = useState(null);
  const [error, setError] = useState('');
  const canvas = useRef(null);
  const router = useRouter();

  async function load(force = false) {
    setLoading(true);
    setError('');
    const cacheKey = `one-bible:${userId}:${localDateKey()}`;
    if (!force) {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
        if (cached?.reference && cached?.explanation) {
          setMessage(cached);
          setLoading(false);
          return;
        }
      } catch {}
    }
    try {
      const response = await fetch('/api/biblical-message', { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.reference || !data.explanation) throw new Error(data.error || 'message');
      setMessage(data);
      try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}
    } catch {
      setError(t.bibleLoadError);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let active = true;
    async function render() {
      if (!message || !canvas.current) return;
      try { await document.fonts.ready; } catch {}
      if (active) drawCard(canvas.current, message, t);
    }
    render();
    return () => { active = false; };
  }, [message, t]);

  async function save() {
    if (!message || !canvas.current || saving) return;
    setSaving(true);
    setError('');
    try {
      const blob = await canvasBlob(canvas.current);
      const supabase = createClient();
      const path = `${userId}/biblical/${message.date || localDateKey()}-${crypto.randomUUID()}.png`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(path, blob, {
        upsert: false, contentType: 'image/png',
      });
      if (uploadError) throw uploadError;
      const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
      let row = {
        user_id: userId,
        url,
        kind: 'bible',
        visibility,
        caption: asCaption(message),
        ...trackFields(track),
      };
      let insertError = null;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        ({ error: insertError } = await supabase.from('media').insert(row));
        if (!insertError) break;
        if (/track_/.test(insertError.message || '') && row.track_audio_url) {
          row = removeTrackFields(row);
          continue;
        }
        break;
      }
      if (insertError) throw insertError;
      router.push('/perfil?aba=biblia');
      router.refresh();
    } catch (err) {
      setError(`${t.bibleSaveError}${err?.message ? ` (${err.message})` : ''}`);
      setSaving(false);
    }
  }

  const buttonLabel = visibility === 'private'
    ? t.bibleKeepPrivate
    : visibility === 'followers' ? t.bibleShareFollowers : t.biblePublish;

  return (
    <section className="biblical-shell" aria-busy={loading}>
      {loading && (
        <div className="biblical-loading" role="status">
          <span className="biblical-pulse" aria-hidden="true" />
          <b>{t.bibleLoading}</b>
          <p>{t.bibleLoadingSub}</p>
        </div>
      )}

      {!loading && message && (
        <>
          <div className="biblical-preview">
            <canvas ref={canvas} width={WIDTH} height={HEIGHT} aria-label={asCaption(message)} />
          </div>

          <div className="biblical-reading">
            <span>{message.reference}</span>
            <h2>{message.title}</h2>
            <p>{message.explanation}</p>
            <div><b>{t.bibleTodayLabel}</b><p>{message.application}</p></div>
            <small>{t.bibleNoQuoteLong}</small>
          </div>

          <div className="biblical-music media-music-field">
            <div>
              <span>{t.musicAdd}</span>
              <small>{t.musicOfficial}</small>
            </div>
            <div className="composer-toolbar"><div className="tools">
              <TrackPicker selected={track} onSelect={setTrack} labels={{
                add: t.musicAdd,
                title: t.musicTitle,
                use: t.musicUse,
                remove: t.musicRemove,
                empty: t.musicEmpty,
                searchPh: t.musicSearchPh,
                keyNeeded: t.musicKeyNeeded,
                official: t.musicOfficial,
                clip: t.musicClip,
                starts: t.musicStarts,
                whole: t.musicWhole,
                seconds: t.musicSeconds,
                videoLength: t.musicVideoLength,
                done: t.musicDone,
              }} />
            </div></div>
          </div>

          <div className="biblical-visibility">
            <span>{t.citWhoSees}</span>
            <div className="cit-vis">
              {[['public', t.pubPublic], ['followers', t.pubFollowers], ['private', t.pubPrivate]].map(([value, label]) => (
                <button key={value} type="button" className={`wz-chip${visibility === value ? ' on' : ''}`}
                  aria-pressed={visibility === value} onClick={() => setVisibility(value)}>{label}</button>
              ))}
            </div>
            <p>{visibility === 'private' ? t.biblePrivateHint : t.biblePublicHint}</p>
          </div>

          <button type="button" className="cta grow biblical-save" onClick={save} disabled={saving}>
            {saving ? t.bibleSaving : buttonLabel}
          </button>
        </>
      )}

      {error && <div className="biblical-error" role="alert"><p>{error}</p><button type="button" className="ghost-btn" onClick={() => load(true)}>{t.bibleRetry}</button></div>}
    </section>
  );
}
