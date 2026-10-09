import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Administrace | Home Detailing" },
  description: "Zabezpečená administrace rezervací Home Detailing.",
  alternates: { canonical: "/admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
