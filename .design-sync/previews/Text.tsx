import { Text } from '@homedetailing/ui';

export function Lead() {
  return (
    <Text tone="muted" lead>
      Přijedeme za vámi domů nebo do práce a postaráme se o interiér i exteriér vašeho auta v Ostravě a okolí.
    </Text>
  );
}

export function Default() {
  return <Text>Profesionální výsledek bez čekání a bez ztraceného času.</Text>;
}

export function Small() {
  return (
    <Text tone="muted" size="sm">
      Šetrné ruční mytí, kola, sušení a ochrana laku přímo u vás.
    </Text>
  );
}

export function OnDark() {
  return (
    <div style={{ background: '#080b12', padding: 24 }}>
      <Text tone="on-dark" lead>
        Posuňte jezdec a podívejte se, co dokáže poctivý detailing.
      </Text>
    </div>
  );
}

export function OnBlue() {
  return (
    <div style={{ background: '#1769ff', padding: 24 }}>
      <Text tone="on-blue" size="sm">
        Vyplňte rezervaci. Ozveme se vám s potvrzením termínu a cenou.
      </Text>
    </div>
  );
}
