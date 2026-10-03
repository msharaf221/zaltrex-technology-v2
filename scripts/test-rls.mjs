// Isolated PostgreSQL/RLS regression checks. Uses PGlite + a minimal mocked auth schema.
// This NEVER connects to your Supabase project. Real Supabase integration still needs verification.
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const ids = {
  admin: "10000000-0000-4000-8000-000000000001",
  alice: "10000000-0000-4000-8000-000000000002",
  bob: "10000000-0000-4000-8000-000000000003",
  active: "20000000-0000-4000-8000-000000000001",
  inactive: "20000000-0000-4000-8000-000000000002",
};
let count = 0;
async function check(name, work) {
  await work();
  count += 1;
  console.log(`✓ ${name}`);
}
async function as(role, uid = "") {
  await db.exec("reset role;");
  await db.query("select set_config('request.jwt.claim.sub', $1, false);", [
    uid,
  ]);
  await db.exec(`set role ${role};`); // Fixed role names from this test only.
}
async function denied(sql, params = [], code = "42501") {
  try {
    await db.query(sql, params);
    assert.fail(`Expected ${code}: ${sql}`);
  } catch (error) {
    if (error instanceof assert.AssertionError) throw error;
    const allowedCodes = Array.isArray(code) ? code : [code];
    assert.ok(
      allowedCodes.includes(error.code),
      `${sql}: expected ${allowedCodes}, got ${error.code}: ${error.message}`,
    );
  }
}
async function rows(sql, expected, params = []) {
  const result = await db.query(sql, params);
  assert.equal(result.rows.length, expected, sql);
  return result.rows;
}

