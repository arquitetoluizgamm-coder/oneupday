-- Remove only the old product copy limits. The columns already use Postgres
-- text, so no table rewrite or data conversion is needed.
set local lock_timeout = '5s';
set local statement_timeout = '30s';

alter table public.routines
  drop constraint if exists routines_name_check,
  drop constraint if exists routines_ideal_text_check;
