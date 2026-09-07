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
  title: "Home Detailing | Mobilní čištění aut",
  description:
    "Mobilní detailing interiéru a exteriéru v Ostravě a okolí.",
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
