import { ServiceCard } from '@homedetailing/ui';

export function Default() {
  return (
    <div style={{ width: 380, border: '1px solid #e1e5eb' }}>
      <ServiceCard number="01" title="Interiér" text="Vysátí, tepování, čištění plastů, oken a kompletní péče o kabinu." />
    </div>
  );
}

export function CustomIcon() {
  return (
    <div style={{ width: 380, border: '1px solid #e1e5eb' }}>
      <ServiceCard
        number="03"
        title="Přijedeme za vámi"
        text="Přijedeme domů nebo do práce v Ostravě a okolí."
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 13l2-5h12l3 5v4H3z" />
            <circle cx="7.5" cy="17" r="1.5" />
            <circle cx="16.5" cy="17" r="1.5" />
          </svg>
        }
      />
    </div>
  );
}
