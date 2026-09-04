"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminApp } from "@/components/admin/AdminApp";
import { api, ApiError } from "@/components/admin/api";
import type { User } from "@/components/admin/types";
import styles from "./admin.module.css";

/** Loads the session; unauthenticated visitors go to /admin/login. */
export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) router.replace("/admin/login");
        else setError("Databáze není dostupná.");
      });
  }, [router]);

  if (!user) {
    return (
      <main className={styles.page}>
        <p className={styles.state}>{error || "Načítám…"}</p>
      </main>
    );
  }
  return <AdminApp user={user} />;
}
