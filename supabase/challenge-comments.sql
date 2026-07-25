-- Comentários na página do desafio (reusa a tabela comments)
alter table comments add column if not exists challenge_id uuid references challenges(id) on delete cascade;
create index if not exists comments_challenge_idx on comments (challenge_id) where challenge_id is not null;
