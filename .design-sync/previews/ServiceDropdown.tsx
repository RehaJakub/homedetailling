import { useState } from 'react';
import { ServiceDropdown } from '@homedetailing/ui';

const options = [
  { id: 1, name: 'Exteriér', price: 'Domluvou', showCurrency: false },
  { id: 2, name: 'Interiér', price: '1 500', showCurrency: true },
  { id: 3, name: 'Tepování', price: '500', showCurrency: true },
];

export function Closed() {
  const [value, setValue] = useState('');
  return (
    <div style={{ width: 320, background: '#1769ff', padding: 20 }}>
      <ServiceDropdown options={options} value={value} onChange={setValue} />
    </div>
  );
}

export function Selected() {
  const [value, setValue] = useState('Interiér');
  return (
    <div style={{ width: 320, background: '#1769ff', padding: 20 }}>
      <ServiceDropdown options={options} value={value} onChange={setValue} />
    </div>
  );
}

export function Open() {
  const [value, setValue] = useState('Interiér');
  return (
    <div style={{ width: 320, height: 300, background: '#1769ff', padding: 20 }}>
      <ServiceDropdown options={options} value={value} onChange={setValue} defaultOpen />
    </div>
  );
}

export function Light() {
  const [value, setValue] = useState('Tepování');
  return (
    <div style={{ width: 320, height: 300, padding: 20 }}>
      <ServiceDropdown tone="light" options={options} value={value} onChange={setValue} defaultOpen />
    </div>
  );
}
