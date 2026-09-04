import { Textarea } from '@homedetailing/ui';

export function Light() {
  return (
    <div style={{ width: 320 }}>
      <Textarea name="items" defaultValue={'Koberce látkové a gumové\nPlasty\nVysávání\nVnitřní okna'} />
    </div>
  );
}

export function OnBlue() {
  return (
    <div style={{ width: 320, background: '#1769ff', padding: 20 }}>
      <Textarea tone="on-blue" name="note" placeholder="Poznámka (nepovinná)" />
    </div>
  );
}
