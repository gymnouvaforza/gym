import NextTopLoader from "nextjs-toploader";
import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import type { ReactNode } from "react";

import AuthProvider from "@/components/auth/AuthProvider";
import { DEFAULT_SITE_NAME, SITE_URL, resolveOgImageUrl } from "@/lib/seo";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Gimnasio en Chiclayo | ${DEFAULT_SITE_NAME} Gym`,
    template: `%s | ${DEFAULT_SITE_NAME}`,
  },
  description:
    "Entrenamiento de fuerza de alto nivel, equipamiento premium y acompañamiento real en Chiclayo. Progreso sostenible para atletas y principiantes.",
  keywords: [
    "gimnasio chiclayo",
    "entrenamiento de fuerza",
    "crossfit chiclayo",
    "musculación",
    "mejor gym chiclayo",
    "fitness peru",
  ],
  authors: [{ name: DEFAULT_SITE_NAME }],
  creator: DEFAULT_SITE_NAME,
  publisher: DEFAULT_SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/images/favicon/ico.png",
    shortcut: "/images/favicon/ico.png",
    apple: "/images/favicon/ico.png",
  },
  openGraph: {
    title: `Gimnasio en Chiclayo | ${DEFAULT_SITE_NAME} Gym`,
    description:
      "Entrenamiento de fuerza de alto nivel y equipamiento premium en Chiclayo. Únete a la élite.",
    images: [
      {
        url: resolveOgImageUrl(null),
        alt: DEFAULT_SITE_NAME,
      },
    ],
    locale: "es_PE",
    siteName: DEFAULT_SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Gimnasio en Chiclayo | ${DEFAULT_SITE_NAME} Gym`,
    description: "Entrenamiento de fuerza de alto nivel en Chiclayo. Resultados reales.",
    images: [resolveOgImageUrl(null)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es-PE" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${oswald.variable} bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <NextTopLoader color="#d71920" showSpinner={false} shadow={false} height={3} />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
