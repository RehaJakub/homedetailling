# Home Detailing UI conventions

`@homedetailing/ui` is the design system of Home Detailing, a mobile car-detailing service in Ostrava. Everything the customer sees is in **Czech**; identifiers are English. The look is sharp-cornered (no border radius anywhere except round pills and the slider handle), high-contrast, and built on three colours: brand blue `#1769ff`, near-black `#080b12`, white. Typography is Geist (sans) with Geist Mono for tiny uppercase labels.

## Setup

No provider is needed. Load `styles.css` (it `@import`s the component CSS and the Geist font faces) and use components from `window.HomeDetailingUI`. Components are plain React 19 function components; the styling is class-based and ships with the bundle, so nothing renders unstyled if `styles.css` is present.

## Styling idiom

Style with **component props**, not CSS classes. Every visual variant is a prop (`variant`, `tone`, `size`, `layout`). For layout glue around components, use inline `style` with the CSS custom properties below; there are no utility classes.

Tokens (all defined on `:root` in `styles.css`):

| Purpose | Token |
|---|---|
| Brand blue / soft tint / text on blue | `--hd-blue`, `--hd-blue-soft`, `--hd-blue-tint`, `--hd-blue-tint-strong` |
| Ink / muted text / hairlines | `--hd-black`, `--hd-gray`, `--hd-gray-light`, `--hd-line`, `--hd-line-soft` |
| Surfaces | `--hd-white`, `--hd-surface` (light grey tray), `--hd-dark-surface`, `--hd-dark-line`, `--hd-dark-muted` |
| Destructive | `--hd-danger`, `--hd-danger-soft`, `--hd-danger-line` |
| Type | `--hd-font-sans`, `--hd-font-mono` |
| Shadows / motion | `--hd-shadow-blue`, `--hd-shadow-dark`, `--hd-shadow-hover`, `--hd-shadow-panel`, `--hd-ease` |

Three surface contexts recur and most components have a matching `tone`:

- **White page** (default): `Eyebrow`, `Text tone="muted"`, `Input`/`Textarea`/`Select tone="light"`, `Button variant="primary" | "dark"`.
- **Blue band** (`background: var(--hd-blue)`, the contact/reservation section): `Eyebrow tone="on-blue"`, `Text tone="on-blue"`, inputs with `tone="on-blue"`, `ServiceDropdown` (default tone), `Button variant="light"`, `Notice tone="on-blue"`.
- **Dark band** (`background: var(--hd-black)`, the gallery): `Eyebrow tone="on-dark"`, `Text tone="on-dark"`, `BeforeAfterSlider`.

## Page anatomy

- Public site: `SiteHeader` → `Container as="section"` blocks, each opened by `Eyebrow` + `Heading size="section"` (wrap the accent word in `<em>`) + `Text tone="muted" lead` → `Footer`. The hero uses `Heading level={1} size="display"`.
- Services: `ServiceGrid` containing three `ServiceCard`s. Gallery: a three-column grid of `BeforeAfterSlider`. Pricing: a three-column grid of `PriceCard` with the middle one `featured`.
- Admin: dark page background, one `Card variant="panel"` holding `Eyebrow` + `Heading size="panel"`, a vertical `Tabs` beside `DataTable` or a grid of `Card as="form"` blocks made of `Field` + `Input`/`Select`/`Textarea` and a `Button type="submit"`. Confirmations and success messages use `Dialog` with one or two `Button`s in `actions`.
- One call to action per screen: `Button variant="primary" icon="arrow-up-right"`; secondary actions are `variant="dark"`; destructive ones `variant="danger"` in dialogs and `variant="outline-danger" size="sm"` in tables.
- Icons are inline stroke SVGs on a 24px grid, never emoji. `Button` provides the two the brand uses (`icon="arrow-up-right" | "arrow-down"`).

## Example

