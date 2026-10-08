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
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

async function updateContent() {
  const updates = [
    {
      section: "about_us_ar",
      content: "تأسست شركة زالتريكس تكنولوجي (Zaltrex Technology) لتكون الشريك الهندسي الاستراتيجي للشركات والمؤسسات الطامحة للريادة الرقمية. نبتكر حلولاً متقدمة في هندسة البرمجيات، الحوسبة السحابية، الأمن السيبراني، وأنظمة الذكاء الاصطناعي مع التزام صارم بأعلى معايير الموثوقية والأمان."
    },
    {
      section: "about_us_en",
      content: "Zaltrex Technology was founded to be the strategic engineering partner for forward-thinking enterprises. We pioneer high-reliability software architectures, resilient cloud infrastructures, cybersecurity frameworks, and generative AI systems with an uncompromising focus on quality and security."
    },
    {
      section: "home_hero_ar",
      content: ""
    },
    {
      section: "home_hero_en",
      content: ""
    },
    {
      section: "home_intro_ar",
      content: "نحول التحديات التقنية المعقدة إلى حلول برمجية سلسة ومستدامة تمكن فريقك من التوسع والابتكار بثقة كاملة."
    },
    {
      section: "home_intro_en",
      content: "Transforming intricate technical challenges into robust, high-performance software systems that empower your enterprise to scale."
    },
    {
      section: "solutions_intro_ar",
      content: "حلول هندسية مصممة خصيصاً لتلبية متطلبات المشاريع الطموحة مع ضمان أعلى مستويات الكفاءة والموثوقية."
    },
    {
      section: "solutions_intro_en",
      content: "Tailored engineering capabilities built for mission-critical operations with top-tier reliability and continuous availability."
    },
    {
      section: "contact_intro_ar",
      content: "فريقنا الهندسي جاهز للإجابة على استفساراتك ومناقشة تفاصيل مشروعك القادم وتحديد الحلول الأمثل لاحتياجاتك."
    },
    {
      section: "contact_intro_en",
      content: "Our engineering team is ready to answer your questions, explore your technical roadmap, and architect the optimal solution."
    },
    {
      section: "request_service_intro_ar",
      content: "اختر الخدمة المطلوبة وحدد نطاق العمل والمتطلبات لبدء التخطيط الهندسي وتخصيص الموارد لمشروعك."
    },
    {
      section: "request_service_intro_en",
      content: "Select your desired capability and define scope and specifications to initiate engineering planning and resource allocation."
    }
  ];

  for (const item of updates) {
    const escaped = item.content.replaceAll("'", "''");
    await runQuery(`
      update public.site_content
      set content_text = '${escaped}'
      where section_name = '${item.section}';
    `);
  }
  console.log("✓ Site content populated successfully.");

  const results = await runQuery("SELECT section_name, left(content_text, 40) as preview FROM public.site_content ORDER BY section_name;");
  console.log("Current site content rows:", results);
}

updateContent().catch(console.error);
