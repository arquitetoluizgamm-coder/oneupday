import { notFound, redirect } from 'next/navigation';
import AppTop from '../../../../components/AppTop';
import BottomNav from '../../../../components/BottomNav';
import { createClient } from '../../../../lib/supabase/server';
import { getLocale } from '../../../../lib/locale';
import { getDict } from '../../../../lib/i18n';
import CircleAdminClient from './CircleAdminClient';

export const dynamic = 'force-dynamic';

export default async function CircleManagePage({ params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/circulos/${encodeURIComponent(params.slug)}/gerenciar`);
  const { data: circle } = await supabase.from('circles')
    .select('id,owner_id,slug,name,description,welcome_message,settings,status,current_rules_version')
    .eq('slug', params.slug).maybeSingle();
  if (!circle) notFound();
  const { data: membership } = await supabase.from('circle_members').select('role,status')
    .eq('circle_id', circle.id).eq('user_id', user.id).eq('status', 'active').maybeSingle();
  if (!membership || !['owner','admin'].includes(membership.role)) redirect(`/circulos/${circle.slug}`);
  const [{ data: members }, { data: invites }, { data: rules }, { data: reports }, { data: audit }] = await Promise.all([
    supabase.from('circle_members').select('id,user_id,role,status,display_name,joined_at,profiles:profiles!circle_members_user_id_fkey(id,name,avatar_url,avatar_color)').eq('circle_id', circle.id).order('joined_at'),
    supabase.from('circle_invites').select('id,invitee_id,expires_at,max_uses,uses,status,created_at').eq('circle_id', circle.id).order('created_at', { ascending: false }).limit(30),
    supabase.from('circle_rules').select('version,rules,requires_reaccept,created_at').eq('circle_id', circle.id).order('version', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('circle_reports').select('id,target_type,target_id,reason,details,status,created_at').eq('circle_id', circle.id).order('created_at', { ascending: false }).limit(30),
    supabase.from('circle_audit_logs').select('id,actor_id,action,target_type,target_id,created_at').eq('circle_id', circle.id).order('created_at', { ascending: false }).limit(40),
  ]);
  const t = getDict(getLocale());
  return <>
    <AppTop backHref={`/circulos/${circle.slug}`} backLabel={t.back} />
    <main className="circle-shell circle-admin-page"><CircleAdminClient circle={circle} actorRole={membership.role} initialMembers={members || []} initialInvites={invites || []} currentRules={rules || { version: 1, rules: [] }} reports={reports || []} audit={audit || []} /></main>
    <BottomNav active="explore" t={t} />
  </>;
}
