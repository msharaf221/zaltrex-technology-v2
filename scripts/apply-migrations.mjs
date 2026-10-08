import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

async function getAccessToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN) return process.env.SUPABASE_ACCESS_TOKEN;
  try {
    const raw = await readFile(join(homedir(), ".gemini/mcp-oauth-tokens.json"), "utf-8");
    const parsed = JSON.parse(raw);
    const entry = Array.isArray(parsed) ? parsed.find((p) => p.serverName === "supabase") : null;
    return entry?.token?.accessToken || "";
  } catch {
    return "";
  }
}

const ref = process.env.SUPABASE_PROJECT_REF || "yiuachxswvphzmrfcaoi";

async function runQuery(query) {
  const token = await getAccessToken();
  if (!token) throw new Error("Missing SUPABASE_ACCESS_TOKEN");
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Query failed HTTP ${res.status}: ${errorText}`);
  }
  return res.json();
}

async function main() {
  console.log("Applying Migration 1: 202610020001_zaltrex_initial.sql...");
  const migration1 = await readFile("./supabase/migrations/202610020001_zaltrex_initial.sql", "utf-8");
  await runQuery(migration1);
  console.log("✓ Migration 1 applied successfully.");

  console.log("Applying Migration 2: 202610030001_bilingual_content.sql...");
  const migration2 = await readFile("./supabase/migrations/202610030001_bilingual_content.sql", "utf-8");
  await runQuery(migration2);
  console.log("✓ Migration 2 applied successfully.");

  console.log("Seeding initial services...");
  const seedServicesSql = `
    insert into public.services (title, description, price, icon_name, is_active, title_i18n, description_i18n)
    values
      (
        'تطوير البرمجيات والأنظمة المخصصة',
        'بناء حلول برمجية متكاملة وقابلة للتوسع تلبي متطلبات الأعمال الأكثر تعقيداً بأحدث التقنيات وأعلى معايير الأمان.',
        null,
        'Code2',
        true,
        '{"ar": "تطوير البرمجيات والأنظمة المخصصة", "en": "Custom Software & Systems Engineering"}'::jsonb,
        '{"ar": "بناء حلول برمجية متكاملة وقابلة للتوسع تلبي متطلبات الأعمال الأكثر تعقيداً بأحدث التقنيات وأعلى معايير الأمان.", "en": "Engineering scalable enterprise web and cloud systems with modern architectures and rigorous engineering standards."}'::jsonb
      ),
      (
        'حلول الحوسبة السحابية و DevOps',
        'تصميم وإدارة البنى التحتية السحابية الهجينة والمتقدمة مع أتمتة دورات النشر المستمر والمراقبة اللحظية.',
        null,
        'Cloud',
        true,
        '{"ar": "حلول الحوسبة السحابية و DevOps", "en": "Cloud Infrastructure & DevOps"}'::jsonb,
        '{"ar": "تصميم وإدارة البنى التحتية السحابية الهجينة والمتقدمة مع أتمتة دورات النشر المستمر والمراقبة اللحظية.", "en": "Designing resilient cloud environments, container orchestration, CI/CD pipelines, and 24/7 observability."}'::jsonb
      ),
      (
        'الأمن السيبراني وحماية البيانات',
        'تقييم أمني شامل واختبار اختراق وتأمين التطبيقات والشبكات وفق أفضل معايير الامتثال والخصوصية العالمية.',
        null,
        'ShieldCheck',
        true,
        '{"ar": "الأمن السيبراني وحماية البيانات", "en": "Cybersecurity & Data Protection"}'::jsonb,
        '{"ar": "تقييم أمني شامل واختبار اختراق وتأمين التطبيقات والشبكات وفق أفضل معايير الامتثال والخصوصية العالمية.", "en": "Comprehensive vulnerability assessments, penetration testing, zero-trust architectures, and strict compliance."}'::jsonb
      ),
      (
        'أنظمة الذكاء الاصطناعي وأتمتة العمليات',
        'تطوير نماذج ذكاء اصطناعي مخصصة وأدوات معالجة لغوية متقدمة لرفع كفاءة الأعمال وأتمتة المهام الذكية.',
        null,
        'Cpu',
        true,
        '{"ar": "أنظمة الذكاء الاصطناعي وأتمتة العمليات", "en": "Applied AI & Intelligent Automation"}'::jsonb,
        '{"ar": "تطوير نماذج ذكاء اصطناعي مخصصة وأدوات معالجة لغوية متقدمة لرفع كفاءة الأعمال وأتمتة المهام الذكية.", "en": "Building domain-specific generative AI assistants, retrieval pipelines, and enterprise automation engines."}'::jsonb
      ),
      (
        'هندسة قواعد البيانات والبيانات الضخمة',
        'بناء قواعد بيانات فائقة السرعة مع تحسين الاستعلامات والنسخ المتماثل وضمان عدم انقطاع الخدمة.',
        null,
        'Database',
        true,
        '{"ar": "هندسة قواعد البيانات والبيانات الضخمة", "en": "Database Engineering & Big Data"}'::jsonb,
        '{"ar": "بناء قواعد بيانات فائقة السرعة مع تحسين الاستعلامات والنسخ المتماثل وضمان عدم انقطاع الخدمة.", "en": "High-performance data modeling, indexing, replication, and zero-downtime database lifecycle strategies."}'::jsonb
      ),
      (
        'البنية التحتية والاستضافة الموثوقة',
        'خدمات استضافة خوادم ومراكز بيانات عالية الأداء مع ضمان أوقات تشغيل متواصلة واستجابة فورية للأعطال.',
        null,
        'Server',
        true,
        '{"ar": "البنية التحتية والاستضافة الموثوقة", "en": "Enterprise Infrastructure Hosting"}'::jsonb,
        '{"ar": "خدمات استضافة خوادم ومراكز بيانات عالية الأداء مع ضمان أوقات تشغيل متواصلة واستجابة فورية للأعطال.", "en": "Mission-critical server deployment, low-latency global delivery, and high-availability disaster recovery."}'::jsonb
      )
    on conflict do nothing;
  `;
  await runQuery(seedServicesSql);
  console.log("✓ Services seeded successfully.");

  console.log("Verifying tables in public schema...");
  const tables = await runQuery("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
  console.log("Created tables:", tables.map(t => t.table_name));

  const countServices = await runQuery("SELECT count(*) as total FROM public.services;");
  console.log("Total services in database:", countServices);
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
