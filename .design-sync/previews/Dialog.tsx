import { Button, Dialog } from '@homedetailing/ui';

export function Success() {
  return (
    <Dialog
      open
      inline
      eyebrow="Rezervace odeslána"
      title="Děkujeme za rezervaci."
      actions={<Button fullWidth>Rozumím</Button>}
    >
      Budeme vás kontaktovat ohledně domluvy termínu.
    </Dialog>
  );
}

export function ConfirmDelete() {
  return (
    <Dialog
      open
      inline
      title="Smazat rezervaci?"
      actionCount={2}
      actions={
        <>
          <Button variant="ghost">Vrátit</Button>
          <Button variant="danger">Smazat</Button>
        </>
      }
    >
      Rezervace klienta <strong>Jana Nováková</strong> bude trvale odstraněna.
    </Dialog>
  );
}

export function Message() {
  return <Dialog open inline title="Změna ceníku byla provedena." actions={<Button fullWidth>OK</Button>} />;
}
