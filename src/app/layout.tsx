import NextTopLoader from "nextjs-toploader";
import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import type { ReactNode } from "react";

import AuthProvider from "@/components/auth/AuthProvider";
import ThemeInjector from "@/components/system/ThemeInjector";
import { SITE_URL, resolveOgImageUrl } from "@/lib/seo";
import { getMarketingSnapshot } from "@/lib/supabase/queries";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getMarketingSnapshot();
  const siteName = settings.site_name;
  
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `Gimnasio en Chiclayo | ${siteName} Gym`,
      template: `%s | ${siteName}`,
    },
    description: settings.seo_description,
    keywords: settings.seo_keywords,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    icons: {
      icon: settings.favicon_url ?? "/images/favicon/ico.png",
      shortcut: settings.favicon_url ?? "/images/favicon/ico.png",
      apple: settings.favicon_url ?? "/images/favicon/ico.png",
    },
    openGraph: {
      title: `Gimnasio en Chiclayo | ${siteName} Gym`,
      description: settings.seo_description,
      images: [
        {
          url: resolveOgImageUrl(settings.seo_og_image_url),
          alt: siteName,
        },
      ],
      locale: "es_PE",
      siteName: siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Gimnasio en Chiclayo | ${siteName} Gym`,
      description: settings.seo_description,
      images: [resolveOgImageUrl(settings.seo_og_image_url)],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { settings } = await getMarketingSnapshot();

  return (
    <html lang="es-PE" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <ThemeInjector config={settings.theme_config} />
      </head>
      <body
        className={`${inter.variable} ${oswald.variable} bg-background text-foreground antialiased font-primary-dynamic`}
        suppressHydrationWarning
      >
        <NextTopLoader color={settings.theme_config.colors.primary} showSpinner={false} shadow={false} height={3} />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
