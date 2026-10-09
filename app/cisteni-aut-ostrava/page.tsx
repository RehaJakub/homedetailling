import type { Metadata } from "next";
import Home from "@/app/page";
import { CITY_PAGES, pageMetadata } from "@/lib/seo";

const page = CITY_PAGES[0];

export const metadata: Metadata = pageMetadata(page);

export default function OstravaPage() {
  return <Home />;
}
