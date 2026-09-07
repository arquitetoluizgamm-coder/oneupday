import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { safeAuthNext } from '../../../lib/authNext.mjs';

function cookieNext(request) {
  const raw = request.cookies.get('oud_auth_next')?.value;
  if (!raw) return null;
  try { return decodeURIComponent(raw); } catch { return null; }
}

function redirectWithoutNextCookie(url) {
  const response = NextResponse.redirect(url);
  response.cookies.set('oud_auth_next', '', { path: '/', maxAge: 0, sameSite: 'lax' });
  return response;
}

// Troca o código do OAuth por uma sessão e devolve a pessoa à ação
// que exigiu login, como aceitar um convite privado de Círculo.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeAuthNext(searchParams.get('next') || cookieNext(request));

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectWithoutNextCookie(new URL(next, origin));
    }
  }
  const retry = new URL('/login', origin);
  retry.searchParams.set('error', 'auth');
  if (next !== '/home') retry.searchParams.set('next', next);
  return redirectWithoutNextCookie(retry);
}
