// Concatenates the remote font import (used only by the design-system bundle;
// the Next app self-hosts Geist via next/font) with the shared stylesheet.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const css = [
  readFileSync(join(root, "fonts.css"), "utf8"),
  readFileSync(join(root, "src", "styles.css"), "utf8"),
].join("\n");

mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(join(root, "dist", "styles.css"), css);
console.log("dist/styles.css written");
