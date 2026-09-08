import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Home Detailing – mobilní čištění aut",
    short_name: "Home Detailing",
    description: "Mobilní čištění a detailing aut v Ostravě, Havířově, Frýdku-Místku a okolí.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1769ff",
    lang: "cs",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
