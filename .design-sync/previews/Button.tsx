import { Button } from '@homedetailing/ui';

const row = { display: 'flex', flexWrap: 'wrap' as const, gap: 16, alignItems: 'center', padding: 8 };

export function Variants() {
  return (
    <div style={row}>
      <Button variant="primary" icon="arrow-up-right">Chci čisté auto</Button>
      <Button variant="dark" icon="arrow-down">Zobrazit ceník</Button>
      <Button variant="ghost">Vrátit</Button>
      <Button variant="danger">Smazat</Button>
      <Button variant="outline-danger">Smazat</Button>
    </div>
  );
}

export function OnBlue() {
  return (
    <div style={{ ...row, background: '#1769ff', padding: 24 }}>
      <Button variant="light" icon="arrow-up-right">Odeslat rezervaci</Button>
      <Button variant="light" disabled>Ukládám…</Button>
    </div>
  );
}

export function Small() {
  return (
    <div style={row}>
      <Button variant="primary" size="sm">Hotovo</Button>
      <Button variant="outline-danger" size="sm">Smazat</Button>
      <Button variant="primary" size="sm" disabled>Hotovo</Button>
    </div>
  );
}

export function AsLink() {
  return (
    <div style={row}>
      <Button href="#kontakt" variant="dark" nav icon="arrow-up-right">Objednat termín</Button>
      <Button href="#cenik" variant="primary" icon="arrow-up-right">Objednat</Button>
    </div>
  );
}

export function FullWidth() {
  return (
    <div style={{ width: 320, padding: 8 }}>
      <Button variant="dark" fullWidth icon="arrow-up-right">Objednat</Button>
    </div>
  );
}
