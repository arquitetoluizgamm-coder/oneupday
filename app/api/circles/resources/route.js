import { NextResponse } from 'next/server';
import { circleAuth } from '../../../../lib/circles/server';
import { canManageCircle } from '../../../../lib/circles/policy.mjs';
import { clienteServico } from '../../../../lib/dono';

const bad = (error, status = 400) => NextResponse.json({ error }, { status });
function safeHttpUrl(value) {
  if (!value) return null;
  try {
    const parsed = new URL(String(value));
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null;
  } catch { return null; }
}

export async function POST(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const body = await request.json().catch(() => ({}));
  const circleId = String(body.circle_id || '');
  const { data: member } = await supabase.from('circle_members').select('role,status').eq('circle_id', circleId).eq('user_id', user.id).maybeSingle();
  if (!canManageCircle(member)) return bad('manager_required', 403);
  const title = String(body.title || '').trim();
  const kind = ['text','video','link','exercise','file'].includes(body.kind) ? body.kind : 'link';
  const url = safeHttpUrl(body.url);
  if (body.url && !url) return bad('invalid_resource_url');
  const storagePath = body.storage_path ? String(body.storage_path) : null;
  if (title.length < 2 || title.length > 160 || (!url && !storagePath && !String(body.description || '').trim())) return bad('invalid_resource');
  if (storagePath && !storagePath.startsWith(`${circleId}/`)) return bad('invalid_storage_path');
  const { data, error } = await supabase.from('circle_resources').insert({ circle_id: circleId, created_by: user.id, title, description: String(body.description || '').trim(), kind, url, storage_path: storagePath, status: 'published' }).select('id,title,kind').single();
  return error ? bad('resource_create_failed', 403) : NextResponse.json({ resource: data }, { status: 201 });
}

export async function DELETE(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const body = await request.json().catch(() => ({}));
  const circleId = String(body.circle_id || '');
  const { data: member } = await supabase.from('circle_members').select('role,status').eq('circle_id', circleId).eq('user_id', user.id).maybeSingle();
  if (!canManageCircle(member)) return bad('manager_required', 403);
  const admin = clienteServico();
  if (!admin) return bad('service_unavailable', 503);
  const { error } = await admin.from('circle_resources').update({ status: 'hidden' }).eq('id', String(body.resource_id || '')).eq('circle_id', circleId);
  return error ? bad('resource_remove_failed', 500) : NextResponse.json({ ok: true });
}
