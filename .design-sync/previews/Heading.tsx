import { Heading } from '@homedetailing/ui';

export function Display() {
  return (
    <Heading level={1} size="display">
      Čisté auto.
      <br />
      <em>Bez cesty</em> do myčky.
    </Heading>
  );
}

export function Section() {
  return (
    <Heading level={2} size="section">
      Rozdíl, který <em>uvidíte.</em>
    </Heading>
  );
}

export function Panel() {
  return (
    <Heading level={1} size="panel">
      Administrace
    </Heading>
  );
}

export function DialogTitle() {
  return (
    <Heading level={2} size="dialog">
      Děkujeme za rezervaci.
    </Heading>
  );
}

export function Card() {
  return (
    <Heading level={3} size="card">
      Interiér
    </Heading>
  );
}

export function Title() {
  return (
    <Heading level={2} size="title">
      Aktivní objednávky
    </Heading>
  );
}
