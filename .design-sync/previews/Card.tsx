import { Button, Card, Eyebrow, Field, Heading, Input, Text, Textarea } from '@homedetailing/ui';

export function FormCard() {
  return (
    <div style={{ width: 360 }}>
      <Card as="form" title="Interiér" onSubmit={(e) => e.preventDefault()}>
        <Field label="Název"><Input name="name" defaultValue="Interiér" /></Field>
        <Field label="Cena"><Input name="price" defaultValue="1 500" /></Field>
        <Field label="Zobrazit Kč" layout="inline"><Input name="showCurrency" type="checkbox" defaultChecked /></Field>
        <Field label="Popisky"><Textarea name="items" defaultValue={'Koberce látkové a gumové\nPlasty\nVysávání'} /></Field>
        <Button type="submit">Uložit změny</Button>
      </Card>
    </div>
  );
}

export function Dashed() {
  return (
    <div style={{ width: 360 }}>
      <Card as="form" variant="dashed" title="Přidat balíček" onSubmit={(e) => e.preventDefault()}>
        <Field label="Název"><Input name="name" placeholder="Např. Keramická ochrana" /></Field>
        <Field label="Cena"><Input name="price" placeholder="2 900" /></Field>
        <Button type="submit">Přidat balíček</Button>
      </Card>
    </div>
  );
}

export function Panel() {
  return (
    <div style={{ background: '#080b12', padding: 40 }}>
      <Card as="section" variant="panel" style={{ width: 420 }}>
        <Eyebrow>Home Detailing</Eyebrow>
        <Heading level={1} size="panel" style={{ margin: '16px 0 8px' }}>Admin panel</Heading>
        <Text tone="muted">Přihlášení pro správce webu.</Text>
      </Card>
    </div>
  );
}
