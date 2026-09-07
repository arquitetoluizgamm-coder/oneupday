import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function clean(value, max) {
  return String(value || '').trim().slice(0, max);
}

function safeHttpUrl(value) {
  const raw = clean(value, 500);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const profession = clean(body.profession, 100);
  const credential = clean(body.credential, 160);
  const evidenceUrl = safeHttpUrl(body.evidence_url);
  const message = clean(body.message, 2000);

  if (profession.length < 2) return NextResponse.json({ error: 'profession_required' }, { status: 400 });
  if (!credential && !evidenceUrl) return NextResponse.json({ error: 'evidence_required' }, { status: 400 });
  if (body.evidence_url && !evidenceUrl) return NextResponse.json({ error: 'invalid_url' }, { status: 400 });

  const { data: profile } = await supabase.from('profiles')
    .select('is_professional_verified')
    .eq('id', user.id)
    .maybeSingle();
  if (profile?.is_professional_verified) {
    return NextResponse.json({ error: 'already_verified' }, { status: 409 });
  }

  const { data: pending } = await supabase.from('professional_verification_requests')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();
  if (pending) return NextResponse.json({ error: 'already_pending' }, { status: 409 });

  const { data, error } = await supabase.from('professional_verification_requests')
    .insert({ user_id: user.id, profession, credential, evidence_url: evidenceUrl, message })
    .select('id, profession, status, review_note, submitted_at')
    .single();

  if (error) {
    console.error('[professional-verification] request failed', { code: error.code, message: error.message });
    return NextResponse.json({ error: error.code === '23505' ? 'already_pending' : 'database_error' }, { status: 500 });
  }
  return NextResponse.json({ request: data }, { status: 201 });
}
