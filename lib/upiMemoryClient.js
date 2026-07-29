export function compactMemory(value, max = 160) {
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, Math.max(0, max - 3)).trimEnd() + '...';
}

export async function saveUpiMemory(supabase, payload) {
  try {
    if (!supabase || !payload?.user_id || !payload?.source_type || !payload?.source_id) return null;
    const body = String(payload.body || '').trim();
    if (!body) return null;
    const row = {
      user_id: payload.user_id,
      source_type: String(payload.source_type).slice(0, 60),
      source_id: String(payload.source_id).slice(0, 120),
      kind: String(payload.kind || 'identity').slice(0, 40),
      title: String(payload.title || 'memory').trim().slice(0, 160),
      body: body.slice(0, 1200),
      summary: compactMemory(payload.summary || body),
      happened_on: payload.happened_on || new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('upi_memories')
      .upsert(row, { onConflict: 'user_id,source_type,source_id' })
      .select('id')
      .maybeSingle();
    if (error) return null;
    return data || null;
  } catch {
    return null;
  }
}