try {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create role supabase_admin nologin;
    create schema auth;
    create table auth.users (
      id uuid primary key,
      email text,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    insert into auth.users (id, email, raw_user_meta_data) values
      ('${ids.admin}', 'admin@example.test', '{"full_name":"Admin","role":"admin"}');
  `);
  const migration = await readFile(
    new URL(
      "../supabase/migrations/202610020001_zaltrex_initial.sql",
      import.meta.url,
    ),
    "utf8",
  );
  await check("Migration applies atomically to isolated PostgreSQL", () =>
    db.exec(migration),
  );
  await check(
    "Existing Auth users are backfilled as clients, not metadata-selected admins",
    async () => {
      const result = await db.query(
        "select role from public.profiles where id = $1",
        [ids.admin],
      );
      assert.equal(result.rows[0].role, "client");
    },
  );
  await db.query("update public.profiles set role = 'admin' where id = $1", [
    ids.admin,
  ]);
  await db.query(
    "insert into auth.users (id,email,raw_user_meta_data) values ($1,$2,$3),($4,$5,$6)",
    [
      ids.alice,
      "alice@example.test",
      { full_name: "Alice", role: "admin" },
      ids.bob,
      "bob@example.test",
      { full_name: "Bob" },
    ],
  );
  await db.query(
    "insert into public.services (id,title,description,is_active) values ($1,'Active service','Available',true),($2,'Inactive service','Hidden',false)",
    [ids.active, ids.inactive],
  );
  await db.query(
    "insert into public.service_requests(client_id,service_id,requirements) values($1,$2,'Alice project'),($3,$2,'Bob project')",
    [ids.alice, ids.active, ids.bob],
  );
  await check(
    "Auth signup auto-creates a client profile and ignores metadata role",
    async () => {
      const result = await db.query(
        "select role,full_name from public.profiles where id = $1",
        [ids.alice],
      );
      assert.deepEqual(result.rows[0], { role: "client", full_name: "Alice" });
    },
  );
  await check("All five tables have RLS enabled", async () => {
    const result = await db.query(
      "select count(*)::int as count from pg_tables where schemaname = 'public' and rowsecurity",
    );
    assert.equal(result.rows[0].count, 5);
  });
  await check("Nineteen explicit policies exist", async () => {
    const result = await db.query(
      "select count(*)::int as count from pg_policies where schemaname = 'public'",
    );
    assert.equal(result.rows[0].count, 19);
  });
  await check(
    "Admin helper has a fixed empty search_path and SECURITY DEFINER",
    async () => {
      const result = await db.query(
        "select prosecdef, proconfig from pg_proc where oid = 'zaltrex_private.is_admin()'::regprocedure",
      );
      assert.equal(result.rows[0].prosecdef, true);
      assert.ok(result.rows[0].proconfig.includes('search_path=""'));
    },
  );

  await as("anon");
  await check("Public reads only active services", () =>
    rows("select * from public.services", 1),
  );
  await check("Public reads all predefined site content", () =>
    rows("select * from public.site_content", 6),
  );
  await check("Public cannot read profiles", () =>
    denied("select * from public.profiles"),
  );
  await check("Public cannot read messages", () =>
    denied("select * from public.contact_messages"),
  );
  await check("Public cannot read service requests", () =>
    denied("select * from public.service_requests"),
  );
  await check(
    "Public can submit a contact message without SELECT permission",
    () =>
      db.query(
        "insert into public.contact_messages(name,email,subject,message) values('Visitor','visitor@example.test','Hello','A public message')",
      ),
  );
  await check("Public cannot pre-mark a message as read", () =>
    denied(
      "insert into public.contact_messages(name,email,subject,message,status) values('Visitor','visitor@example.test','Hello','Message','read')",
    ),
  );
  await check("Public cannot forge message ids/timestamps", () =>
    denied(
      "insert into public.contact_messages(id,name,email,subject,message) values(gen_random_uuid(),'Visitor','visitor@example.test','Hello','Message')",
    ),
  );
  await check("Public cannot insert services", () =>
    denied("insert into public.services(title) values('Unauthorized')"),
  );
  await check("Public cannot update services", () =>
    denied("update public.services set title='Unauthorized'"),
  );
  await check("Public cannot delete services", () =>
    denied("delete from public.services"),
  );
  await check("Public cannot update messages", () =>
    denied("update public.contact_messages set status='read'"),
  );
  await check("Public cannot delete messages", () =>
    denied("delete from public.contact_messages"),
  );
  await check("Public cannot insert service requests", () =>
    denied(
      "insert into public.service_requests(client_id,service_id,requirements) values($1,$2,'Unauthorized')",
      [ids.alice, ids.active],
    ),
  );
  await check("Public cannot update site content", () =>
    denied("update public.site_content set content_text='Unauthorized'"),
  );

  await as("authenticated", ids.alice);
  await check(
    "Client reads only their own profile without recursion",
    async () => {
      const result = await rows("select id from public.profiles", 1);
      assert.equal(result[0].id, ids.alice);
    },
  );
  await check("Client can update their own name", () =>
    rows(
      "update public.profiles set full_name='Alice Updated' where id=$1 returning id",
      1,
      [ids.alice],
    ),
  );
  await check("Client cannot promote their own role", () =>
    denied("update public.profiles set role='admin' where id=$1", [ids.alice]),
  );
  await check("Client cannot change Auth-owned email", () =>
    denied(
      "update public.profiles set email='forged@example.test' where id=$1",
      [ids.alice],
    ),
  );
  await check("Client cannot move their profile to another user id", () =>
    denied("update public.profiles set id=$1 where id=$2", [
      ids.bob,
      ids.alice,
    ]),
  );
  await check("Client cannot change profile timestamps", () =>
    denied("update public.profiles set created_at=now() where id=$1", [
      ids.alice,
    ]),
  );
  await check("Client cannot update another profile", () =>
    rows(
      "update public.profiles set full_name='Intruder' where id=$1 returning id",
      0,
      [ids.bob],
    ),
  );
  await check("Client cannot manually create or replace a profile", () =>
    denied("insert into public.profiles(id) values($1)", [ids.alice]),
  );
  await check("Client cannot delete profiles", () =>
    denied("delete from public.profiles where id=$1", [ids.alice]),
  );
  await check("Client sees only active services", () =>
    rows("select * from public.services", 1),
  );
  await check("Client cannot insert a service", () =>
    denied("insert into public.services(title) values('Unauthorized')"),
  );
  await check("Client cannot update a service", () =>
    rows("update public.services set title='Unauthorized' returning id", 0),
  );
  await check("Client cannot delete a service", () =>
    rows("delete from public.services returning id", 0),
  );
  await check("Client cannot read contact messages", () =>
    rows("select * from public.contact_messages", 0),
  );
  await check("Signed-in clients may also submit contact messages", () =>
    db.query(
      "insert into public.contact_messages(name,email,subject,message) values('Alice','alice@example.test','Hello','Signed-in message')",
    ),
  );
  await check("Client cannot update contact messages", () =>
    rows("update public.contact_messages set status='read' returning id", 0),
  );
  await check("Client cannot delete contact messages", () =>
    rows("delete from public.contact_messages returning id", 0),
  );
  await check("Client reads only their own requests", async () => {
    const result = await rows(
      "select client_id from public.service_requests",
      1,
    );
    assert.equal(result[0].client_id, ids.alice);
  });
  await check(
    "Client can submit their own pending request for an active service",
    () =>
      db.query(
        "insert into public.service_requests(client_id,service_id,requirements) values($1,$2,'My second request')",
        [ids.alice, ids.active],
      ),
  );
  await check("Client cannot submit a request for another user", () =>
    denied(
      "insert into public.service_requests(client_id,service_id,requirements) values($1,$2,'Impersonation')",
      [ids.bob, ids.active],
    ),
  );
  await check("Client cannot request an inactive service", () =>
    denied(
      "insert into public.service_requests(client_id,service_id,requirements) values($1,$2,'Inactive service')",
      [ids.alice, ids.inactive],
    ),
  );
  await check("Client cannot forge a request status", () =>
    denied(
      "insert into public.service_requests(client_id,service_id,requirements,status) values($1,$2,'Forged','completed')",
      [ids.alice, ids.active],
    ),
  );
  await check("Client cannot forge request timestamps", () =>
    denied(
      "insert into public.service_requests(client_id,service_id,requirements,created_at) values($1,$2,'Forged',now())",
      [ids.alice, ids.active],
    ),
  );
  await check("Client cannot update their own request", () =>
    rows(
      "update public.service_requests set status='completed' where client_id=$1 returning id",
      0,
      [ids.alice],
    ),
  );
  await check("Client cannot delete requests", () =>
    denied("delete from public.service_requests where client_id=$1", [
      ids.alice,
    ]),
  );
  await check("Client cannot update site content", () =>
    rows(
      "update public.site_content set content_text='Unauthorized' returning id",
      0,
    ),
  );
  await check("Client cannot insert site content", () =>
    denied("insert into public.site_content(section_name) values('untrusted')"),
  );
  await check("Client cannot delete site content", () =>
    denied("delete from public.site_content"),
  );

  await as("authenticated", ids.admin);
  await check("Admin reads all profiles without recursive RLS", () =>
    rows("select * from public.profiles", 3),
  );
  await check("Admin can update another profile", () =>
    rows(
      "update public.profiles set full_name='Bob Updated' where id=$1 returning id",
      1,
      [ids.bob],
    ),
  );
  await check("Admin can promote another client", () =>
    rows(
      "update public.profiles set role='admin' where id=$1 returning id",
      1,
      [ids.bob],
    ),
  );
  await check("Admin can demote another admin", () =>
    rows(
      "update public.profiles set role='client' where id=$1 returning id",
      1,
      [ids.bob],
    ),
  );
  await check("Admin sees inactive services too", () =>
    rows("select * from public.services", 2),
  );
  let temporary;
  await check("Admin can insert a service", async () => {
    const result = await rows(
      "insert into public.services(title) values('Temporary') returning id",
      1,
    );
    temporary = result[0].id;
  });
  await check("Admin can update a service", () =>
    rows(
      "update public.services set description='Updated' where id=$1 returning id",
      1,
      [temporary],
    ),
  );
  await check("Admin can delete an unreferenced service", () =>
    rows("delete from public.services where id=$1 returning id", 1, [
      temporary,
    ]),
  );
  await check("Admin reads all contact messages", () =>
    rows("select * from public.contact_messages", 2),
  );
  await check("Admin can update contact status", () =>
    rows("update public.contact_messages set status='read' returning id", 2),
  );
  await check("Admin can delete contact messages", () =>
    rows("delete from public.contact_messages returning id", 2),
  );
  await check("Admin reads all requests", () =>
    rows("select * from public.service_requests", 3),
  );
  await check("Admin can update all requests", () =>
    rows(
      "update public.service_requests set status='in_progress' returning id",
      3,
    ),
  );
  await check(
    "Admin cannot delete requests (not granted in the specification)",
    () => denied("delete from public.service_requests"),
  );
  await check("Admin can edit existing site content", () =>
    rows(
      "update public.site_content set content_text='Our company story' where section_name='about_us' returning id",
      1,
    ),
  );
  await check("Admin cannot insert new site content keys", () =>
    denied(
      "insert into public.site_content(section_name) values('new_section')",
    ),
  );
  await check("Admin cannot delete site content", () =>
    denied("delete from public.site_content"),
  );
  await check(
    "A referenced service cannot be deleted; deactivate it instead",
    () =>
      denied(
        "delete from public.services where id=$1",
        [ids.active],
        ["23001", "23503"],
      ),
  );
  await check("Cloudinary image URLs are accepted", () =>
    rows(
      "update public.site_content set image_url='https://res.cloudinary.com/demo/image/upload/sample.jpg' where section_name='about_us' returning id",
      1,
    ),
  );
  await check("Unsafe/non-Cloudinary image URLs are rejected", () =>
    denied(
      "update public.site_content set image_url='javascript:alert(1)' where section_name='about_us'",
      [],
      "23514",
    ),
  );
  await check("Negative prices are rejected", () =>
    denied(
      "insert into public.services(title,price) values('Invalid',-1)",
      [],
      "23514",
    ),
  );

  await as("postgres");
  await check("Auth email changes sync to the profile", async () => {
    await db.query(
      "update auth.users set email='alice-new@example.test' where id=$1",
      [ids.alice],
    );
    const result = await db.query(
      "select email from public.profiles where id=$1",
      [ids.alice],
    );
    assert.equal(result.rows[0].email, "alice-new@example.test");
  });
  await as("authenticated", ids.bob);
  await check("Bob cannot see Alice’s requests", () =>
    rows("select * from public.service_requests where client_id=$1", 0, [
      ids.alice,
    ]),
  );
  await as("authenticated", "");
  await check(
    "An authenticated role without a verified uid sees no profiles",
    () => rows("select * from public.profiles", 0),
  );
  await check(
    "An authenticated role without a verified uid cannot insert requests",
    () =>
      denied(
        "insert into public.service_requests(client_id,service_id,requirements) values($1,$2,'Missing uid')",
        [ids.alice, ids.active],
      ),
  );
  await as("postgres");
  await check(
    "Auth deletion cascades profile and client requests",
    async () => {
      await db.query("delete from auth.users where id=$1", [ids.alice]);
      await rows("select * from public.profiles where id=$1", 0, [ids.alice]);
      await rows(
        "select * from public.service_requests where client_id=$1",
        0,
        [ids.alice],
      );
    },
  );
  const bilingual = await readFile(
    new URL(
      "../supabase/migrations/202610030001_bilingual_content.sql",
      import.meta.url,
    ),
    "utf8",
  );
  await check("Bilingual follow-up migration applies", () =>
    db.exec(bilingual),
  );
  await check("Twelve Arabic/English content keys are provisioned", () =>
    rows(
      "select * from public.site_content where right(section_name,3) in ('_ar','_en')",
      12,
    ),
  );
  await as("authenticated", ids.admin);
  await check("Admin can update both service translation fields", () =>
    rows(
      "update public.services set title_i18n='{" +
        '\"ar\":\"خدمة المواقع\",\"en\":\"Website service\"' +
        "}'::jsonb, description_i18n='{" +
        '\"ar\":\"وصف الخدمة\",\"en\":\"Service description\"' +
        "}'::jsonb where id=$1 returning id",
      1,
      [ids.active],
    ),
  );
  await check("Non-string translation values are rejected", () =>
    denied(
      "update public.services set title_i18n='{" +
        '\"ar\":null' +
        "}'::jsonb where id=$1",
      [ids.active],
      "23514",
    ),
  );
  await check("Unexpected translation locales are rejected", () =>
    denied(
      "update public.services set title_i18n='{" +
        '\"fr\":\"Autre\"' +
        "}'::jsonb where id=$1",
      [ids.active],
      "23514",
    ),
  );
  await check("Overlong translated service titles are rejected", () =>
    denied(
      "update public.services set title_i18n=jsonb_build_object('ar',repeat('x',170)) where id=$1",
      [ids.active],
      "23514",
    ),
  );
  await as("authenticated", ids.bob);
  await check("Client cannot update service translations", () =>
    rows(
      "update public.services set title_i18n=jsonb_build_object('ar','Unauthorized') returning id",
      0,
    ),
  );
  await check("Client cannot insert a service with translations", () =>
    denied(
      "insert into public.services(title,title_i18n) values('Unauthorized',jsonb_build_object('ar','Unauthorized'))",
    ),
  );
  await as("anon");
  await check(
    "Public sees eighteen content keys and only active services",
    async () => {
      await rows("select * from public.site_content", 18);
      await rows("select * from public.services", 1);
    },
  );
  await as("postgres");
  await check(
    "Bilingual additions preserve all five RLS tables and nineteen policies",
    async () => {
      const rls = await db.query(
        "select count(*)::int as count from pg_tables where schemaname='public' and rowsecurity",
      );
      const policies = await db.query(
        "select count(*)::int as count from pg_policies where schemaname='public'",
      );
      assert.equal(rls.rows[0].count, 5);
      assert.equal(policies.rows[0].count, 19);
    },
  );
  console.log(
    `\n${count} local SQL/RLS checks passed. Remote Supabase execution/verification is still pending.`,
  );
} finally {
  await db.close();
}
