import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  canCreateCircle,
  canManageCircle,
  canModerateCircle,
  canPostInCircle,
  circlePostDestination,
  circleSlug,
  normalizeCircleSettings,
  privateNotification,
  sanitizeCircleContentForExternalCopy,
} from '../lib/circles/policy.mjs';

test('somente profissional verificado pode criar Círculo', () => {
  assert.equal(canCreateCircle({ is_professional_verified: true }), true);
  assert.equal(canCreateCircle({ is_professional_verified: false }), false);
  assert.equal(canCreateCircle(null), false);
});

test('papéis respeitam a hierarquia e exigem associação ativa', () => {
  assert.equal(canManageCircle({ role: 'owner', status: 'active' }), true);
  assert.equal(canManageCircle({ role: 'admin', status: 'active' }), true);
  assert.equal(canManageCircle({ role: 'moderator', status: 'active' }), false);
  assert.equal(canModerateCircle({ role: 'moderator', status: 'active' }), true);
  assert.equal(canModerateCircle({ role: 'admin', status: 'removed' }), false);
});

test('permissões de publicação são fechadas por padrão inválido', () => {
  const normalized = normalizeCircleSettings({ who_can_post: 'qualquer-valor', notification_details: true });
  assert.equal(normalized.who_can_post, 'all');
  assert.equal(normalized.notification_details, false);
  assert.equal(canPostInCircle({ role: 'member', status: 'active' }, { who_can_post: 'admins' }), false);
  assert.equal(canPostInCircle({ role: 'admin', status: 'active' }, { who_can_post: 'admins' }), true);
});

test('destino público e destino privado permanecem distintos', () => {
  assert.equal(circlePostDestination('one'), 'one');
  assert.equal(circlePostDestination('circle'), 'circle');
  assert.equal(circlePostDestination('public'), 'circle');
});

test('notificação privada não revela conteúdo por padrão', () => {
  assert.equal(privateNotification({ detail: 'texto confidencial' }), 'Você tem uma nova atividade em um Círculo privado.');
});

test('cópia externa só pode ser iniciada pelo próprio autor', () => {
  const post = { author_id: 'autor', body: 'meu texto', media_path: 'x', media_type: 'image' };
  assert.equal(sanitizeCircleContentForExternalCopy(post, 'outra-pessoa'), null);
  assert.deepEqual(sanitizeCircleContentForExternalCopy(post, 'autor'), { body: 'meu texto', media_path: 'x', media_type: 'image', link_url: null });
});

test('slug do Círculo é estável e seguro para URL', () => {
  assert.equal(circleSlug('  Recomeço & Presença  '), 'recomeco-presenca');
});

test('migração mantém todas as tabelas privadas sob RLS e o bucket fechado', () => {
  const sql = readFileSync('supabase/migrations/20260907103806_circles_private_ecosystem_mvp.sql', 'utf8');
  const tables = [...sql.matchAll(/create table if not exists public\.(circle[a-z_]+)/g)].map((match) => match[1]);
  assert.ok(tables.length >= 18);
  for (const table of tables) assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security;`));
  assert.match(sql, /'circle-media',[\s\S]*?false,/);
  assert.doesNotMatch(sql, /create policy [^;]+ to anon/i);
  assert.match(sql, /visibility text not null default 'private' check \(visibility = 'private'\)/);
});

test('usuário removido não mantém operações sobre posts privados', () => {
  const sql = readFileSync('supabase/migrations/20260907103806_circles_private_ecosystem_mvp.sql', 'utf8');
  assert.match(sql, /circle_posts_author_delete[\s\S]*?private\.is_circle_member\(circle_id\)/);
  assert.match(sql, /circle_media_owner_delete[\s\S]*?private\.is_circle_member\(private\.circle_id_from_storage_name\(name\)\)/);
});

test('feed público não consulta tabelas de Círculos', () => {
  const publicFeed = readFileSync('app/api/feed/route.js', 'utf8');
  assert.doesNotMatch(publicFeed, /circle_posts|circle_comments|circle_members/);
});
