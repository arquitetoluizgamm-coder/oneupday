import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync('supabase/migrations/20260907121342_professional_verification_requests.sql', 'utf8');
const requestApi = readFileSync('app/api/professional-verification/route.js', 'utf8');
const adminApi = readFileSync('app/api/admin/pessoa/route.js', 'utf8');
const publicProfile = readFileSync('app/[slug]/page.js', 'utf8');
const globalStyles = readFileSync('app/globals.css', 'utf8');
const feedApi = readFileSync('app/api/feed/route.js', 'utf8');
const feedClient = readFileSync('app/home/FeedClient.jsx', 'utf8');
const badgeComponent = readFileSync('components/ProfessionalBadge.jsx', 'utf8');

test('candidaturas profissionais ficam sob RLS e não são expostas ao anon', () => {
  assert.match(migration, /professional_verification_requests enable row level security/i);
  assert.match(migration, /revoke all on table public\.professional_verification_requests from anon/i);
  assert.match(migration, /using \(\(select auth\.uid\(\)\) = user_id\)/i);
});

test('pedido exige profissão e evidência verificável', () => {
  assert.match(requestApi, /profession\.length < 2/);
  assert.match(requestApi, /!credential && !evidenceUrl/);
  assert.match(requestApi, /\['http:', 'https:'\]/);
});

test('usuário comum não consegue conceder o próprio selo', () => {
  assert.match(migration, /current_user not in \('postgres', 'service_role'\)/i);
  assert.match(migration, /professional_verification_requires_service_role/i);
  assert.match(migration, /before insert or update\s+on public\.profiles/i);
  assert.doesNotMatch(requestApi, /is_professional_verified\s*:\s*true/);
});

test('aprovação e recusa passam exclusivamente pela rota do dono', () => {
  assert.match(adminApi, /if \(!ehDono\(user\)\)/);
  assert.match(adminApi, /aprovar_verificacao_profissional/);
  assert.match(adminApi, /rejeitar_verificacao_profissional/);
  assert.match(migration, /grant execute on function public\.review_professional_verification[^;]+to service_role/is);
});

test('perfil público mostra o selo, mas não consulta registro nem link de comprovação', () => {
  assert.match(publicProfile, /is_professional_verified, professional_title/);
  assert.match(publicProfile, /<ProfessionalBadge/);
  assert.doesNotMatch(publicProfile, /credential|evidence_url/);
});

test('selo profissional não disputa a linha do nome no celular', () => {
  assert.match(globalStyles, /@media\(max-width:430px\)[\s\S]*?\.profile-card \.pc-name-line\{[\s\S]*?flex-wrap:wrap/);
  assert.match(globalStyles, /\.profile-card \.pc-name-line h1\{\s*flex:1 0 100%/);
});

test('feed mostra selo profissional compacto e acessível junto ao nome', () => {
  assert.match(feedApi, /is_professional_verified, professional_title/);
  assert.match(feedClient, /<ProfessionalBadge title=\{owner\.professional_title\} compact/);
  assert.match(feedClient, /<FeedProfessionalBadge owner=\{item\.owner\}/);
  assert.match(badgeComponent, /aria-label=\{accessible\}/);
});
