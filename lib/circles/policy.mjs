export const CIRCLE_ROLES = Object.freeze(['owner', 'admin', 'moderator', 'member']);
export const ACTIVE_MEMBER_STATUS = 'active';

const ROLE_POWER = Object.freeze({ owner: 4, admin: 3, moderator: 2, member: 1 });

export function isActiveCircleMember(member) {
  return !!member && member.status === ACTIVE_MEMBER_STATUS && CIRCLE_ROLES.includes(member.role);
}

export function hasCircleRole(member, minimumRole) {
  if (!isActiveCircleMember(member)) return false;
  return (ROLE_POWER[member.role] || 0) >= (ROLE_POWER[minimumRole] || Number.POSITIVE_INFINITY);
}

export function canManageCircle(member) {
  return hasCircleRole(member, 'admin');
}

export function canModerateCircle(member) {
  return hasCircleRole(member, 'moderator');
}

export function canCreateCircle(profile) {
  return profile?.is_professional_verified === true;
}

export function normalizeCircleSettings(input = {}) {
  const post = ['all', 'admins', 'moderators'].includes(input.who_can_post)
    ? input.who_can_post : 'all';
  const comment = ['all', 'admins', 'disabled'].includes(input.who_can_comment)
    ? input.who_can_comment : 'all';
  const bool = (key, fallback) => typeof input[key] === 'boolean' ? input[key] : fallback;
  return {
    who_can_post: post,
    who_can_comment: comment,
    member_interaction: bool('member_interaction', true),
    private_messages: bool('private_messages', false),
    show_member_list: bool('show_member_list', false),
    allow_images: bool('allow_images', true),
    allow_videos: bool('allow_videos', true),
    allow_journeys: bool('allow_journeys', true),
    allow_reactions: bool('allow_reactions', true),
    allow_mentions: bool('allow_mentions', false),
    admin_can_view_member_progress: bool('admin_can_view_member_progress', false),
    notification_details: false,
  };
}

export function canPostInCircle(member, settings = {}) {
  if (!isActiveCircleMember(member)) return false;
  const mode = normalizeCircleSettings(settings).who_can_post;
  if (mode === 'all') return true;
  if (mode === 'moderators') return canModerateCircle(member);
  return canManageCircle(member);
}

export function canCommentInCircle(member, settings = {}) {
  if (!isActiveCircleMember(member)) return false;
  const mode = normalizeCircleSettings(settings).who_can_comment;
  if (mode === 'disabled') return false;
  if (mode === 'admins') return canManageCircle(member);
  return true;
}

export function circleSlug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

export function circlePostDestination(value) {
  return value === 'one' ? 'one' : 'circle';
}

export function privateNotification({ showDetails = false, detail = '' } = {}) {
  if (showDetails && String(detail).trim()) return String(detail).trim();
  return 'Você tem uma nova atividade em um Círculo privado.';
}

export function sanitizeCircleContentForExternalCopy(post, authorId) {
  if (!post || post.author_id !== authorId) return null;
  return {
    body: String(post.body || ''),
    media_path: post.media_path || null,
    media_type: post.media_type || null,
    link_url: post.link_url || null,
  };
}
