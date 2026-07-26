-- ============================================================
-- O ESPELHO
-- Guarda apenas QUANDO o espelho foi mostrado pela última vez,
-- para que ele seja raro. Nenhuma análise é armazenada:
-- ela é feita na hora, a partir das palavras da própria pessoa,
-- e nunca sai do aparelho dela.
-- ============================================================

alter table public.profiles add column if not exists espelho_em timestamptz;

select 'pronto' as status,
  (select count(*) from information_schema.columns
    where table_name='profiles' and column_name='espelho_em') as coluna_criada;
