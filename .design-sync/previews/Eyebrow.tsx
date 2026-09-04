import { Eyebrow } from '@homedetailing/ui';

export function Blue() {
  return <Eyebrow>Mobilní detailing · Ostrava a okolí</Eyebrow>;
}

export function Muted() {
  return <Eyebrow tone="muted">Co umíme</Eyebrow>;
}

export function OnBlue() {
  return (
    <div style={{ background: '#1769ff', padding: 24 }}>
      <Eyebrow tone="on-blue">Auto, které dělá radost</Eyebrow>
    </div>
  );
}

export function OnDark() {
  return (
    <div style={{ background: '#080b12', padding: 24 }}>
      <Eyebrow tone="on-dark">Výsledek mluví za nás</Eyebrow>
    </div>
  );
}
