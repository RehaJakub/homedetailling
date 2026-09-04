"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Dialog, Eyebrow, Field, Heading, Icon, Input, Select, Tabs } from "@homedetailing/ui";
import { addDays, conflictsOf, dayLabel, defaultSettings, DOW_LONG, estimateSlots, fromIso, isActive, servicesLabel, slotLabel, STATUS_LABEL, toIso, type BookingStatus, type Settings } from "@/lib/booking";
import { Wordmark } from "@/components/Wordmark";
import styles from "@/app/admin/admin.module.css";
import { api, ApiError, toDraft } from "./api";
import { OrderModal } from "./OrderModal";
import { Customers, CustomerModal, groupCustomers, lastOrder, Orders, Overview, PriceModal, PricingPanel, SettingsPanel } from "./panels";
import { ToastStack, useToasts } from "./Toasts";
import { WeekCalendar } from "./WeekCalendar";
import { ROLE_LABEL, type Booking, type Draft, type Modal, type Package, type PriceDraft, type Role, type User } from "./types";

type Tab = "overview" | "calendar" | "orders" | "customers" | "pricing" | "settings";

const mondayOf = (iso: string) => addDays(iso, -((fromIso(iso).getDay() + 6) % 7));

export function AdminApp({ user }: { user: User }) {
  const router = useRouter();
  const { toasts, toast, dismiss } = useToasts();
  const today = toIso(new Date());
  const canEdit = user.role !== "viewer";
  const isAdmin = user.role === "admin";

  const [tab, setTab] = useState<Tab>("overview");
  const [weekStart, setWeekStart] = useState(() => mondayOf(today));
  const [focusDay, setFocusDay] = useState(today);
  const [dayMode, setDayMode] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [orderFilter, setOrderFilter] = useState("new");
  const [query, setQuery] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [modal, setModal] = useState<Modal>(null);
  const [error, setError] = useState("");

  const fail = useCallback(
    (e: unknown) => {
      const message = e instanceof ApiError ? e.message : "Požadavek se nezdařil.";
      if (e instanceof ApiError && e.status === 401) {
        router.replace("/admin/login");
        return;
      }
      toast({ tone: "danger", icon: "alert", title: "Nepodařilo se uložit", text: message });
    },
    [router, toast],
  );

  useEffect(() => {
    Promise.all([api.reservations(), api.packages(), api.settings(), isAdmin ? api.users() : Promise.resolve({ users: [] as User[] })])
      .then(([r, p, s, u]) => {
        setBookings(r.reservations);
        setPackages(p.packages);
        setSettings(s.settings);
        setUsers(u.users.filter((x) => x.active));
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Data administrace se nepodařilo načíst."));
  }, [isAdmin]);

  useEffect(() => {
    const day = window.matchMedia("(max-width: 760px)");
    const phone = window.matchMedia("(max-width: 900px)");
    const update = () => {
      setDayMode(day.matches);
      setNarrow(phone.matches);
    };
    update();
    day.addEventListener("change", update);
    phone.addEventListener("change", update);
    return () => {
      day.removeEventListener("change", update);
      phone.removeEventListener("change", update);
    };
  }, []);

  const weekIso = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const customers = useMemo(() => groupCustomers(bookings), [bookings]);
  const newCount = bookings.filter((r) => r.status === "new").length;
  const conflictCount = bookings.filter((r) => isActive(r.status) && conflictsOf(r, bookings).length).length;

  /* ---- orders ---- */

  const blankDraft = (date: string, a: number, overrides: Partial<Draft> = {}): Draft => {
    const services = overrides.services ?? (packages[0] ? [packages[0].name] : []);
    const length = estimateSlots(services, packages) || 8;
    return {
      id: null,
      name: "",
      phone: "",
      email: "",
      address: "",
      date,
      a,
      b: Math.min(settings.closeSlot, a + length),
      status: "confirmed",
      note: "",
      ...overrides,
      services,
    };
  };
  const openEdit = (r: Booking | null, overrides?: Partial<Draft>) =>
    setModal({ type: "edit", orig: r ? JSON.stringify(toDraft(r)) : null, draft: r ? toDraft(r) : blankDraft(today, settings.openSlot + 8, overrides) });
  const patchDraft = (patch: Partial<Draft>) => setModal((m) => (m && m.type === "edit" ? { ...m, draft: { ...m.draft, ...patch } } : m));

  const summary = (r: Booking) => `${r.name} · ${dayLabel(r.date)} ${slotLabel(r.slotStart)} – ${slotLabel(r.slotEnd)} · ${servicesLabel(r.services)} · ${STATUS_LABEL[r.status]}`;

  async function saveDraft(draft: Draft, status?: BookingStatus) {
    const d = { ...draft, status: status ?? draft.status };
    if (d.b <= d.a) d.b = d.a + 1;
    try {
      const { id, ...payload } = d;
      const { reservation } = id === null ? await api.createBooking(payload) : await api.updateBooking(id, payload);
      setBookings((list) => (id === null ? list.concat([reservation]) : list.map((r) => (r.id === id ? reservation : r))));
      setModal(null);
      const conf = conflictsOf(reservation, bookings.filter((r) => r.id !== reservation.id)).length > 0;
      toast({ tone: conf ? "warn" : "ok", icon: conf ? "alert" : "check-circle", title: `${id === null ? "Objednávka založena" : "Objednávka uložena"}${conf ? " s překryvem" : ""}`, text: summary(reservation) });
    } catch (e) {
      fail(e);
    }
  }

  /** Drag-and-drop in the calendar: move a booking, keep its length, offer undo. */
  async function moveBooking(r: Booking, target: { date: string; slotStart: number; slotEnd: number }) {
    try {
      const { reservation } = await api.updateBooking(r.id, { date: target.date, a: target.slotStart, b: target.slotEnd });
      setBookings((list) => list.map((x) => (x.id === r.id ? reservation : x)));
      const conf = conflictsOf(reservation, bookings.filter((x) => x.id !== r.id)).length > 0;
      toast({
        tone: conf ? "warn" : "ok",
        icon: conf ? "alert" : "calendar",
        title: conf ? "Přesunuto s překryvem" : "Objednávka přesunuta",
        text: `${r.name} · ${dayLabel(reservation.date)} ${slotLabel(reservation.slotStart)} – ${slotLabel(reservation.slotEnd)}`,
        actionLabel: "Vrátit",
        action: async () => {
          try {
            const { reservation: restored } = await api.updateBooking(r.id, { date: r.date, a: r.slotStart, b: r.slotEnd });
            setBookings((list) => list.map((x) => (x.id === r.id ? restored : x)));
          } catch (e) {
            fail(e);
          }
        },
      });
    } catch (e) {
      fail(e);
    }
  }

  async function deleteBooking(id: number) {
    const r = bookings.find((x) => x.id === id);
    if (!r) return;
    try {
      await api.deleteBooking(id);
      setBookings((list) => list.filter((x) => x.id !== id));
      setModal(null);
      toast({
        tone: "danger",
        icon: "trash",
        title: "Objednávka smazána",
        text: `${r.name} · ${dayLabel(r.date)} ${slotLabel(r.slotStart)}`,
        actionLabel: "Vrátit",
        action: async () => {
          try {
            const { id: _old, createdAt: _c, updatedAt: _u, slotStart, slotEnd, ...rest } = r;
            void _old;
            void _c;
            void _u;
            const { reservation } = await api.createBooking({ ...rest, a: slotStart, b: slotEnd });
            setBookings((list) => list.concat([reservation]));
            toast({ icon: "undo", title: "Objednávka obnovena", text: reservation.name });
          } catch (e) {
            fail(e);
          }
        },
      });
    } catch (e) {
      fail(e);
    }
  }

  /* ---- pricing ---- */

  const openPrice = (p: Package | null) =>
    setModal({
      type: "price",
      pd: p
        ? { id: p.id, name: p.name, price: p.price, items: p.items.join("\n"), featured: p.featured, showCurrency: p.showCurrency, durationMinutes: p.durationMinutes }
        : { id: null, name: "", price: "", items: "", featured: false, showCurrency: true, durationMinutes: 120 },
    });
  const patchPrice = (patch: Partial<PriceDraft>) => setModal((m) => (m && m.type === "price" ? { ...m, pd: { ...m.pd, ...patch } } : m));

  async function savePrice(pd: PriceDraft) {
    const payload = { name: pd.name, price: pd.price, showCurrency: pd.showCurrency, featured: pd.featured, durationMinutes: pd.durationMinutes, items: pd.items.split("\n").map((s) => s.trim()).filter(Boolean) };
    try {
      const { package: saved } = pd.id === null ? await api.createPackage(payload) : await api.updatePackage(pd.id, payload);
      const { packages: fresh } = await api.packages();
      setPackages(fresh);
      setModal(null);
      toast({ icon: "tag", title: "Ceník uložen", text: `Balíček ${saved.name} je aktualizovaný na webu.` });
    } catch (e) {
      fail(e);
    }
  }

  async function deletePrice(id: number) {
    const p = packages.find((x) => x.id === id);
    if (!p) return;
    try {
      await api.deletePackage(id);
      setPackages((list) => list.filter((x) => x.id !== id));
      setModal(null);
      toast({
        tone: "danger",
        icon: "trash",
        title: "Balíček smazán",
        text: p.name,
        actionLabel: "Vrátit",
        action: async () => {
          try {
            await api.createPackage({ name: p.name, price: p.price, showCurrency: p.showCurrency, featured: p.featured, durationMinutes: p.durationMinutes, items: p.items });
            setPackages((await api.packages()).packages);
          } catch (e) {
            fail(e);
          }
        },
      });
    } catch (e) {
      fail(e);
    }
  }

  /* ---- settings & users ---- */

  async function saveSettings() {
    try {
      const { settings: saved } = await api.saveSettings(settings);
      setSettings(saved);
      toast({ icon: "check-circle", title: "Nastavení uloženo", text: `Provozní doba ${slotLabel(saved.openSlot)} – ${slotLabel(saved.closeSlot)} se projeví na webu.` });
    } catch (e) {
      fail(e);
    }
  }

  async function removeUser(u: User) {
    try {
      await api.updateUser(u.id, { active: false });
      setUsers((list) => list.filter((x) => x.id !== u.id));
      toast({
        tone: "danger",
        icon: "trash",
        title: "Uživatel odebrán",
        text: u.name,
        actionLabel: "Vrátit",
        action: async () => {
          try {
            const { user: restored } = await api.updateUser(u.id, { active: true });
            setUsers((list) => list.concat([restored]));
          } catch (e) {
            fail(e);
          }
        },
      });
    } catch (e) {
      fail(e);
    }
  }

  async function saveUser(ud: { name: string; email: string; role: Role; password: string }) {
    if (!ud.name || !ud.email || ud.password.length < 10) {
      toast({ tone: "warn", icon: "alert", title: "Doplňte jméno, e-mail a heslo (min. 10 znaků)" });
      return;
    }
    try {
      const { user: created } = await api.createUser(ud);
      setUsers((list) => list.concat([created]));
      setModal(null);
      toast({ icon: "users", title: "Uživatel přidán", text: `${created.name} se přihlásí zadaným heslem.` });
    } catch (e) {
      fail(e);
    }
  }

  async function changePassword(current: string, next: string, reset: () => void) {
    try {
      await api.changePassword(current, next);
      reset();
      toast({ icon: "shield", title: "Heslo změněno", text: "Při dalším přihlášení použijte nové heslo." });
    } catch (e) {
      fail(e);
    }
  }

  async function logout() {
    await api.logout().catch(() => undefined);
    router.replace("/admin/login");
  }

  /* ---- keyboard ---- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modal) setModal(null);
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && modal?.type === "edit" && canEdit) void saveDraft(modal.draft);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const go = (t: string, filter?: string) => {
    setTab(t as Tab);
    if (filter) setOrderFilter(filter);
  };
  const newOrderFor = (email: string) => {
    const c = customers.find((x) => x.email === email);
    if (!c) return;
    const last = lastOrder(c);
    openEdit(null, { name: c.name, phone: c.phone, email: c.email, address: last.address, services: last.services });
  };

  const todayDate = fromIso(today);
  const tabs = [
    { id: "overview", label: "Přehled" },
    { id: "calendar", label: "Kalendář", count: conflictCount || undefined },
    { id: "orders", label: "Objednávky", count: newCount },
    { id: "customers", label: "Zákazníci" },
    { id: "pricing", label: "Ceník" },
    { id: "settings", label: "Nastavení" },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.topBar}>
          <Wordmark light />
          <div style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 13 }}>
            <span className={styles.monoLabel} style={{ color: "#87909d" }}>
              {`${DOW_LONG[todayDate.getDay()]} · ${todayDate.getDate()}. ${todayDate.getMonth() + 1}. ${todayDate.getFullYear()}`}
            </span>
            <Link href="/" className={styles.topLink}>
              <Icon name="external" size={14} />
              Web
            </Link>
            <button type="button" className={styles.topLink} onClick={logout}>
              <Icon name="logout" size={14} />
              Odhlásit
            </button>
          </div>
        </div>

        <Card variant="panel">
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div style={{ display: "grid", gap: 8 }}>
                <Eyebrow>Administrace</Eyebrow>
                <Heading level={1} size="card">
                  Home Detailing
                </Heading>
                <span style={{ fontSize: 12, color: "#687080" }}>
                  {user.name} · {ROLE_LABEL[user.role]}
                </span>
              </div>
              <Tabs items={tabs} value={tab} onChange={(id) => setTab(id as Tab)} orientation={narrow ? "horizontal" : "vertical"} />
              {canEdit && (
                <div className={styles.sidebarCta}>
                  <Button variant="primary" fullWidth onClick={() => openEdit(null)}>
                    Nová objednávka
                  </Button>
                </div>
              )}
              <span className={styles.sidebarTip} style={{ fontSize: 12, color: "#687080", lineHeight: 1.6, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Icon name="info" size={14} style={{ marginTop: 2 }} />
                Tip: v kalendáři klikněte do volného místa a založíte zakázku na ten čas. Zakázky lze chytit a přetáhnout na jiný čas nebo den.
              </span>
            </aside>

            <section key={tab} className={styles.content}>
              {error && <div className="hd-notice hd-notice--error">{error}</div>}
              {tab === "overview" && <Overview bookings={bookings} today={today} weekIso={weekIso} onGo={go} onOpen={openEdit} />}
              {tab === "calendar" && (
                <WeekCalendar
                  bookings={bookings}
                  settings={settings}
                  weekStart={weekStart}
                  today={today}
                  dayMode={dayMode}
                  focusDay={focusDay}
                  onWeekChange={setWeekStart}
                  onFocusDay={setFocusDay}
                  onOpen={openEdit}
                  onCreateAt={(date, slot) => canEdit && openEdit(null, { date, a: slot })}
                  stepSlots={Math.max(1, Math.round(settings.stepMinutes / 15))}
                  onMove={canEdit ? moveBooking : undefined}
                />
              )}
              {tab === "orders" && (
                <Orders bookings={bookings} filter={orderFilter} query={query} canEdit={canEdit} onFilter={setOrderFilter} onQuery={setQuery} onOpen={openEdit} onDelete={(r) => deleteBooking(r.id)} />
              )}
              {tab === "customers" && <Customers customers={customers} canEdit={canEdit} onDetail={(c) => setModal({ type: "customer", email: c.email })} onNewOrder={(c) => newOrderFor(c.email)} />}
              {tab === "pricing" && <PricingPanel packages={packages} canEdit={canEdit} onEdit={openPrice} onAdd={() => openPrice(null)} />}
              {tab === "settings" && (
                <SettingsPanel
                  settings={settings}
                  users={users}
                  isAdmin={isAdmin}
                  canEdit={canEdit}
                  onSettings={(patch) => setSettings((s) => ({ ...s, ...patch }))}
                  onSaveSettings={saveSettings}
                  onRemoveUser={removeUser}
                  onAddUser={() => setModal({ type: "user", ud: { name: "", email: "", role: "manager", password: "" } })}
                  onChangePassword={changePassword}
                />
              )}
            </section>
          </div>
        </Card>
      </div>

      {modal?.type === "edit" && (
        <OrderModal
          draft={modal.draft}
          orig={modal.orig}
          bookings={bookings}
          packages={packages}
          settings={settings}
          customers={customers}
          canEdit={canEdit}
          onChange={patchDraft}
          onClose={() => setModal(null)}
          onSave={(status) => saveDraft(modal.draft, status)}
          onDelete={() => modal.draft.id !== null && deleteBooking(modal.draft.id)}
          onToast={(title, text, tone = "ok", icon = "sparkle") => toast({ title, text, tone, icon })}
        />
      )}
      {modal?.type === "price" && <PriceModal pd={modal.pd} onChange={patchPrice} onClose={() => setModal(null)} onSave={() => savePrice(modal.pd)} onDelete={() => modal.pd.id !== null && deletePrice(modal.pd.id)} />}
      {modal?.type === "customer" &&
        (() => {
          const c = customers.find((x) => x.email === modal.email);
          return c ? <CustomerModal customer={c} canEdit={canEdit} onClose={() => setModal(null)} onOpen={openEdit} onNewOrder={() => newOrderFor(c.email)} /> : null;
        })()}

      <Dialog
        open={modal?.type === "user"}
        eyebrow="Uživatelé"
        title="Přidat uživatele"
        actionCount={2}
        actions={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Zavřít
            </Button>
            <Button variant="primary" onClick={() => modal?.type === "user" && saveUser(modal.ud)}>
              Přidat
            </Button>
          </>
        }
      >
        {modal?.type === "user" && (
          <div style={{ display: "grid", gap: 14, textAlign: "left" }}>
            <Field label="Jméno">
              <Input value={modal.ud.name} onChange={(e) => setModal({ ...modal, ud: { ...modal.ud, name: e.target.value } })} />
            </Field>
            <Field label="E-mail">
              <Input type="email" value={modal.ud.email} onChange={(e) => setModal({ ...modal, ud: { ...modal.ud, email: e.target.value } })} />
            </Field>
            <Field label="Role">
              <Select options={(Object.keys(ROLE_LABEL) as Role[]).map((r) => ({ value: r, label: ROLE_LABEL[r] }))} value={modal.ud.role} onChange={(e) => setModal({ ...modal, ud: { ...modal.ud, role: e.target.value as Role } })} />
            </Field>
            <Field label="Počáteční heslo (min. 10 znaků)">
              <Input type="password" value={modal.ud.password} onChange={(e) => setModal({ ...modal, ud: { ...modal.ud, password: e.target.value } })} autoComplete="new-password" />
            </Field>
          </div>
        )}
      </Dialog>

      {canEdit && !modal && (
        <div className={styles.mobileCta}>
          <Button variant="primary" fullWidth onClick={() => openEdit(null)}>
            Nová objednávka
          </Button>
        </div>
      )}

      <ToastStack toasts={toasts} dismiss={dismiss} />
    </main>
  );
}
