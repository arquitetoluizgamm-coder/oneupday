const VISIBILITIES = new Set(['public', 'followers', 'private']);

export function routineVisibility(value) {
  if (value === 'profile') return 'public';
  return VISIBILITIES.has(value) ? value : 'private';
}

function text(value) {
  return String(value || '').trim() || null;
}

function url(value) {
  const candidate = text(value);
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? candidate : null;
  } catch {
    return null;
  }
}

function volume(value, fallback) {
  const parsed = Number(value);
  return Math.round(Math.min(100, Math.max(0, Number.isFinite(parsed) ? parsed : fallback)));
}

export function routinePublication(body, userId, routineId, visibility) {
  const mediaUrl = url(body.media_url);
  const mediaKind = mediaUrl && body.media_kind === 'video' ? 'video' : mediaUrl ? 'photo' : 'routine';
  const caption = text(body.media_caption);
  const chosenTrack = body.track && typeof body.track === 'object' ? body.track : null;
  const trackAudioUrl = url(chosenTrack?.audio_url);
  const shouldPersist = visibility !== 'private' || !!mediaUrl || !!caption || !!trackAudioUrl;

  if (!shouldPersist) return null;

  return {
    user_id: userId,
    routine_id: routineId,
    url: mediaUrl,
    kind: mediaKind,
    visibility,
    caption,
    track_title: trackAudioUrl ? text(chosenTrack?.title) : null,
    track_artist: trackAudioUrl ? text(chosenTrack?.artist) : null,
    track_audio_url: trackAudioUrl,
    track_id: trackAudioUrl ? text(chosenTrack?.id) : null,
    track_start_seconds: trackAudioUrl ? Math.max(0, Number(chosenTrack?.start_seconds) || 0) : null,
    track_duration_seconds: trackAudioUrl ? Math.max(0.1, Number(chosenTrack?.duration_seconds) || 30) : null,
    track_full: trackAudioUrl ? !!chosenTrack?.full : false,
    track_volume: trackAudioUrl ? volume(chosenTrack?.track_volume, mediaKind === 'video' ? 35 : 85) : 85,
    video_volume: trackAudioUrl && mediaKind === 'video' ? volume(chosenTrack?.video_volume, 100) : 100,
  };
}
