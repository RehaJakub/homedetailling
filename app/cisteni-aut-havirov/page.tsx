import type { Metadata } from "next";
import Home from "@/app/page";
import { CITY_PAGES, pageMetadata } from "@/lib/seo";

const page = CITY_PAGES[1];

export const metadata: Metadata = pageMetadata(page);

export default function HavirovPage() {
  return <Home />;
}
