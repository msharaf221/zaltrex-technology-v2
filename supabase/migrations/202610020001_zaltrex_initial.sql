-- Zaltrex Technology / fresh-project migration.
-- Execute as the trusted database owner (Supabase SQL Editor or migrations), NOT via a browser.
-- Intentional: fails rather than silently reusing incompatible pre-existing tables/policies.
-- NOT executed against your remote project by the assistant: no MCP database tool was available.

begin;

create schema if not exists zaltrex_private;
revoke all on schema zaltrex_private from public, anon, authenticated;
grant usage on schema zaltrex_private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 160),
  email text check (email is null or char_length(email) <= 254),
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  description text not null default '' check (char_length(description) <= 6000),
  price numeric(12, 2) check (price is null or price >= 0),
  icon_name text not null default 'Layers3' check (char_length(icon_name) <= 80),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  email text not null check (
    char_length(email) <= 254 and
    email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  ),
  subject text not null check (char_length(btrim(subject)) between 1 and 160),
  message text not null check (char_length(btrim(message)) between 1 and 10000),
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  requirements text not null check (char_length(btrim(requirements)) between 1 and 10000),
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  section_name text not null unique
    check (char_length(section_name) <= 80 and section_name ~ '^[a-z][a-z0-9_]*$'),
  content_text text not null default '' check (char_length(content_text) <= 20000),
  image_url text check (
    image_url is null or
    (char_length(image_url) <= 2048 and image_url ~ '^https://res[.]cloudinary[.]com/')
  )
);

create index services_active_created_at_idx on public.services (created_at desc) where is_active;
create index contact_messages_status_created_at_idx on public.contact_messages (status, created_at desc);
create index service_requests_client_created_at_idx on public.service_requests (client_id, created_at desc);
create index service_requests_service_id_idx on public.service_requests (service_id);
create index service_requests_status_created_at_idx on public.service_requests (status, created_at desc);

-- Read the trusted database role, not user-editable JWT metadata.
-- SECURITY DEFINER prevents recursive profiles RLS. Keep this schema unexposed in the Data API.
-- Do not FORCE RLS on profiles: the table-owner lookup deliberately bypasses its policies.
create function zaltrex_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke all on function zaltrex_private.is_admin() from public, anon, authenticated;
grant execute on function zaltrex_private.is_admin() to authenticated;

-- Row ownership is not enough: a client must NEVER be able to update their own role.
-- This is SECURITY INVOKER so current_user is the actual database role doing the update.
-- Trusted owner/service_role writes (e.g. first-admin bootstrap) are explicitly permitted.
create function zaltrex_private.protect_profile_role()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and current_user not in ('postgres', 'supabase_admin', 'service_role')
     and not zaltrex_private.is_admin()
  then
    raise exception 'Only an administrator can change a profile role.' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function zaltrex_private.protect_profile_role() from public, anon, authenticated;
grant execute on function zaltrex_private.protect_profile_role() to authenticated;

create trigger zaltrex_protect_profile_role
before update on public.profiles
for each row execute function zaltrex_private.protect_profile_role();

-- Profiles are created by Auth, never directly by an untrusted client.
-- Ignore raw_user_meta_data.role entirely; every new user starts as a client.
-- Auth is the source of truth for email (including email changes).
create function zaltrex_private.sync_auth_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.profiles (id, full_name, email, role)
    values (
      new.id,
      left(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 160),
      new.email,
      'client'
    )
    on conflict (id) do nothing;
  elsif tg_op = 'UPDATE' then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;
revoke all on function zaltrex_private.sync_auth_profile() from public, anon, authenticated;

create trigger zaltrex_auth_user_created
after insert on auth.users
for each row execute function zaltrex_private.sync_auth_profile();

create trigger zaltrex_auth_user_email_changed
after update of email on auth.users
for each row when (old.email is distinct from new.email)
execute function zaltrex_private.sync_auth_profile();

-- Include users that already exist before this migration.
insert into public.profiles (id, full_name, email, role)
select id, left(btrim(coalesce(raw_user_meta_data ->> 'full_name', '')), 160), email, 'client'
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.contact_messages enable row level security;
alter table public.service_requests enable row level security;
alter table public.site_content enable row level security;

