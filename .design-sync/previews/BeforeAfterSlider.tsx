import { BeforeAfterSlider } from '@homedetailing/ui';

export function Default() {
  return (
    <div style={{ width: 360, background: '#080b12', padding: 20 }}>
      <BeforeAfterSlider number="01" title="Sedadla" description="Fleky a zašlá látka → Hloubkově vyčištěno" />
    </div>
  );
}

export function MostlyAfter() {
  return (
    <div style={{ width: 360, background: '#080b12', padding: 20 }}>
      <BeforeAfterSlider number="02" title="Karoserie" description="Silniční nečistoty → Lesk bez šmouh" initialPosition={25} />
    </div>
  );
}

export function EnglishLabels() {
  return (
    <div style={{ width: 360, background: '#080b12', padding: 20 }}>
      <BeforeAfterSlider title="Kufr" description="Prach a drobky → Čistý každý detail" beforeLabel="BEFORE" afterLabel="AFTER" initialPosition={70} />
    </div>
  );
}
