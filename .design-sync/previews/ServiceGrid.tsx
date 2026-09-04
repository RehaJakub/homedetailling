import { ServiceCard, ServiceGrid } from '@homedetailing/ui';

export function ThreeServices() {
  return (
    <ServiceGrid>
      <ServiceCard number="01" title="Interiér" text="Vysátí, tepování, čištění plastů, oken a kompletní péče o kabinu." />
      <ServiceCard number="02" title="Exteriér" text="Šetrné ruční mytí, kola, sušení a ochrana laku přímo u vás." />
      <ServiceCard number="03" title="Přijedeme za vámi" text="Přijedeme domů nebo do práce v Ostravě a okolí." />
    </ServiceGrid>
  );
}