```tsx
const { Container, Eyebrow, Heading, Text, PriceCard, Button } = window.HomeDetailingUI;

<Container as="section" style={{ paddingTop: 120, paddingBottom: 120 }}>
  <Eyebrow>Ceník</Eyebrow>
  <Heading level={2} size="section">Vyberte péči pro <em>vaše auto.</em></Heading>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20 }}>
    <PriceCard name="Exteriér" price="Domluvou" showCurrency={false} items={['Čištění kol', 'Voskování']} />
    <PriceCard featured name="Interiér" price="1 500" items={['Vysávání', 'Plasty', 'Vnitřní okna']} />
    <PriceCard name="Tepování" price="500" items={['Tepování sedaček']} />
  </div>
  <Button href="#kontakt" variant="primary" icon="arrow-up-right">Chci čisté auto</Button>
</Container>
```

# HomeDetailingUI (@homedetailing/ui@0.1.0)

This design system is the published @homedetailing/ui React library, bundled as a single
browser global. All 22 components are the real upstream code.

## Where things are

- `_ds_bundle.js` — the whole-DS bundle at the project root; loads every component to `window.HomeDetailingUI`. First line is a `/* @ds-bundle: … */` metadata header.
- `styles.css` — the single stylesheet entry: it `@import`s the tokens, fonts, and component styles (`_ds_bundle.css`). Link this one file.
- `components/<group>/<Name>/<Name>.prompt.md` (example JSX + variants), `<Name>.d.ts` (types), `<Name>.html` (variant grid).
- `tokens/*.css` — CSS custom properties, names verbatim from upstream.
- `fonts/` — `@font-face` files + `fonts.css` (when the package ships fonts).

For a specific component, `read_file("components/<group>/<Name>/<Name>.prompt.md")`.

## Loading

Add these two lines to your page once (React must be on the page first):

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

Components are then available at `window.HomeDetailingUI.*`. Mount into a dedicated child node (e.g. `<div id="ds-root">`), not the host page's own React root, so the two trees don't collide:

```jsx
const { Badge } = window.HomeDetailingUI;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<Badge />);
```

## Tokens

24 CSS custom properties from @homedetailing/ui. Names are
preserved verbatim from upstream. They are declared inside `_ds_bundle.css` (this DS ships one compiled stylesheet rather than separate token files).

- **color** (2): `--hd-surface`, `--hd-dark-surface`
- **typography** (2): `--hd-font-sans`, `--hd-font-mono`
- **shadow** (4): `--hd-shadow-blue`, `--hd-shadow-dark`, `--hd-shadow-hover`, …
- **other** (16): `--hd-blue`, `--hd-blue-soft`, `--hd-blue-tint`, …

## Components

### content
- `Badge` — Small tag: the NEJOBLBENJ corner label, a status pill, or a count.
- `BeforeAfterSlider` — Dark before/after comparison card with a draggable divider.
- `Notice` — Inline status message for forms and panels.
- `PriceCard` — Pricing package card. Hover paints it brand blue featured adds the corner badge.
- `ServiceCard` — One service in the Co umme grid: index, icon, title and a short description.
- `ServiceGrid` — Three-column ruled grid for ServiceCards collapses to a single column under 850px.

### actions
- `Button` — Sharp-cornered brand button with a lift-on-hover motion. Renders a link when href is given.

### layout
- `Card` — Bordered white surface used for admin forms and panels. Can render as a form.
- `Container` — Centered page column, 1180px wide with 20px side gutters (15px on phones).
- `Footer` — Three-part page footer: logo, tagline, copyright. Stacks and centers on phones.
- `SiteHeader` — Public site header: logo left, navigation right, collapsing to a toggle menu under 650px.

### data
- `DataTable` — Bordered admin table that turns into stacked labelled cards under 760px.

### overlays
- `Dialog` — Centered modal panel on a blurred dark backdrop. Used for confirmations and success messages.

### typography
- `Eyebrow` — Small mono-spaced uppercase label that opens a section (MOBILN DETAILING  OSTRAVA A OKOL).
- `Heading` — Tight, heavy headline. Wrap a word in em to paint it brand blue.
- `Text` — Body paragraph with the brand's 1.7 line height.

### forms
- `Field` — Label wrapper for a single form control. Uppercase grey label by default.
- `Input` — Text input. Checkboxes get the compact brand-blue accent automatically.
- `Select` — Native select styled like the other inputs.
- `ServiceDropdown` — Custom select listing service packages with their price. Writes the choice to a hidden input.
- `Textarea` — Multi-line text input, vertically resizable.

### navigation
- `Tabs` — Segmented tab list on a grey tray the active tab fills brand blue.
