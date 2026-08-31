alter table public.updates
  add column if not exists track_volume smallint not null default 85,
  add column if not exists video_volume smallint not null default 100;

alter table public.media
  add column if not exists track_volume smallint not null default 85,
  add column if not exists video_volume smallint not null default 100;

alter table public.updates
  drop constraint if exists updates_track_volume_range,
  add constraint updates_track_volume_range check (track_volume between 0 and 100),
  drop constraint if exists updates_video_volume_range,
  add constraint updates_video_volume_range check (video_volume between 0 and 100);

alter table public.media
  drop constraint if exists media_track_volume_range,
  add constraint media_track_volume_range check (track_volume between 0 and 100),
  drop constraint if exists media_video_volume_range,
  add constraint media_video_volume_range check (video_volume between 0 and 100);

comment on column public.updates.track_volume is 'Volume percentual da trilha musical definido antes da publicação.';
comment on column public.updates.video_volume is 'Volume percentual do áudio original do vídeo definido antes da publicação.';
comment on column public.media.track_volume is 'Volume percentual da trilha musical definido antes da publicação.';
comment on column public.media.video_volume is 'Volume percentual do áudio original do vídeo definido antes da publicação.';
