-- Follow-up migration AFTER 202610020001_zaltrex_initial.sql.
-- Prepared locally only; NOT applied to the remote Supabase project (MCP unavailable).
-- Adds administrator-managed translations without changing the existing RLS model.
begin;

alter table public.services
  add column title_i18n jsonb not null default '{}'::jsonb,
  add column description_i18n jsonb not null default '{}'::jsonb;

alter table public.services add constraint services_title_i18n_valid check (
  jsonb_typeof(title_i18n) = 'object'
  and title_i18n - 'ar' - 'en' = '{}'::jsonb
  and (not (title_i18n ? 'ar') or (jsonb_typeof(title_i18n -> 'ar') = 'string' and char_length(btrim(title_i18n ->> 'ar')) between 1 and 160))
  and (not (title_i18n ? 'en') or (jsonb_typeof(title_i18n -> 'en') = 'string' and char_length(btrim(title_i18n ->> 'en')) between 1 and 160))
);
alter table public.services add constraint services_description_i18n_valid check (
  jsonb_typeof(description_i18n) = 'object'
  and description_i18n - 'ar' - 'en' = '{}'::jsonb
  and (not (description_i18n ? 'ar') or (jsonb_typeof(description_i18n -> 'ar') = 'string' and char_length(description_i18n ->> 'ar') <= 6000))
  and (not (description_i18n ? 'en') or (jsonb_typeof(description_i18n -> 'en') = 'string' and char_length(description_i18n ->> 'en') <= 6000))
);

-- Existing SELECT grants cover new columns; existing admin-only RLS covers their writes.
grant insert (title_i18n, description_i18n), update (title_i18n, description_i18n)
  on public.services to authenticated;

-- UPDATE-only site_content needs pre-provisioned language keys.
insert into public.site_content (section_name, content_text)
select section || '_' || locale, ''
from unnest(array['home_hero','home_intro','about_us','solutions_intro','contact_intro','request_service_intro']) as sections(section)
cross join unnest(array['ar','en']) as locales(locale)
on conflict (section_name) do nothing;

commit;
