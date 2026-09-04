import { useState } from 'react';
import { Tabs } from '@homedetailing/ui';

const items = [
  { id: 'active', label: 'Aktivní objednávky', count: 4 },
  { id: 'completed', label: 'Hotové objednávky', count: 27 },
  { id: 'pricing', label: 'Úprava ceníku' },
  { id: 'users', label: 'Uživatelé' },
];

export function Vertical() {
  const [value, setValue] = useState('active');
  return (
    <div style={{ width: 220 }}>
      <Tabs items={items} value={value} onChange={setValue} />
    </div>
  );
}

export function Horizontal() {
  const [value, setValue] = useState('pricing');
  return (
    <div style={{ width: 640 }}>
      <Tabs items={items} value={value} onChange={setValue} orientation="horizontal" />
    </div>
  );
}
