"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Field, Heading, Input, Notice, Text } from "@homedetailing/ui";
import { Wordmark } from "@/components/Wordmark";
import { APP_VERSION } from "@/lib/version";
import styles from "../admin.module.css";

/** Admin sign-in. While no user exists it turns into the one-time first-admin registration. */
export default function AdminLoginPage() {
  const router = useRouter();
  const [bootstrap, setBootstrap] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/v2/auth/me")
      .then((r) => {
        if (r.ok) router.replace("/admin");
      })
      .catch(() => undefined);
    fetch("/api/v2/auth/bootstrap")
      .then((r) => r.json())
      .then((d: { available: boolean }) => setBootstrap(d.available))
      .catch(() => undefined);
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch(bootstrap ? "/api/v2/auth/bootstrap" : "/api/v2/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    }).catch(() => null);
    const data = (await response?.json().catch(() => ({}))) as { error?: string } | undefined;
    setBusy(false);
    if (response?.ok) router.replace("/admin");
    else setError(data?.error ?? "Nesprávný e-mail nebo heslo.");
  }

  return (
    <main className={styles.loginPage}>
      <div className={styles.loginLogo}>
        <Wordmark size={20} light centered />
      </div>
      <div className={styles.loginCard}>
        <Card variant="panel" as="form" onSubmit={submit}>
          <div style={{ display: "grid", gap: 22 }}>
            <Heading level={1} size="panel">
              {bootstrap ? "První administrátor" : "Přihlášení"}
            </Heading>
            {bootstrap && (
              <>
                <Text tone="muted" size="sm">
                  Databáze zatím nemá žádného uživatele. Vytvořte první účet pomocí registračního kódu.
                </Text>
                <Field label="Jméno" layout="stacked">
                  <Input name="name" required autoComplete="name" />
                </Field>
                <Field label="Registrační kód" layout="stacked">
                  <Input name="code" type="password" required autoComplete="off" />
                </Field>
              </>
            )}
            <Field label="E-mail" layout="stacked">
              <Input type="email" name="email" required autoComplete="username" />
            </Field>
            <Field label="Heslo" layout="stacked">
              <Input type="password" name="password" required minLength={bootstrap ? 10 : undefined} autoComplete={bootstrap ? "new-password" : "current-password"} />
            </Field>
            {error && <Notice tone="error">{error}</Notice>}
            <Button type="submit" variant="primary" fullWidth disabled={busy}>
              {busy ? "Ověřuji…" : bootstrap ? "Vytvořit admina" : "Přihlásit se"}
            </Button>
          </div>
        </Card>
      </div>
      <span className={styles.monoLabel} style={{ color: "#5d6673", textTransform: "none" }}>
        version: {APP_VERSION}
      </span>
    </main>
  );
}
