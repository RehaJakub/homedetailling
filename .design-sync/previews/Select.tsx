import { Select } from '@homedetailing/ui';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Správce' },
  { value: 'viewer', label: 'Pouze čtení' },
];

export function Light() {
  return (
    <div style={{ width: 320 }}>
      <Select name="role" defaultValue="manager" options={roles} />
    </div>
  );
}

export function OnBlue() {
  return (
    <div style={{ width: 320, background: '#1769ff', padding: 20 }}>
      <Select tone="on-blue" name="service" options={[{ value: 'interier', label: 'Interiér' }, { value: 'exterier', label: 'Exteriér' }, { value: 'tepovani', label: 'Tepování' }]} />
    </div>
  );
}
