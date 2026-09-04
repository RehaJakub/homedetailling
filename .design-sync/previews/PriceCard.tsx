import { PriceCard } from '@homedetailing/ui';

const grid = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20, padding: 20 };

export function Pricing() {
  return (
    <div style={grid}>
      <PriceCard name="Exteriér" price="Domluvou" showCurrency={false} items={['Čištění kol', 'Umytí rukavicí', 'Voskování', 'Čištění vnějších skel']} />
      <PriceCard featured name="Interiér" price="1 500" duration="cca 2 h 30 min" items={['Koberce látkové a gumové', 'Plasty', 'Vysávání', 'Vnitřní okna', 'Čištění kůže a impregnace', 'Stropnice po domluvě']} />
      <PriceCard name="Tepování" price="500" items={['Tepování koberců po domluvě', 'Tepování sedaček']} />
    </div>
  );
}

export function FromPrice() {
  return (
    <div style={{ width: 360, padding: 20 }}>
      <PriceCard name="Keramická ochrana" price="2 900" from items={['Dekontaminace laku', 'Nanesení keramiky', 'Ochrana na 12 měsíců']} ctaLabel="Poptat" />
    </div>
  );
}
