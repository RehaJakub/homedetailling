import { Container, Eyebrow, Heading, Text } from '@homedetailing/ui';

export function Default() {
  return (
    <div style={{ background: '#f5f7fa', padding: '24px 0' }}>
      <Container as="section" style={{ background: '#ffffff', padding: 32 }}>
        <Eyebrow>Co umíme</Eyebrow>
        <Heading level={2} size="section">
          Kompletní péče. Přímo <em>u vás.</em>
        </Heading>
        <Text tone="muted" lead>
          Obsah sekce je zarovnaný na 1180px širokou stránku s postranními okraji 20px.
        </Text>
      </Container>
    </div>
  );
}
