begin;

alter table public.updates
  add column if not exists track_id text,
  add column if not exists track_start_seconds double precision,
  add column if not exists track_duration_seconds double precision,
  add column if not exists track_full boolean not null default false;

alter table public.media
  add column if not exists track_title text,
  add column if not exists track_artist text,
  add column if not exists track_audio_url text,
  add column if not exists track_id text,
  add column if not exists track_start_seconds double precision,
  add column if not exists track_duration_seconds double precision,
  add column if not exists track_full boolean not null default false;

comment on column public.updates.track_id is 'Identificador estável da faixa no catálogo oficial do ONE.';
comment on column public.updates.track_start_seconds is 'Segundo inicial escolhido pela pessoa.';
comment on column public.updates.track_duration_seconds is 'Duração do trecho; 15 segundos em posts sem vídeo e até a duração do vídeo nos demais.';
comment on column public.updates.track_full is 'Indica que a faixa completa cabe na duração da publicação.';
comment on column public.media.track_id is 'Identificador estável da faixa no catálogo oficial do ONE.';
comment on column public.media.track_start_seconds is 'Segundo inicial escolhido pela pessoa.';
comment on column public.media.track_duration_seconds is 'Duração do trecho; 15 segundos em fotos, citações e posts sem vídeo.';
comment on column public.media.track_full is 'Indica que a faixa completa cabe na duração da publicação.';

commit;
