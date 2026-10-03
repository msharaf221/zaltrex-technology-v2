-- Read-only checks AFTER applying both migrations to the intended Supabase project.
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema='public' and table_name='services'
  and column_name in ('title_i18n','description_i18n');
-- Expect 2 jsonb, NOT NULL columns, each defaulting to {}.

select section_name from public.site_content
where right(section_name,3) in ('_ar','_en') order by section_name;
-- Expect 12 localized keys.

select tablename, count(*) as policy_count from pg_policies
where schemaname='public' and tablename in ('profiles','services','contact_messages','service_requests','site_content')
group by tablename order by tablename;
-- Expect the original 19 policies, unchanged.
