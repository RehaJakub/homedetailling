import { Button, DataTable } from '@homedetailing/ui';

const columns = [
  { key: 'name', label: 'Klient' },
  { key: 'phone', label: 'Telefon' },
  { key: 'email', label: 'E-mail' },
  { key: 'service', label: 'Služba' },
  { key: 'address', label: 'Adresa' },
  { key: 'note', label: 'Poznámka' },
  { key: 'actions', label: 'Akce', actions: true },
];

const actions = (
  <>
    <Button variant="primary" size="sm">Hotovo</Button>
    <Button variant="outline-danger" size="sm">Smazat</Button>
  </>
);

export function Reservations() {
  return (
    <DataTable
      columns={columns}
      rows={[
        { id: 1, cells: { name: <strong>Jana Nováková</strong>, phone: <a href="tel:+420777123456">+420 777 123 456</a>, email: <a href="mailto:jana@priklad.cz">jana@priklad.cz</a>, service: 'Interiér', address: 'Nádražní 12, Ostrava', note: 'Vchod ze dvora', actions } },
        { id: 2, cells: { name: <strong>Petr Dvořák</strong>, phone: <a href="tel:+420602987654">+420 602 987 654</a>, email: <a href="mailto:petr@priklad.cz">petr@priklad.cz</a>, service: 'Tepování', address: 'Hlavní třída 8, Ostrava-Poruba', note: '—', actions } },
      ]}
    />
  );
}

export function Empty() {
  return <DataTable columns={columns} rows={[]} />;
}