-- Clear legacy/default API grants. RLS and least-privilege grants are BOTH required.
revoke all on table public.profiles, public.services, public.contact_messages,
  public.service_requests, public.site_content from public, anon, authenticated;

-- Authentication-managed id/email/created_at are immutable to normal API clients.
grant select on public.profiles to authenticated;
grant update (full_name, role) on public.profiles to authenticated;

grant select on public.services to anon, authenticated;
grant insert (title, description, price, icon_name, is_active) on public.services to authenticated;
grant update (title, description, price, icon_name, is_active) on public.services to authenticated;
grant delete on public.services to authenticated;

grant insert (name, email, subject, message) on public.contact_messages to anon, authenticated;
grant select, delete on public.contact_messages to authenticated;
grant update (name, email, subject, message, status) on public.contact_messages to authenticated;

grant select on public.service_requests to authenticated;
grant insert (client_id, service_id, requirements) on public.service_requests to authenticated;
grant update (client_id, service_id, requirements, status) on public.service_requests to authenticated;

grant select on public.site_content to anon, authenticated;
grant update (content_text, image_url) on public.site_content to authenticated;

-- Trusted backend key access only. Never expose service_role/secret keys in either UI.
grant all on table public.profiles, public.services, public.contact_messages,
  public.service_requests, public.site_content to service_role;

create policy profiles_select_own on public.profiles
for select to authenticated using (id = (select auth.uid()));
create policy profiles_select_admin on public.profiles
for select to authenticated using ((select zaltrex_private.is_admin()));
create policy profiles_update_own on public.profiles
for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_update_admin on public.profiles
for update to authenticated
using ((select zaltrex_private.is_admin())) with check ((select zaltrex_private.is_admin()));

create policy services_select_active on public.services
for select to anon, authenticated using (is_active);
create policy services_select_admin on public.services
for select to authenticated using ((select zaltrex_private.is_admin()));
create policy services_insert_admin on public.services
for insert to authenticated with check ((select zaltrex_private.is_admin()));
create policy services_update_admin on public.services
for update to authenticated
using ((select zaltrex_private.is_admin())) with check ((select zaltrex_private.is_admin()));
create policy services_delete_admin on public.services
for delete to authenticated using ((select zaltrex_private.is_admin()));

create policy contact_messages_insert_public on public.contact_messages
for insert to anon, authenticated with check (status = 'unread');
create policy contact_messages_select_admin on public.contact_messages
for select to authenticated using ((select zaltrex_private.is_admin()));
create policy contact_messages_update_admin on public.contact_messages
for update to authenticated
using ((select zaltrex_private.is_admin())) with check ((select zaltrex_private.is_admin()));
create policy contact_messages_delete_admin on public.contact_messages
for delete to authenticated using ((select zaltrex_private.is_admin()));

create policy service_requests_select_own on public.service_requests
for select to authenticated using (client_id = (select auth.uid()));
create policy service_requests_select_admin on public.service_requests
for select to authenticated using ((select zaltrex_private.is_admin()));
create policy service_requests_insert_own on public.service_requests
for insert to authenticated with check (
  client_id = (select auth.uid())
  and status = 'pending'
  and exists (
    select 1 from public.services
    where id = service_requests.service_id and is_active
  )
);
create policy service_requests_update_admin on public.service_requests
for update to authenticated
using ((select zaltrex_private.is_admin())) with check ((select zaltrex_private.is_admin()));

create policy site_content_select_public on public.site_content
for select to anon, authenticated using (true);
create policy site_content_update_admin on public.site_content
for update to authenticated
using ((select zaltrex_private.is_admin())) with check ((select zaltrex_private.is_admin()));

-- Admins can UPDATE site_content only, as requested. Provision keys through migrations.
insert into public.site_content (section_name, content_text) values
  ('home_hero', ''),
  ('home_intro', ''),
  ('about_us', ''),
  ('solutions_intro', ''),
  ('contact_intro', ''),
  ('request_service_intro', '');

commit;
