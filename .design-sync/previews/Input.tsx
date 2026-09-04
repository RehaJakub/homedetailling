import { Input } from '@homedetailing/ui';

const col = { display: 'grid', gap: 10, width: 320 };

export function Light() {
  return (
    <div style={col}>
      <Input name="name" placeholder="Jméno a příjmení" />
      <Input name="email" type="email" defaultValue="jana.novakova@priklad.cz" />
      <Input name="code" readOnly defaultValue="Pouze ke čtení" />
      <Input name="password" type="password" defaultValue="tajneheslo" />
    </div>
  );
}

export function OnBlue() {
  return (
    <div style={{ ...col, background: '#1769ff', padding: 20 }}>
      <Input tone="on-blue" name="name" placeholder="Jméno a příjmení" />
      <Input tone="on-blue" name="phone" type="tel" defaultValue="+420 777 123 456" />
      <Input tone="on-blue" name="address" placeholder="Přesná adresa (ulice, číslo, město)" />
    </div>
  );
}

export function Checkbox() {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <Input type="checkbox" defaultChecked />
      <Input type="checkbox" />
    </div>
  );
}
