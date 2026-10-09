import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { OG_IMAGE, SITE_URL } from "@/lib/seo";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Čištění aut Ostrava a okolí | Home Detailing",
    template: "%s | Home Detailing",
  },
  description:
    "Mobilní čištění aut v Ostravě, Havířově a Frýdku-Místku. Přijedeme s vlastní vodou i elektřinou. Vyberte si termín online.",
  applicationName: "Home Detailing",
  category: "automotive",
  creator: "Home Detailing",
  publisher: "Home Detailing",
  manifest: "/manifest.webmanifest",
  formatDetection: { email: false, address: false, telephone: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "/",
    siteName: "Home Detailing",
    title: "Čištění aut Ostrava a okolí | Home Detailing",
    description: "Mobilní čištění interiéru a exteriéru aut v Ostravě, Havířově a Frýdku-Místku. Vyberte si termín online.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Čištění aut Ostrava a okolí | Home Detailing",
    description: "Mobilní čištění aut v Ostravě, Havířově a Frýdku-Místku. Vyberte si termín online.",
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={`${geist.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
