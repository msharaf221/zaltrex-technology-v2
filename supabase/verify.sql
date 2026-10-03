-- Read-only structural checks. Run AFTER applying the migration to your project.
-- These checks are not proof of every authorization path; run the DB tests as well.

select table_name, rowsecurity as rls_enabled
from (
  select tablename as table_name, rowsecurity
  from pg_tables
  where schemaname = 'public'
    and tablename in ('profiles', 'services', 'contact_messages', 'service_requests', 'site_content')
) as tables
order by table_name;
-- Expect 5 rows, all true.

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'services', 'contact_messages', 'service_requests', 'site_content')
order by tablename, policyname;
-- Expect 19 policies: 4 profiles / 5 services / 4 contact_messages / 4 service_requests / 2 site_content.

select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where contype = 'f'
  and conrelid in ('public.profiles'::regclass, 'public.service_requests'::regclass)
order by conrelid::regclass::text, conname;
-- Expect 3 foreign keys.

select table_name, grantee, column_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and table_name in ('profiles', 'services', 'contact_messages', 'service_requests', 'site_content')
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type, column_name;

select event_object_schema, event_object_table, trigger_name, event_manipulation
from information_schema.triggers
where trigger_name like 'zaltrex_%'
order by trigger_name;
-- Expect the profile-role guard + auth insert/email-sync triggers.

-- The owner-only first-admin bootstrap is intentionally NOT automated.
-- First create an Auth account. Then run the following from a trusted SQL Editor,
-- replacing the UUID with that account's actual auth.users.id (not an email lookup):
-- update public.profiles set role = 'admin' where id = 'YOUR_ADMIN_AUTH_USER_UUID'::uuid;
