import { Field, Input, Select, Textarea } from '@homedetailing/ui';

export function Default() {
  return (
    <div style={{ width: 320 }}>
      <Field label="Název"><Input name="name" defaultValue="Interiér" /></Field>
    </div>
  );
}

export function Stacked() {
  return (
    <div style={{ width: 320 }}>
      <Field label="E-mail" layout="stacked"><Input name="email" type="email" placeholder="jana@priklad.cz" /></Field>
    </div>
  );
}

export function Inline() {
  return (
    <Field label="Zobrazit Kč" layout="inline"><Input name="showCurrency" type="checkbox" defaultChecked /></Field>
  );
}

export function WithSelect() {
  return (
    <div style={{ width: 320 }}>
      <Field label="Role">
        <Select name="role" defaultValue="manager" options={[{ value: 'admin', label: 'Admin' }, { value: 'manager', label: 'Správce' }, { value: 'viewer', label: 'Pouze čtení' }]} />
      </Field>
    </div>
  );
}

export function WithTextarea() {
  return (
    <div style={{ width: 320 }}>
      <Field label="Popisky"><Textarea name="items" defaultValue={'Tepování koberců po domluvě\nTepování sedaček'} /></Field>
    </div>
  );
}
