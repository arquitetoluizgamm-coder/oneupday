-- Carimbo do dia: foto opcional no check-in do desafio
alter table challenge_checks add column if not exists photo_url text;

drop policy if exists "checks update" on challenge_checks;
create policy "checks update" on challenge_checks
for update using (auth.uid() = user_id);
