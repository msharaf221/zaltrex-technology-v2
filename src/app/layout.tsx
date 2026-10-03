import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Providers } from "@/components/providers";
import { ChatWidget } from "@/components/chat-widget";
import { dictionaries } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: {
      default:
        locale === "ar"
          ? "زالتريكس تكنولوجي | فكرتك تستاهل تجربة استثنائية"
          : "Zaltrex Technology | Big ideas. Beautifully simple.",
      template: "%s | Zaltrex Technology",
    },
    description: dictionaries[locale].home.intro,
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      id="top"
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-screen flex-col antialiased">
        <Providers locale={locale}>
          <a
            href="#main-content"
            className="sr-only z-[70] rounded-xl bg-blue-600 px-4 py-3 text-sm text-white focus:fixed focus:top-3 focus:start-3 focus:not-sr-only"
          >
            {dictionaries[locale].common.skip}
          </a>
          <SiteHeader />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
