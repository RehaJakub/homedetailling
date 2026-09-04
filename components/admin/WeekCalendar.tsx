"use client";
import { Button, Heading, Icon, Text } from "@homedetailing/ui";
import { addDays, conflictsOf, dayLabel, DOW_SHORT, fromIso, layoutColumns, slotLabel, slotOf, STATUS_LABEL } from "@/lib/booking";
import styles from "@/app/admin/admin.module.css";
import type { Booking, Settings } from "./types";

const PX = 13;
const mono = "var(--hd-font-mono)";

export type WeekCalendarProps = {
  bookings: Booking[];
  settings: Settings;
  weekStart: string;
  today: string;
  /** Show a single day instead of the week (phones). */
  dayMode: boolean;
  focusDay: string;
  onWeekChange: (weekStart: string) => void;
  onFocusDay: (iso: string) => void;
  onOpen: (booking: Booking) => void;
  onCreateAt: (date: string, slot: number) => void;
};

/** Week grid: 15 min = 13px, overlapping bookings side by side, conflict stripe, now-line, click to create. */
export function WeekCalendar({ bookings, settings, weekStart, today, dayMode, focusDay, onWeekChange, onFocusDay, onOpen, onCreateAt }: WeekCalendarProps) {
  const { openSlot: open, closeSlot: close, workDays } = settings;
  const rows = close - open;
  const weekIso = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const visible = dayMode ? [focusDay] : weekIso;
  const now = new Date();
  const nowSlot = slotOf(now);
  const nowTop = (nowSlot - open) * PX + Math.floor(((now.getMinutes() % 15) / 15) * PX);
  const weekLabel = `${dayLabel(weekIso[0])} – ${dayLabel(weekIso[6])} ${fromIso(weekIso[6]).getFullYear()}`;
  const hours = [];
  for (let q = open; q < close; q += 4) hours.push(q);

  return (
    <>
      <div className={styles.calendarToolbar}>
        <div style={{ display: "grid", gap: 8 }}>
          <Heading level={2} size="title">
            Kalendář
          </Heading>
          <Text tone="muted" size="sm">
            Kliknutím na zakázku upravíte čas podle domluvy s klientem. Překrývající se zakázky stojí vedle sebe.
          </Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button variant="ghost" size="sm" aria-label={dayMode ? "Předchozí den" : "Předchozí týden"} onClick={() => (dayMode ? onFocusDay(addDays(focusDay, -1)) : onWeekChange(addDays(weekStart, -7)))}>
            <Icon name="chevron-left" size={16} stroke={2} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onWeekChange(addDays(today, -((fromIso(today).getDay() + 6) % 7)));
              onFocusDay(today);
            }}
          >
            Dnes
          </Button>
          <Button variant="ghost" size="sm" aria-label={dayMode ? "Další den" : "Další týden"} onClick={() => (dayMode ? onFocusDay(addDays(focusDay, 1)) : onWeekChange(addDays(weekStart, 7)))}>
            <Icon name="chevron-right" size={16} stroke={2} />
          </Button>
          <strong style={{ marginLeft: 8, fontSize: 15, whiteSpace: "nowrap" }}>{dayMode ? dayLabel(focusDay) : weekLabel}</strong>
        </div>
      </div>

      <div className={styles.legend}>
        <span>
          <i style={{ background: "#1769ff" }} />
          Potvrzeno
        </span>
        <span>
          <i style={{ border: "1px dashed #1769ff", background: "#dce8ff" }} />
          Čeká na potvrzení
        </span>
        <span>
          <i style={{ background: "#e1e5eb" }} />
          Hotovo
        </span>
        <span>
          <i style={{ background: "#fff", boxShadow: "inset 3px 0 0 #b42318", border: "1px solid #e1e5eb" }} />
          Překryv
        </span>
      </div>

      <div className={styles.calendarFrame}>
        <div className={styles.calendarHead} style={{ gridTemplateColumns: `56px repeat(${visible.length}, minmax(0, 1fr))` }}>
          <div />
          {visible.map((iso) => {
            const d = fromIso(iso);
            const isToday = iso === today;
            const off = !workDays[(d.getDay() + 6) % 7];
            const count = bookings.filter((r) => r.date === iso && r.status !== "cancelled").length;
            return (
              <div key={iso} className={styles.dayHead} style={{ color: isToday ? "#1769ff" : off ? "#a9afb9" : "#080b12", background: isToday ? "#dce8ff" : "transparent" }}>
                <span className={styles.monoLabel} style={{ color: "inherit" }}>
                  {DOW_SHORT[d.getDay()]}
                </span>
                <strong style={{ fontSize: 18, letterSpacing: "-.02em" }}>{d.getDate()}</strong>
                <span style={{ fontSize: 11, opacity: 0.7 }}>{count ? `${count} ${count === 1 ? "zakázka" : count < 5 ? "zakázky" : "zakázek"}` : ""}</span>
              </div>
            );
          })}
        </div>
        <div className={styles.calendarGrid} style={{ gridTemplateColumns: `56px repeat(${visible.length}, minmax(0, 1fr))` }}>
          <div style={{ position: "relative", height: rows * PX }}>
            {hours.map((q) => (
              <span key={q} style={{ position: "absolute", right: 8, top: (q - open) * PX, fontFamily: mono, fontSize: 11, color: "#687080", transform: "translateY(-6px)" }}>
                {slotLabel(q)}
              </span>
            ))}
          </div>
          {visible.map((iso) => {
            const d = fromIso(iso);
            const off = !workDays[(d.getDay() + 6) % 7];
            const events = layoutColumns(bookings.filter((r) => r.date === iso && r.status !== "cancelled"));
            return (
              <div
                key={iso}
                className={styles.dayColumn}
                style={{
                  height: rows * PX,
                  background: `${off ? "repeating-linear-gradient(135deg,#f5f7fa 0 8px,#fff 8px 16px)," : ""}repeating-linear-gradient(to bottom,#edf0f4 0 1px,transparent 1px ${PX * 4}px)`,
                }}
                onClick={(ev) => {
                  if (ev.target !== ev.currentTarget) return;
                  const q = open + Math.floor(ev.nativeEvent.offsetY / (PX * 4)) * 4;
                  onCreateAt(iso, q);
                }}
              >
                {iso === today && nowSlot >= open && nowSlot < close && <div className={styles.nowLine} style={{ top: nowTop }} />}
                {events.map((e) => {
                  const w = 100 / e.cols;
                  const conflict = conflictsOf(e, bookings).length > 0;
                  const bg = e.status === "confirmed" ? "#1769ff" : e.status === "done" ? "#e1e5eb" : "#dce8ff";
                  const fg = e.status === "confirmed" ? "#fff" : e.status === "done" ? "#687080" : "#1769ff";
                  return (
                    <button
                      key={e.id}
                      type="button"
                      className={styles.event}
                      title={`${e.name} · ${slotLabel(e.slotStart)} – ${slotLabel(e.slotEnd)} · ${STATUS_LABEL[e.status]}`}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onOpen(e);
                      }}
                      style={{
                        top: (e.slotStart - open) * PX,
                        height: (e.slotEnd - e.slotStart) * PX - 2,
                        left: `calc(${e.col * w}% + 2px)`,
                        width: `calc(${w}% - 4px)`,
                        border: e.status === "new" ? "1px dashed #1769ff" : `1px solid ${bg}`,
                        background: bg,
                        color: fg,
                        boxShadow: conflict ? "inset 3px 0 0 #b42318" : "none",
                      }}
                    >
                      <strong>{e.name}</strong>
                      <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: ".04em" }}>{`${slotLabel(e.slotStart)} – ${slotLabel(e.slotEnd)}`}</span>
                      <span style={{ fontSize: 11, opacity: 0.8 }}>{e.service}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

