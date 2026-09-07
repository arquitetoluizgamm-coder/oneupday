import { NextResponse } from 'next/server';
import { circleAuth, signedCircleMedia } from '../../../../../lib/circles/server';

export async function POST(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const path = String(body.path || '');
  if (!path) return NextResponse.json({ error: 'path_required' }, { status: 400 });
  const signedUrl = await signedCircleMedia(supabase, path, 60);
  return signedUrl
    ? NextResponse.json({ signed_url: signedUrl, expires_in: 60 })
    : NextResponse.json({ error: 'media_not_found' }, { status: 404 });
}
