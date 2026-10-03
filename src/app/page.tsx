import { LandingPage } from "@/components/landing-page";
import { getLocalizedSiteContent } from "@/lib/queries";
import { getLocale } from "@/lib/locale-server";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const locale = await getLocale();
  const [hero, intro] = await Promise.all([
    getLocalizedSiteContent("home_hero", locale),
    getLocalizedSiteContent("home_intro", locale),
  ]);
  return (
    <LandingPage
      heroTitle={hero?.content_text.trim() || undefined}
      heroIntro={intro?.content_text.trim() || undefined}
    />
  );
}
