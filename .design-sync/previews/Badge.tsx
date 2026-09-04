import { Badge } from '@homedetailing/ui';

export function Solid() {
  return <Badge>Nejoblíbenější</Badge>;
}

export function Soft() {
  return <Badge tone="soft">Aktivní</Badge>;
}

export function Count() {
  return <Badge tone="count">12</Badge>;
}

export function Corner() {
  return (
    <div style={{ position: 'relative', width: 260, height: 120, border: '1px solid #e1e5eb' }}>
      <Badge corner>Nejoblíbenější</Badge>
    </div>
  );
}
