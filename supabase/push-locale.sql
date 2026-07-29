alter table push_subs
  add column if not exists locale text default 'pt';

update push_subs
set locale = 'pt'
where locale is null or locale not in ('pt', 'en', 'es');
