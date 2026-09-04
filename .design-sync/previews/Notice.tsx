import { Notice } from '@homedetailing/ui';

export function ErrorBox() {
  return (
    <div style={{ width: 360 }}>
      <Notice tone="error">Databáze není dostupná.</Notice>
    </div>
  );
}

export function Info() {
  return (
    <div style={{ width: 360 }}>
      <Notice tone="info">Změna ceníku byla provedena.</Notice>
    </div>
  );
}

export function OnBlue() {
  return (
    <div style={{ width: 360, background: '#1769ff', padding: 20 }}>
      <Notice tone="on-blue">Rezervaci se nepodařilo uložit. Zkuste to znovu.</Notice>
    </div>
  );
}
