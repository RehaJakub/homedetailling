"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  Button,
  Card,
  DataTable,
  Dialog,
  Eyebrow,
  Field,
  Heading,
  Input,
  Notice,
  Select,
  Tabs,
  Text,
  Textarea,
} from "@homedetailing/ui";
import styles from "./admin.module.css";

type Role = "admin" | "manager" | "viewer";
type User = { id: number; name: string; email: string; role: Role; active?: boolean };
type Reservation = {
  id: number;
  name: string;
  phone: string;
  email: string;
  service: string;
  address: string;
  note: string;
  status: "active" | "completed";
};
type Package = { id: number; name: string; price: string; showCurrency: boolean; items: string[] };
type View = "active" | "completed" | "pricing" | "users";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Správce" },
  { value: "viewer", label: "Pouze čtení" },
];

const reservationColumns = [
  { key: "name", label: "Klient" },
  { key: "phone", label: "Telefon" },
  { key: "email", label: "E-mail" },
  { key: "service", label: "Služba" },
  { key: "address", label: "Adresa" },
  { key: "note", label: "Poznámka" },
  { key: "actions", label: "Akce", actions: true },
];

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [bootstrap, setBootstrap] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [view, setView] = useState<View>("active");
  const [pendingDelete, setPendingDelete] = useState<Reservation | null>(null);
  const [busy, setBusy] = useState<number | string | null>(null);
  const [message, setMessage] = useState("");

  async function loadData(current: User) {
    const calls = [fetch("/api/v2/reservations", { cache: "no-store" }), fetch("/api/v2/pricing", { cache: "no-store" })];
    if (current.role === "admin") calls.push(fetch("/api/v2/users", { cache: "no-store" }));
    const responses = await Promise.all(calls);
    if (responses.some((r) => !r.ok)) throw new Error("Data administrace se nepodařilo načíst.");
    setReservations(((await responses[0].json()) as { reservations: Reservation[] }).reservations);
    setPackages(((await responses[1].json()) as { packages: Package[] }).packages);
    if (responses[2]) setUsers(((await responses[2].json()) as { users: User[] }).users);
  }

  useEffect(() => {
    Promise.all([fetch("/api/v2/auth/me"), fetch("/api/v2/auth/bootstrap")])
      .then(async ([me, b]) => {
        setBootstrap(((await b.json()) as { available: boolean }).available);
        if (me.ok) {
          const u = ((await me.json()) as { user: User }).user;
          setUser(u);
          await loadData(u);
        }
      })
      .catch(() => setError("Databáze není dostupná."))
      .finally(() => setAuthLoading(false));
  }, []);

  async function authenticate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthLoading(true);
    setError("");
    const response = await fetch(bootstrap ? "/api/v2/auth/bootstrap" : "/api/v2/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    const data = (await response.json()) as { user?: User; error?: string };
    if (response.ok && data.user) {
      setUser(data.user);
      setBootstrap(false);
      await loadData(data.user);
    } else setError(data.error ?? "Přihlášení se nezdařilo.");
    setAuthLoading(false);
  }

  async function logout() {
    await fetch("/api/v2/auth/logout", { method: "POST" });
    setUser(null);
  }

  async function complete(r: Reservation) {
    setBusy(r.id);
    const response = await fetch(`/api/v2/reservations/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    if (response.ok) {
      setReservations((x) => x.map((i) => (i.id === r.id ? { ...i, status: "completed" } : i)));
      setView("completed");
    }
    setBusy(null);
  }

  async function remove(r: Reservation) {
    setBusy(r.id);
    const response = await fetch(`/api/v2/reservations/${r.id}`, { method: "DELETE" });
    if (response.ok) {
      setReservations((x) => x.filter((i) => i.id !== r.id));
      setPendingDelete(null);
    }
    setBusy(null);
  }

  async function savePackage(e: FormEvent<HTMLFormElement>, id?: number) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    setBusy(id ?? "new");
    const response = await fetch(id ? `/api/v2/pricing/${id}` : "/api/v2/pricing", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: d.get("name"),
        price: d.get("price"),
        showCurrency: d.get("showCurrency") === "on",
        items: String(d.get("items") ?? "").split("\n"),
      }),
    });
    if (response.ok) {
      const refreshed = await fetch("/api/v2/pricing");
      setPackages(((await refreshed.json()) as { packages: Package[] }).packages);
      if (!id) form.reset();
      setMessage("Změna ceníku byla provedena.");
    }
    setBusy(null);
  }

  async function saveUser(e: FormEvent<HTMLFormElement>, id?: number) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    const payload: Record<string, unknown> = Object.fromEntries(d);
    payload.active = d.get("active") === "on";
    if (!payload.password) delete payload.password;
    const response = await fetch(id ? `/api/v2/users/${id}` : "/api/v2/users", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    if (response.ok && user) {
      if (!id) form.reset();
      await loadData(user);
      setMessage(id ? "Uživatel byl upraven." : "Uživatel byl vytvořen.");
    } else setError(data.error ?? "Uložení se nezdařilo.");
  }

  async function deleteUser(id: number) {
    const response = await fetch(`/api/v2/users/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    if (response.ok) setUsers((x) => x.filter((i) => i.id !== id));
    else setError(data.error ?? "Smazání se nezdařilo.");
  }

  const active = reservations.filter((r) => r.status === "active");
  const done = reservations.filter((r) => r.status === "completed");
  const canEdit = user?.role !== "viewer";

  const tabs = [
    { id: "active", label: "Aktivní objednávky", count: active.length },
    { id: "completed", label: "Hotové objednávky", count: done.length },
    { id: "pricing", label: "Úprava ceníku" },
    ...(user?.role === "admin" ? [{ id: "users", label: "Uživatelé" }] : []),
  ];

  const table = (rows: Reservation[]) => (
    <DataTable
      columns={reservationColumns}
      rows={rows.map((r) => ({
        id: r.id,
        cells: {
          name: <strong>{r.name}</strong>,
          phone: <a href={`tel:${r.phone}`}>{r.phone}</a>,
          email: <a href={`mailto:${r.email}`}>{r.email}</a>,
          service: r.service,
          address: r.address,
          note: r.note || "—",
          actions: (
            <>
              {canEdit && r.status === "active" && (
                <Button variant="primary" size="sm" disabled={busy === r.id} onClick={() => complete(r)}>
                  Hotovo
                </Button>
              )}
              {canEdit && (
                <Button variant="outline-danger" size="sm" onClick={() => setPendingDelete(r)}>
                  Smazat
                </Button>
              )}
            </>
          ),
        },
      }))}
    />
  );

  if (authLoading && !user)
    return (
      <main className={styles.page}>
        <p className={styles.state}>Načítám…</p>
      </main>
    );

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.backLink}>
        ← Zpět na web
      </Link>

      {!user ? (
        <Card as="section" variant="panel" className={styles.card}>
          <Eyebrow>Home Detailing</Eyebrow>
          <Heading level={1} size="panel" className={styles.title}>
            {bootstrap ? "První administrátor" : "Admin panel"}
          </Heading>
          <Text tone="muted">{bootstrap ? "Vytvořte první zabezpečený účet." : "Přihlášení pro správce webu."}</Text>
          <form className={styles.form} onSubmit={authenticate}>
            {bootstrap && (
              <>
                <Field label="Jméno" layout="stacked">
                  <Input name="name" required />
                </Field>
                <Field label="Registrační kód" layout="stacked">
                  <Input name="code" type="password" required />
                </Field>
              </>
            )}
            <Field label="E-mail" layout="stacked">
              <Input name="email" type="email" required />
            </Field>
            <Field label="Heslo" layout="stacked">
              <Input name="password" type="password" minLength={10} required />
            </Field>
            {error && <Notice tone="error">{error}</Notice>}
            <Button type="submit" variant="primary">
              {bootstrap ? "Vytvořit admina" : "Přihlásit se"}
            </Button>
          </form>
        </Card>
      ) : (
        <Card as="section" variant="panel" className={styles.dashboard}>
          <header className={styles.dashboardHeader}>
            <div>
              <Eyebrow>Home Detailing</Eyebrow>
              <Heading level={1} size="panel">
                Administrace
              </Heading>
              <Text tone="muted">
                {user.name} · {user.role}
              </Text>
            </div>
            <Button variant="primary" onClick={logout}>
              Odhlásit se
            </Button>
          </header>

          {error && (
            <Notice tone="error" className={styles.error}>
              {error}
            </Notice>
          )}

          <div className={styles.lists}>
            <Tabs items={tabs} value={view} onChange={(id) => setView(id as View)} />

            {view === "active" && (
              <section>
                <Heading level={2} size="title" className={styles.sectionTitle}>
                  Aktivní objednávky
                </Heading>
                {table(active)}
              </section>
            )}

            {view === "completed" && (
              <section>
                <Heading level={2} size="title" className={styles.sectionTitle}>
                  Hotové objednávky
                </Heading>
                {table(done)}
              </section>
            )}

            {view === "pricing" && (
              <section>
                <Heading level={2} size="title" className={styles.sectionTitle}>
                  Úprava ceníku
                </Heading>
                <div className={styles.packageForms}>
                  {packages.map((p) => (
                    <Card key={p.id} as="form" title={p.name} onSubmit={(e) => savePackage(e, p.id)}>
                      <Field label="Název">
                        <Input name="name" defaultValue={p.name} required />
                      </Field>
                      <Field label="Cena">
                        <Input name="price" defaultValue={p.price} required />
                      </Field>
                      <Field label="Zobrazit Kč" layout="inline">
                        <Input name="showCurrency" type="checkbox" defaultChecked={p.showCurrency} />
                      </Field>
                      <Field label="Popisky">
                        <Textarea name="items" defaultValue={p.items.join("\n")} required />
                      </Field>
                      <Button type="submit" variant="primary" disabled={!canEdit || busy === p.id}>
                        Uložit změny
                      </Button>
                    </Card>
                  ))}
                  {canEdit && (
                    <Card as="form" variant="dashed" title="Přidat balíček" onSubmit={(e) => savePackage(e)}>
                      <Field label="Název">
                        <Input name="name" required />
                      </Field>
                      <Field label="Cena">
                        <Input name="price" required />
                      </Field>
                      <Field label="Zobrazit Kč" layout="inline">
                        <Input name="showCurrency" type="checkbox" defaultChecked />
                      </Field>
                      <Field label="Popisky">
                        <Textarea name="items" required />
                      </Field>
                      <Button type="submit" variant="primary">
                        Přidat balíček
                      </Button>
                    </Card>
                  )}
                </div>
              </section>
            )}

            {view === "users" && user.role === "admin" && (
              <section>
                <Heading level={2} size="title" className={styles.sectionTitle}>
                  Správa uživatelů
                </Heading>
                <div className={styles.packageForms}>
                  {users.map((u) => (
                    <Card key={u.id} as="form" title={u.name} onSubmit={(e) => saveUser(e, u.id)}>
                      <Field label="Jméno">
                        <Input name="name" defaultValue={u.name} required />
                      </Field>
                      <Field label="E-mail">
                        <Input name="email" type="email" defaultValue={u.email} required />
                      </Field>
                      <Field label="Role">
                        <Select name="role" defaultValue={u.role} options={roleOptions} />
                      </Field>
                      <Field label="Nové heslo">
                        <Input name="password" type="password" minLength={10} />
                      </Field>
                      <Field label="Aktivní" layout="inline">
                        <Input name="active" type="checkbox" defaultChecked={u.active} />
                      </Field>
                      <div className={styles.formActions}>
                        <Button type="submit" variant="primary">
                          Uložit
                        </Button>
                        {u.id !== user.id && (
                          <Button variant="outline-danger" onClick={() => deleteUser(u.id)}>
                            Smazat
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                  <Card as="form" variant="dashed" title="Přidat uživatele" onSubmit={(e) => saveUser(e)}>
                    <Field label="Jméno">
                      <Input name="name" required />
                    </Field>
                    <Field label="E-mail">
                      <Input name="email" type="email" required />
                    </Field>
                    <Field label="Heslo">
                      <Input name="password" type="password" minLength={10} required />
                    </Field>
                    <Field label="Role">
                      <Select name="role" defaultValue="viewer" options={[...roleOptions].reverse()} />
                    </Field>
                    <input name="active" type="hidden" value="on" />
                    <Button type="submit" variant="primary">
                      Přidat
                    </Button>
                  </Card>
                </div>
              </section>
            )}
          </div>
        </Card>
      )}

      <Dialog
        open={pendingDelete !== null}
        title="Smazat rezervaci?"
        actionCount={2}
        actions={
          <>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Vrátit
            </Button>
            <Button variant="danger" disabled={busy === pendingDelete?.id} onClick={() => pendingDelete && remove(pendingDelete)}>
              Smazat
            </Button>
          </>
        }
      >
        Rezervace klienta <strong>{pendingDelete?.name}</strong> bude trvale odstraněna.
      </Dialog>

      <Dialog
        open={message !== ""}
        title={message}
        actions={
          <Button variant="primary" fullWidth onClick={() => setMessage("")}>
            OK
          </Button>
        }
      />
    </main>
  );
}
