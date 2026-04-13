import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import type { ReactNode } from "react";

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
    default: "Gimnasio en Chiclayo",
    template: `%s | ${DEFAULT_SITE_NAME}`,
  },
  description:
    "Entrenamiento de fuerza, horarios amplios y acompanamiento real en Chiclayo para quienes buscan progreso sostenible.",
  icons: {
    icon: "/images/favicon/ico.png",
    shortcut: "/images/favicon/ico.png",
    apple: "/images/favicon/ico.png",
  },
  openGraph: {
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
        {children}
      </body>
    </html>
  );
}
