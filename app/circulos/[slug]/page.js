import { notFound, redirect } from 'next/navigation';
import AppTop from '../../../components/AppTop';
import BottomNav from '../../../components/BottomNav';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { getDict } from '../../../lib/i18n';
import { signedCircleMedia } from '../../../lib/circles/server';
import CircleFeed from './CircleFeed';

export const dynamic = 'force-dynamic';

export default async function CirclePage({ params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/circulos/${encodeURIComponent(params.slug)}`);

  const { data: circle } = await supabase.from('circles')
    .select('id,owner_id,slug,name,description,welcome_message,cover_path,settings,status,current_rules_version')
    .eq('slug', params.slug).eq('status', 'active').maybeSingle();
  if (!circle) notFound();
  const { data: membership } = await supabase.from('circle_members')
    .select('id,role,status,display_name,rules_version_accepted,terms_version_accepted')
    .eq('circle_id', circle.id).eq('user_id', user.id).eq('status', 'active').maybeSingle();
  if (!membership) notFound();

  const [{ data: posts }, { data: reactions }, { data: comments }, { data: resources }, { data: templates }, { data: ownJourneys }, { data: routines }, { data: ownRoutines }, { data: routineCheckins }] = await Promise.all([
    supabase.from('circle_posts')
      .select('id,circle_id,author_id,kind,body,media_path,media_type,link_url,metadata,comments_enabled,status,pinned_at,created_at,profiles:profiles!circle_posts_author_id_fkey(id,name,avatar_url,avatar_color)')
      .eq('circle_id', circle.id).eq('status', 'published')
      .order('pinned_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).limit(60),
    supabase.from('circle_reactions').select('post_id,user_id,reaction').eq('circle_id', circle.id),
    supabase.from('circle_comments').select('id,post_id').eq('circle_id', circle.id).eq('status', 'published'),
    supabase.from('circle_resources').select('id,title,description,kind,url,storage_path,created_at').eq('circle_id', circle.id).eq('status', 'published').order('created_at', { ascending: false }),
    supabase.from('circle_journey_templates').select('id,title,description,objective,total_days,cover_path,created_at').eq('circle_id', circle.id).eq('status', 'active').order('created_at', { ascending: false }),
    supabase.from('circle_member_journeys').select('id,template_id,status,current_day,progress,started_at,completed_at').eq('circle_id', circle.id).eq('user_id', user.id),
    supabase.from('circle_routines').select('id,title,description,schedule,created_at').eq('circle_id', circle.id).eq('status', 'active').order('created_at', { ascending: false }),
    supabase.from('circle_routine_members').select('id,routine_id,status,started_at,completed_at').eq('circle_id', circle.id).eq('user_id', user.id),
    supabase.from('circle_routine_checkins').select('id,routine_id,checkin_date,note').eq('circle_id', circle.id).eq('user_id', user.id).order('checkin_date', { ascending: false }),
  ]);

  const reactionByPost = {};
  for (const item of reactions || []) {
    const current = reactionByPost[item.post_id] || { count: 0, mine: [] };
    current.count += 1;
    if (item.user_id === user.id) current.mine.push(item.reaction);
    reactionByPost[item.post_id] = current;
  }
  const commentCount = {};
  for (const item of comments || []) commentCount[item.post_id] = (commentCount[item.post_id] || 0) + 1;

  const hydratedPosts = await Promise.all((posts || []).map(async (post) => ({
    ...post,
    media_url: await signedCircleMedia(supabase, post.media_path, 120),
    reactions: reactionByPost[post.id] || { count: 0, mine: [] },
    comment_count: commentCount[post.id] || 0,
  })));
  const hydratedResources = await Promise.all((resources || []).map(async (item) => ({ ...item, storage_url: await signedCircleMedia(supabase, item.storage_path, 120) })));
  const hydratedTemplates = await Promise.all((templates || []).map(async (item) => ({ ...item, cover_url: await signedCircleMedia(supabase, item.cover_path, 120) })));
  const coverUrl = await signedCircleMedia(supabase, circle.cover_path, 120);
  const t = getDict(getLocale());

  return <>
    <AppTop backHref="/circulos" backLabel={t.back} />
    <main className="circle-shell circle-feed-page">
      <CircleFeed
        circle={{ ...circle, cover_url: coverUrl }}
        membership={membership}
        currentUserId={user.id}
        initialPosts={hydratedPosts}
        resources={hydratedResources}
        templates={hydratedTemplates}
        ownJourneys={ownJourneys || []}
        routines={routines || []}
        ownRoutines={ownRoutines || []}
        routineCheckins={routineCheckins || []}
      />
    </main>
    <BottomNav active="explore" t={t} />
  </>;
}
