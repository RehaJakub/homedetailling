import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ModelViewerLoader } from "@/components/ModelViewerLoader";
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
  metadataBase: new URL("https://homedetailing.cz"),
  title: {
    default: "Mobilní čištění aut Ostrava a okolí | Home Detailing",
    template: "%s | Home Detailing",
  },
  description:
    "Mobilní čištění a detailing aut v Ostravě, Havířově, Frýdku-Místku a okolí. Přijedeme za vámi domů nebo do práce. Rezervujte si termín online.",
  keywords: [
    "čištění aut Ostrava",
    "mobilní detailing Ostrava",
    "čištění interiéru auta Ostrava",
    "tepování aut Ostrava",
    "detailing aut Ostrava",
    "čištění aut Havířov",
    "detailing Havířov",
    "čištění aut Frýdek-Místek",
    "mobilní čištění aut",
    "čištění auta doma",
  ],
  applicationName: "Home Detailing",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "/",
    siteName: "Home Detailing",
    title: "Mobilní čištění aut Ostrava a okolí | Home Detailing",
    description: "Profesionální čištění interiéru a exteriéru vozů u vás doma v Ostravě, Havířově, Frýdku-Místku a okolí.",
    images: [{ url: "/images/home-detailing-logo.png", width: 2073, height: 758, alt: "Home Detailing – mobilní čištění aut" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobilní čištění aut Ostrava a okolí | Home Detailing",
    description: "Profesionální mobilní detailing v Ostravě, Havířově, Frýdku-Místku a okolí.",
    images: ["/images/home-detailing-logo.png"],
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
        <ModelViewerLoader />
        {children}
      </body>
    </html>
  );
}
