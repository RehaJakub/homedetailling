"use client";
import { Badge, Button, Card, DataTable, Field, Heading, Icon, Input, Select, Tabs, Text } from "@homedetailing/ui";
import { conflictsOf, dayLabel, durationLabel, isActive, priceLabel, servicesLabel, slotLabel, slotsForMinutes, weeklyHoursOf, STATUS_LABEL } from "@/lib/booking";
import styles from "@/app/admin/admin.module.css";
import { ROLE_LABEL, type Booking, type Customer, type Package, type PriceDraft, type Settings, type User } from "./types";

const mono = "var(--hd-font-mono)";
const telHref = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;

/* ---------- Přehled ---------- */

export function Overview({
  bookings,
  today,
  weekIso,
  onGo,
  onOpen,
}: {
  bookings: Booking[];
  today: string;
  weekIso: string[];
  onGo: (tab: string, filter?: string) => void;
  onOpen: (b: Booking) => void;
}) {
  const newList = bookings.filter((r) => r.status === "new").sort((x, y) => x.date.localeCompare(y.date) || x.slotStart - y.slotStart);
  const todayList = bookings.filter((r) => r.date === today && isActive(r.status)).sort((x, y) => x.slotStart - y.slotStart);
  const conflictCount = bookings.filter((r) => isActive(r.status) && conflictsOf(r, bookings).length).length;
  const stats = [
    { label: "Čeká na potvrzení", value: newList.length, sub: "nové rezervace z webu", goLabel: "Zobrazit nové", go: () => onGo("orders", "new") },
    { label: "Dnes", value: todayList.length, sub: "zakázky na dnešek", goLabel: "Otevřít kalendář", go: () => onGo("calendar") },
    { label: "Tento týden", value: bookings.filter((r) => weekIso.includes(r.date) && r.status !== "cancelled").length, sub: `${dayLabel(weekIso[0])} – ${dayLabel(weekIso[6])}`, goLabel: "Otevřít kalendář", go: () => onGo("calendar") },
    { label: "Překryvy", value: conflictCount, sub: conflictCount ? "vyžadují domluvu s klientem" : "kalendář je čistý", goLabel: "Zkontrolovat", go: () => onGo("calendar") },
  ];
  return (
    <>
      <div style={{ display: "grid", gap: 8 }}>
        <Heading level={2} size="title">
          Přehled
        </Heading>
        <Text tone="muted" size="sm">
          Co se děje dnes a co čeká na vaši reakci.
        </Text>
      </div>
      <div className={styles.stats}>
        {stats.map((s) => (
          <button key={s.label} type="button" className={styles.stat} onClick={s.go}>
            <span className={styles.monoLabel}>{s.label}</span>
            <strong>{s.value}</strong>
            <span style={{ fontSize: 12, color: "#687080" }}>{s.sub}</span>
            <span className={styles.statLink}>
              {s.goLabel}
              <Icon name="arrow-right" size={14} stroke={2} />
            </span>
          </button>
        ))}
      </div>
      <div className={styles.twoPanels}>
        <div className={styles.listBox}>
          <div className={styles.listHead}>
            <strong>Dnes</strong>
            <span className={styles.monoLabel}>{dayLabel(today)}</span>
          </div>
          {todayList.length === 0 && <div className={styles.listEmpty}>Dnes nejsou žádné zakázky.</div>}
          {todayList.map((r) => (
            <div key={r.id} className={styles.listRow} style={{ gridTemplateColumns: "96px 1fr auto" }}>
              <span style={{ fontFamily: mono, fontSize: 12 }}>{`${slotLabel(r.slotStart)} – ${slotLabel(r.slotEnd)}`}</span>
              <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                <strong style={{ fontSize: 14 }}>{r.name}</strong>
                <span style={{ fontSize: 12, color: "#687080" }}>
                  {servicesLabel(r.services)} · {r.address}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onOpen(r)}>
                Otevřít
              </Button>
            </div>
          ))}
        </div>
        <div className={styles.listBox}>
          <div className={styles.listHead}>
            <strong>Čeká na potvrzení</strong>
            <Badge tone="count">{newList.length}</Badge>
          </div>
          {newList.length === 0 && <div className={styles.listEmpty}>Vše je potvrzené.</div>}
          {newList.map((r) => (
            <div key={r.id} className={styles.listRow} style={{ gridTemplateColumns: "1fr auto" }}>
              <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                <strong style={{ fontSize: 14 }}>{r.name}</strong>
                <span style={{ fontSize: 12, color: "#687080" }}>
                  {dayLabel(r.date)} · {slotLabel(r.slotStart)} – {slotLabel(r.slotEnd)} · {servicesLabel(r.services)}
                </span>
                {conflictsOf(r, bookings).length > 0 && (
                  <span style={{ fontSize: 12, color: "#b42318", display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon name="alert" size={12} stroke={2} />
                    Překrývá se s jinou zakázkou
                  </span>
                )}
              </div>
              <Button variant="primary" size="sm" onClick={() => onOpen(r)}>
                Otevřít
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------- Objednávky ---------- */

const orderColumns = [
  { key: "name", label: "Klient" },
  { key: "when", label: "Termín" },
  { key: "services", label: "Služby" },
  { key: "address", label: "Adresa" },
  { key: "status", label: "Stav" },
  { key: "actions", label: "Akce", actions: true },
];

export function Orders({
  bookings,
  filter,
  query,
  canEdit,
  onFilter,
  onQuery,
  onOpen,
  onDelete,
}: {
  bookings: Booking[];
  filter: string;
  query: string;
  canEdit: boolean;
  onFilter: (id: string) => void;
  onQuery: (q: string) => void;
  onOpen: (b: Booking) => void;
  onDelete: (b: Booking) => void;
}) {
  const q = query.trim().toLowerCase();
  const filtered = bookings
    .filter((r) => (filter === "all" ? true : r.status === filter) && (!q || `${r.name} ${r.phone} ${r.email} ${r.address} ${r.services.join(" ")}`.toLowerCase().includes(q)))
    .sort((x, y) => x.date.localeCompare(y.date) || x.slotStart - y.slotStart);
  const tabs = [
    { id: "new", label: "Nové", count: bookings.filter((r) => r.status === "new").length },
    { id: "confirmed", label: "Potvrzené", count: bookings.filter((r) => r.status === "confirmed").length },
    { id: "done", label: "Hotové", count: bookings.filter((r) => r.status === "done").length },
    { id: "all", label: "Vše" },
  ];
  return (
    <>
      <div style={{ display: "grid", gap: 8 }}>
        <Heading level={2} size="title">
          Objednávky
        </Heading>
        <Text tone="muted" size="sm">
          Všechny rezervace z webu i objednávky založené po telefonu.
        </Text>
      </div>
      <div className={styles.ordersToolbar}>
        <Tabs orientation="horizontal" items={tabs} value={filter} onChange={onFilter} />
        <div style={{ width: 260 }}>
          <Input type="search" placeholder="Hledat klienta…" value={query} onChange={(e) => onQuery(e.target.value)} />
        </div>
      </div>
      <DataTable
        columns={orderColumns}
        emptyText="Žádné objednávky v tomto filtru."
        rows={filtered.map((r) => ({
          id: r.id,
          cells: {
            name: (
              <div style={{ display: "grid", gap: 2 }}>
                <strong>{r.name}</strong>
                <a href={telHref(r.phone)} style={{ fontSize: 12 }}>
                  {r.phone}
                </a>
              </div>
            ),
            when: (
              <div style={{ display: "grid", gap: 2 }}>
                <span>{dayLabel(r.date)}</span>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#687080" }}>{`${slotLabel(r.slotStart)} – ${slotLabel(r.slotEnd)} · ${durationLabel(r.slotEnd - r.slotStart)}`}</span>
              </div>
            ),
            services: servicesLabel(r.services),
            address: r.address,
            status: (
              <div style={{ display: "grid", gap: 4, justifyItems: "start" }}>
                <Badge tone={r.status === "confirmed" ? "solid" : "soft"}>{STATUS_LABEL[r.status]}</Badge>
                {isActive(r.status) && conflictsOf(r, bookings).length > 0 && <span style={{ fontSize: 11, color: "#b42318" }}>Překryv</span>}
              </div>
            ),
            actions: (
              <>
                <Button variant="primary" size="sm" onClick={() => onOpen(r)}>
                  Otevřít
                </Button>
                {canEdit && (
                  <Button variant="outline-danger" size="sm" onClick={() => onDelete(r)}>
                    Smazat
                  </Button>
                )}
              </>
            ),
          },
        }))}
      />
    </>
  );
}

/* ---------- Zákazníci ---------- */

export function groupCustomers(bookings: Booking[]): Customer[] {
  const byEmail = new Map<string, Customer>();
  for (const r of bookings) {
    const c = byEmail.get(r.email) ?? { email: r.email, name: r.name, phone: r.phone, orders: [] };
    c.orders.push(r);
    byEmail.set(r.email, c);
  }
  return [...byEmail.values()].sort((x, y) => y.orders.length - x.orders.length);
}

export function lastOrder(c: Customer) {
  return [...c.orders].sort((x, y) => y.date.localeCompare(x.date) || y.slotStart - x.slotStart)[0];
}

export function Customers({ customers, canEdit, onDetail, onNewOrder }: { customers: Customer[]; canEdit: boolean; onDetail: (c: Customer) => void; onNewOrder: (c: Customer) => void }) {
  return (
    <>
      <div style={{ display: "grid", gap: 8 }}>
        <Heading level={2} size="title">
          Zákazníci
        </Heading>
        <Text tone="muted" size="sm">
          Seskupeno podle e-mailu. Historii zakázek otevřete tlačítkem Detail.
        </Text>
      </div>
      <DataTable
        columns={[
          { key: "name", label: "Zákazník" },
          { key: "contact", label: "Kontakt" },
          { key: "count", label: "Zakázek" },
          { key: "last", label: "Poslední termín" },
          { key: "actions", label: "Akce", actions: true },
        ]}
        emptyText="Zatím žádní zákazníci."
        rows={customers.map((c) => {
          const last = lastOrder(c);
          return {
            id: c.email,
            cells: {
              name: <strong>{c.name}</strong>,
              contact: (
                <div style={{ display: "grid", gap: 2, fontSize: 13 }}>
                  <a href={telHref(c.phone)}>{c.phone}</a>
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                </div>
              ),
              count: <Badge tone="count">{c.orders.length}</Badge>,
              last: `${dayLabel(last.date)} · ${servicesLabel(last.services)}`,
              actions: (
                <>
                  <Button variant="ghost" size="sm" onClick={() => onDetail(c)}>
                    Detail
                  </Button>
                  {canEdit && (
                    <Button variant="primary" size="sm" onClick={() => onNewOrder(c)}>
                      Nová zakázka
                    </Button>
                  )}
                </>
              ),
            },
          };
        })}
      />
    </>
  );
}

export function CustomerModal({ customer: c, canEdit, onClose, onOpen, onNewOrder }: { customer: Customer; canEdit: boolean; onClose: () => void; onOpen: (b: Booking) => void; onNewOrder: () => void }) {
  const counts: Record<string, number> = {};
  for (const o of c.orders) for (const name of o.services) counts[name] = (counts[name] ?? 0) + 1;
  const favourite = Object.keys(counts).sort((x, y) => counts[y] - counts[x])[0] ?? "—";
  const stats = [
    { label: "Zakázek", value: String(c.orders.length) },
    { label: "Hotových", value: String(c.orders.filter((o) => o.status === "done").length) },
    { label: "Nejčastěji", value: favourite },
  ];
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div role="dialog" aria-modal="true" className={styles.smallModal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <span className={styles.monoLabel} style={{ color: "#1769ff" }}>
              Zákazník
            </span>
            <Heading level={2} size="dialog">
              {c.name}
            </Heading>
            <span style={{ fontSize: 13, color: "#687080", display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href={telHref(c.phone)} style={{ display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
                <Icon name="phone" size={13} />
                {c.phone}
              </a>
              <a href={`mailto:${c.email}`} style={{ display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
                <Icon name="mail" size={13} />
                {c.email}
              </a>
            </span>
          </div>
          <button type="button" className={styles.squareButton} aria-label="Zavřít" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ padding: "12px 14px", border: "1px solid #e1e5eb", display: "grid", gap: 4 }}>
              <span className={styles.monoLabel} style={{ fontSize: 10 }}>
                {s.label}
              </span>
              <strong style={{ fontSize: 16 }}>{s.value}</strong>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #e1e5eb", maxHeight: 280, overflow: "auto" }}>
          {[...c.orders]
            .sort((x, y) => y.date.localeCompare(x.date) || y.slotStart - x.slotStart)
            .map((o) => (
              <div key={o.id} className={styles.listRow} style={{ gridTemplateColumns: "1fr auto auto", padding: "12px 0" }}>
                <div style={{ display: "grid", gap: 2 }}>
                  <strong style={{ fontSize: 14 }}>{`${dayLabel(o.date)} · ${slotLabel(o.slotStart)} – ${slotLabel(o.slotEnd)}`}</strong>
                  <span style={{ fontSize: 12, color: "#687080" }}>{servicesLabel(o.services)}</span>
                </div>
                <Badge tone="soft">{STATUS_LABEL[o.status]}</Badge>
                <Button variant="ghost" size="sm" onClick={() => onOpen(o)}>
                  Otevřít
                </Button>
              </div>
            ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button variant="ghost" onClick={onClose}>
            Zavřít
          </Button>
          {canEdit && (
            <Button variant="primary" onClick={onNewOrder}>
              Nová zakázka
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Ceník ---------- */

export function PricingPanel({ packages, canEdit, onEdit, onAdd }: { packages: Package[]; canEdit: boolean; onEdit: (p: Package) => void; onAdd: () => void }) {
  return (
    <>
      <div style={{ display: "grid", gap: 8 }}>
        <Heading level={2} size="title">
          Ceník
        </Heading>
        <Text tone="muted" size="sm">
          Balíčky se zobrazují na webu i v rezervačním formuláři.
        </Text>
      </div>
      <div className={styles.priceGrid}>
        {packages.map((p) => (
          <div key={p.id} className={styles.priceItem}>
            {p.featured && <Badge corner>Nejoblíbenější</Badge>}
            <span className={styles.monoLabel}>Balíček</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <strong style={{ fontSize: 22, letterSpacing: "-.02em" }}>{p.name}</strong>
              <strong style={{ fontSize: 22, letterSpacing: "-.02em", color: "#1769ff" }}>{priceLabel(p.price, p.showCurrency)}</strong>
            </div>
            <span style={{ fontSize: 13, color: "#687080", lineHeight: 1.7 }}>{p.items.join(" · ")}</span>
            <span className={styles.monoLabel}>cca {durationLabel(slotsForMinutes(p.durationMinutes))}</span>
            {canEdit && (
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button variant="ghost" size="sm" onClick={() => onEdit(p)}>
                  Upravit
                </Button>
              </div>
            )}
          </div>
        ))}
        {canEdit && (
          <button type="button" className={styles.addPrice} onClick={onAdd}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="plus" size={18} />
              Přidat balíček
            </span>
          </button>
        )}
      </div>
    </>
  );
}

export function PriceModal({ pd, onChange, onClose, onSave, onDelete }: { pd: PriceDraft; onChange: (patch: Partial<PriceDraft>) => void; onClose: () => void; onSave: () => void; onDelete: () => void }) {
  const items = pd.items
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div role="dialog" aria-modal="true" className={styles.smallModal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <span className={styles.monoLabel} style={{ color: "#1769ff" }}>
              Ceník
            </span>
            <Heading level={2} size="dialog">
              {pd.id === null ? "Nový balíček" : "Upravit balíček"}
            </Heading>
          </div>
          <button type="button" className={styles.squareButton} aria-label="Zavřít" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className={styles.twoCols}>
          <Field label="Název">
            <Input value={pd.name} onChange={(e) => onChange({ name: e.target.value })} />
          </Field>
          <Field label="Cena (Kč nebo text)">
            <Input value={pd.price} onChange={(e) => onChange({ price: e.target.value, showCurrency: /^\d|^od\s/i.test(e.target.value.trim()) })} />
          </Field>
        </div>
        <Field label="Co balíček obsahuje (jeden řádek = jedna položka)">
          <textarea className="hd-textarea" value={pd.items} onChange={(e) => onChange({ items: e.target.value })} rows={4} />
        </Field>
        <div className={styles.twoCols}>
          <Field label="Odhadovaná délka">
            <Select
              options={Array.from({ length: 31 }, (_, i) => 30 + i * 15).map((m) => ({ value: String(m), label: durationLabel(slotsForMinutes(m)) }))}
              value={String(pd.durationMinutes)}
              onChange={(e) => onChange({ durationMinutes: Number(e.target.value) })}
            />
          </Field>
          <Field label="Označit jako nejoblíbenější" layout="inline" style={{ alignSelf: "end", paddingBottom: 14 }}>
            <Input type="checkbox" checked={pd.featured} onChange={(e) => onChange({ featured: e.target.checked })} />
          </Field>
        </div>
        <div style={{ border: "1px solid #e1e5eb", padding: "16px 18px", display: "grid", gap: 8, background: "#f5f7fa" }}>
          <span className={styles.monoLabel}>Náhled na webu</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <strong style={{ fontSize: 18 }}>{pd.name || "Název balíčku"}</strong>
            <strong style={{ fontSize: 18, color: "#1769ff" }}>{pd.price ? priceLabel(pd.price, pd.showCurrency) : "—"}</strong>
          </div>
          <span style={{ fontSize: 12, color: "#687080" }}>{items.join(" · ") || "Položky balíčku"}</span>
          <span className={styles.monoLabel}>cca {durationLabel(slotsForMinutes(pd.durationMinutes))}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, paddingTop: 8 }}>
          <div>
            {pd.id !== null && (
              <Button variant="outline-danger" size="sm" onClick={onDelete}>
                Smazat
              </Button>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={onClose}>
              Zavřít
            </Button>
            <Button variant="primary" onClick={onSave}>
              Uložit balíček
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Nastavení ---------- */

export function SettingsPanel({
  settings,
  users,
  isAdmin,
  canEdit,
  onSettings,
  onSaveSettings,
  onRemoveUser,
  onAddUser,
  onChangePassword,
}: {
  settings: Settings;
  users: User[];
  isAdmin: boolean;
  canEdit: boolean;
  onSettings: (patch: Partial<Settings>) => void;
  onSaveSettings: () => void;
  onRemoveUser: (u: User) => void;
  onAddUser: () => void;
  onChangePassword: (current: string, next: string, reset: () => void) => void;
}) {
  const hourOptions = Array.from({ length: 49 }, (_, i) => i * 2).map((q) => ({ value: String(q), label: slotLabel(q) }));
  const weeklyHours = weeklyHoursOf(settings);
  const updateDay = (index: number, hours: { openSlot: number; closeSlot: number } | null) => {
    const next = weeklyHours.map((day, i) => i === index ? hours : day);
    const openDays = next.filter((day) => day !== null);
    onSettings({
      weeklyHours: next,
      workDays: next.map(day => day ? 1 : 0),
      openSlot: openDays.length ? Math.min(...openDays.map(day => day.openSlot)) : 28,
      closeSlot: openDays.length ? Math.max(...openDays.map(day => day.closeSlot)) : 76,
    });
  };
  const days = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
  return (
    <>
      <div style={{ display: "grid", gap: 8 }}>
        <Heading level={2} size="title">
          Nastavení
        </Heading>
        <Text tone="muted" size="sm">
          Pro každý den nastavte vlastní čas od–do, nebo ho vypněte. Rozvrh se opakuje každý týden a po uložení platí pro nové rezervace.
        </Text>
      </div>
      <div className={styles.settingsGrid}>
        <Card
          as="form"
          title="Provozní doba"
          onSubmit={(e) => {
            e.preventDefault();
            onSaveSettings();
          }}
        >
          <div style={{ display: "grid", gap: 16 }}>
            {days.map((label, i) => {
              const hours = weeklyHours[i];
              return (
                <div key={label} style={{ display: "grid", gap: 8, borderBottom: "1px solid #e1e5eb", paddingBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                      type="button"
                      disabled={!canEdit}
                      aria-label={`Pracovní den ${label}`}
                      aria-pressed={hours !== null}
                      className={styles.dayToggle}
                      style={{ border: `1px solid ${hours ? "#1769ff" : "#e1e5eb"}`, background: hours ? "#1769ff" : "#fff", color: hours ? "#fff" : "#687080" }}
                      onClick={() => updateDay(i, hours ? null : { openSlot: settings.openSlot, closeSlot: settings.closeSlot })}
                    >
                      {label}
                    </button>
                    <span className={styles.monoLabel}>{hours ? "Otevřeno" : "Zavřeno"}</span>
                  </div>
                  {hours && (
                    <div className={styles.twoCols}>
                      <Field label={`${label} · Od`}>
                        <Select
                          aria-label={`${label} otevřeno od`}
                          options={hourOptions.filter(o => Number(o.value) < hours.closeSlot)}
                          value={String(hours.openSlot)}
                          onChange={e => updateDay(i, { ...hours, openSlot: Number(e.target.value) })}
                          disabled={!canEdit}
                        />
                      </Field>
                      <Field label={`${label} · Do`}>
                        <Select
                          aria-label={`${label} otevřeno do`}
                          options={hourOptions.filter(o => Number(o.value) > hours.openSlot)}
                          value={String(hours.closeSlot)}
                          onChange={e => updateDay(i, { ...hours, closeSlot: Number(e.target.value) })}
                          disabled={!canEdit}
                        />
                      </Field>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className={styles.twoCols}>
            <Field label="Krok rezervace">
              <Select
                options={[
                  { value: "15", label: "15 minut" },
                  { value: "30", label: "30 minut" },
                  { value: "60", label: "60 minut" },
                ]}
                value={String(settings.stepMinutes)}
                onChange={(e) => onSettings({ stepMinutes: Number(e.target.value) })}
                disabled={!canEdit}
              />
            </Field>
            <Field label="Přejezd mezi zakázkami">
              <Select
                options={[
                  { value: "0", label: "Bez přejezdu" },
                  { value: "15", label: "15 minut" },
                  { value: "30", label: "30 minut" },
                  { value: "45", label: "45 minut" },
                ]}
                value={String(settings.bufferMinutes)}
                onChange={(e) => onSettings({ bufferMinutes: Number(e.target.value) })}
                disabled={!canEdit}
              />
            </Field>
          </div>
          {canEdit && (
            <div>
              <Button type="submit" variant="primary">
                Uložit
              </Button>
            </div>
          )}
        </Card>
        <div style={{ display: "grid", gap: 20 }}>
          {isAdmin && (
            <Card title="Uživatelé">
              {users.map((u) => (
                <div key={u.id} className={styles.listRow} style={{ gridTemplateColumns: "1fr auto auto", padding: "12px 0" }}>
                  <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                    <strong style={{ fontSize: 14 }}>{u.name}</strong>
                    <span style={{ fontSize: 12, color: "#687080" }}>{u.email}</span>
                  </div>
                  <Badge tone="soft">{ROLE_LABEL[u.role]}</Badge>
                  <Button variant="outline-danger" size="sm" onClick={() => onRemoveUser(u)}>
                    Odebrat
                  </Button>
                </div>
              ))}
              <div>
                <Button variant="dark" onClick={onAddUser}>
                  Přidat uživatele
                </Button>
              </div>
            </Card>
          )}
          <Card
            as="form"
            title="Změna hesla"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = new FormData(form);
              onChangePassword(String(data.get("current") ?? ""), String(data.get("next") ?? ""), () => form.reset());
            }}
          >
            <Field label="Současné heslo">
              <Input type="password" name="current" autoComplete="current-password" required />
            </Field>
            <Field label="Nové heslo">
              <Input type="password" name="next" minLength={10} autoComplete="new-password" required />
            </Field>
            <div>
              <Button type="submit" variant="dark">
                Změnit heslo
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
