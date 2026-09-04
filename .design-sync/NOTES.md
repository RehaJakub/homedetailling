# design-sync notes

Repo-specific facts for syncing `@homedetailing/ui` (the `design-system/` package) to claude.ai/design.

## Build

- The package is not an npm workspace. The Next app imports it through the tsconfig path alias `@homedetailing/ui` → `design-system/src/index.ts`; the converter reads the compiled `design-system/dist/` (`npm run build:ui` = `tsc -p tsconfig.build.json` + `build-css.mjs`).
- `dist/styles.css` = `fonts.css` (Google Fonts `@import` for Geist / Geist Mono) + `src/styles.css`. The app never loads `fonts.css`; it self-hosts Geist via `next/font` and sets `--font-geist` / `--font-mono`, which the stylesheet falls back from. Expect `[FONT_REMOTE]` (informational) rather than `[FONT_MISSING]`.
- Converter invocation from the repo root:
  `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --entry ./design-system/dist/index.js --out ./ds-bundle`
- Headless render check uses the system Chrome, no playwright browser download:
  `DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` for `package-validate.mjs`, `package-capture.mjs` and `resync.mjs`.
- npm on this machine gates install scripts (`npm install-scripts`); esbuild in `.ds-sync/` works without its postinstall (the platform binary package is installed directly).

## Previews

- Preview files cannot import sibling helpers (`./shared/logo` fails to resolve under the story-imports policy). Anything shared is inlined per file; `SiteHeader.tsx` and `Footer.tsx` each carry an inline SVG wordmark standing in for `/public/home-detailing-logo.png`.
- `Dialog` previews pass `inline` so the modal renders in flow instead of `position: fixed` (which escapes the card).
- Interactive components (`ServiceDropdown`, `Tabs`, `BeforeAfterSlider`) are previewed with local `useState`; the dropdown's `defaultOpen` exists for the open-state cell.
- `dtsPropsFor` overrides exist because ts-morph strips the `...HTMLAttributes` spread: `Button` (href/type/disabled/onClick), `Input`/`Textarea`/`Select` (name/placeholder/value/…), `Card` (onSubmit), `Field` (htmlFor). Keep them in step with the source components when props change.
- All 22 components use `cardMode: "column"` except Badge, Eyebrow, Heading, Text (validate flagged the rest as wider than a grid cell).

## Known render warns

- None after the column overrides. `[FONT_REMOTE]` for Geist is expected.

## Re-sync risks

- `dtsPropsFor` bodies are hand-written copies of component prop types; a prop added to `Button`, `Input`, `Textarea`, `Select`, `Card` or `Field` must be mirrored in `.design-sync/config.json` or the design agent never sees it.
- Preview copy mirrors the live site's Czech content (`app/page.tsx`, `app/admin/page.tsx`); if the site copy changes, previews still render but drift from the product.
- The inline wordmark in the SiteHeader/Footer previews is a stand-in, not the real logo PNG.
- Fonts load from Google Fonts at render time inside claude.ai/design; offline renders fall back to Arial.
- Toolchain assumed: Node 26, npm 11, esbuild 0.28, ts-morph latest, system Chrome for the render check.
