import { useState } from 'react';
import { ServiceChecklist } from '@homedetailing/ui';

const options = [
  { id: 1, name: 'Exteriér', price: 'Domluvou', showCurrency: false, durationMinutes: 180 },
  { id: 2, name: 'Interiér', price: '1 500', showCurrency: true, durationMinutes: 150 },
  { id: 3, name: 'Tepování', price: 'od 500', showCurrency: true, durationMinutes: 90 },
];

export function OnBlue() {
  const [values, setValues] = useState(['Interiér']);
  return (
    <div style={{ width: 360, background: '#1769ff', padding: 20 }}>
      <ServiceChecklist options={options} values={values} onChange={setValues} />
    </div>
  );
}

export function Light() {
  const [values, setValues] = useState(['Interiér', 'Tepování']);
  return (
    <div style={{ width: 360, padding: 20 }}>
      <ServiceChecklist tone="light" options={options} values={values} onChange={setValues} />
    </div>
  );
}

export function Empty() {
  const [values, setValues] = useState<string[]>([]);
  return (
    <div style={{ width: 360, background: '#1769ff', padding: 20 }}>
      <ServiceChecklist options={options} values={values} onChange={setValues} />
    </div>
  );
}
