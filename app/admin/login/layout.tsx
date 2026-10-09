import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Přihlášení | Home Detailing" },
  alternates: { canonical: "/admin/login" },
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
