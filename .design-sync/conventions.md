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
