"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Heading, Icon, Text } from "@homedetailing/ui";
import { addDays, conflictsOf, dayLabel, DOW_SHORT, fromIso, isWorkDay, settingsForDate, layoutColumns, servicesLabel, slotLabel, slotOf, STATUS_LABEL } from "@/lib/booking";
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
  /** Drop handler: the booking was dragged to another day and/or time. */
  onMove?: (booking: Booking, target: { date: string; slotStart: number; slotEnd: number }) => void;
  /** Snap for click-to-create and dragging, in quarter-hour slots (booking step from settings). */
  stepSlots?: number;
};

type Drag = {
  booking: Booking;
  startX: number;
  startY: number;
  /** Target after snapping; null until the pointer moved. */
  target: { col: number; slotStart: number } | null;
};

const HEADER_COLUMN = 56;
const DRAG_THRESHOLD = 4;

/** Week grid: 15 min = 13px, overlapping bookings side by side, conflict stripe, now-line, click to create, drag to move. */
export function WeekCalendar({ bookings, settings, weekStart, today, dayMode, focusDay, onWeekChange, onFocusDay, onOpen, onCreateAt, onMove, stepSlots = 1 }: WeekCalendarProps) {
  // Keep existing orders visible even after opening hours are narrowed.
  const open = Math.min(settings.openSlot, ...bookings.map(b => b.slotStart));
  const close = Math.max(settings.closeSlot, ...bookings.map(b => b.slotEnd));
  const rows = close - open;
  const weekIso = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const visible = useMemo(() => (dayMode ? [focusDay] : weekIso), [dayMode, focusDay, weekIso]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  dragRef.current = drag;

  // Pointer tracking lives on the window so a drag survives leaving the grid.
  useEffect(() => {
    if (!drag || !onMove) return;
    const columns = visible;
    const onPointerMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      const grid = gridRef.current;
      if (!d || !grid) return;
      const dx = ev.clientX - d.startX;
      const dy = ev.clientY - d.startY;
      if (!d.target && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      const rect = grid.getBoundingClientRect();
      const colWidth = (rect.width - HEADER_COLUMN) / columns.length;
      const col = Math.min(columns.length - 1, Math.max(0, Math.floor((ev.clientX - rect.left - HEADER_COLUMN) / colWidth)));
      const length = d.booking.slotEnd - d.booking.slotStart;
      const snapped = Math.round(dy / PX / stepSlots) * stepSlots;
      const slotStart = Math.min(close - length, Math.max(open, d.booking.slotStart + snapped));
      setDrag({ ...d, target: { col, slotStart } });
    };
    const finish = (ev: PointerEvent) => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!d || ev.type === "pointercancel") return;
      if (!d.target) {
        // No movement: treat as a click.
        if (ev.type === "pointerup") onOpen(d.booking);
        return;
      }
      const date = columns[d.target.col];
      const length = d.booking.slotEnd - d.booking.slotStart;
      if (date === d.booking.date && d.target.slotStart === d.booking.slotStart) return;
      onMove(d.booking, { date, slotStart: d.target.slotStart, slotEnd: d.target.slotStart + length });
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        dragRef.current = null;
        setDrag(null);
      }
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      window.removeEventListener("keydown", onKey);
    };
  }, [drag, onMove, onOpen, visible, open, close, stepSlots]);
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
          <i className={styles.workingSwatch} />
          Pracovní doba
        </span>
        <span>
          <i className={styles.closedSwatch} />
          Mimo pracovní dobu
        </span>
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
            const off = !isWorkDay(iso, settings);
            const hours = settingsForDate(iso, settings);
            const count = bookings.filter((r) => r.date === iso && r.status !== "cancelled").length;
            return (
              <div key={iso} className={styles.dayHead} style={{ color: isToday ? "#1769ff" : off ? "#a9afb9" : "#080b12", background: isToday ? "#dce8ff" : "transparent" }}>
                <span className={styles.monoLabel} style={{ color: "inherit" }}>
                  {DOW_SHORT[d.getDay()]}
                </span>
                <strong style={{ fontSize: 18, letterSpacing: "-.02em" }}>{d.getDate()}</strong>
                <span className={`${styles.hoursBadge} ${off ? styles.hoursBadgeClosed : styles.hoursBadgeOpen}`}>
                  <span>{off ? "Zavřeno" : "Pracujeme"}</span>
                  <strong>{off ? "Celý den" : `${slotLabel(hours.openSlot)}–${slotLabel(hours.closeSlot)}`}</strong>
                </span>
                <span style={{ fontSize: 11, opacity: 0.7 }}>{count ? `${count} ${count === 1 ? "zakázka" : count < 5 ? "zakázky" : "zakázek"}` : ""}</span>
              </div>
            );
          })}
        </div>
        <div ref={gridRef} className={styles.calendarGrid} style={{ gridTemplateColumns: `56px repeat(${visible.length}, minmax(0, 1fr))` }}>
          <div style={{ position: "relative", height: rows * PX }}>
            {hours.map((q) => (
              <span key={q} style={{ position: "absolute", right: 8, top: (q - open) * PX, fontFamily: mono, fontSize: 11, color: "#687080", transform: "translateY(-6px)" }}>
                {slotLabel(q)}
              </span>
            ))}
          </div>
          {visible.map((iso, colIndex) => {
            const off = !isWorkDay(iso, settings);
            const hours = settingsForDate(iso, settings);
            const events = layoutColumns(bookings.filter((r) => r.date === iso && r.status !== "cancelled"));
            const ghost = drag?.target && drag.target.col === colIndex ? drag : null;
            return (
              <div
                key={iso}
                className={styles.dayColumn}
                style={{
                  height: rows * PX,
                }}
                onClick={(ev) => {
                  if (ev.target !== ev.currentTarget) return;
                  const q = open + Math.floor(ev.nativeEvent.offsetY / (PX * stepSlots)) * stepSlots;
                  onCreateAt(iso, q);
                }}
              >
                {!off && (
                  <div className={styles.workingRange} style={{ top: (hours.openSlot - open) * PX, height: (hours.closeSlot - hours.openSlot) * PX }}>
                    <span className={styles.hoursStart}>Od {slotLabel(hours.openSlot)}</span>
                    {hours.closeSlot - hours.openSlot >= 4 && <span className={styles.hoursEnd}>Do {slotLabel(hours.closeSlot)}</span>}
                  </div>
                )}
                {(off ? [[open, close]] : [[open, hours.openSlot], [hours.closeSlot, close]]).map(([start, end], i) => end > start && (
                  <div key={i} className={styles.closedRange} style={{ top: (start - open) * PX, height: (end - start) * PX }}>
                    <span>{off ? "Celý den zavřeno" : "Mimo pracovní dobu"}</span>
                  </div>
                ))}
                {iso === today && nowSlot >= open && nowSlot < close && <div className={styles.nowLine} style={{ top: nowTop }} />}
                {ghost && ghost.target && (
                  <div
                    className={styles.ghost}
                    style={{ top: (ghost.target.slotStart - open) * PX, height: (ghost.booking.slotEnd - ghost.booking.slotStart) * PX - 2 }}
                  >
                    <strong>{ghost.booking.name}</strong>
                    <span style={{ fontFamily: mono, fontSize: 10 }}>{`${slotLabel(ghost.target.slotStart)} – ${slotLabel(ghost.target.slotStart + ghost.booking.slotEnd - ghost.booking.slotStart)}`}</span>
                  </div>
                )}
                {events.map((e) => {
                  const w = 100 / e.cols;
                  const conflict = conflictsOf(e, bookings).length > 0;
                  const bg = e.status === "confirmed" ? "#1769ff" : e.status === "done" ? "#e1e5eb" : "#dce8ff";
                  const fg = e.status === "confirmed" ? "#fff" : e.status === "done" ? "#687080" : "#1769ff";
                  const dragging = drag?.booking.id === e.id && drag.target !== null;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      className={styles.event}
                      title={`${e.name} · ${slotLabel(e.slotStart)} – ${slotLabel(e.slotEnd)} · ${servicesLabel(e.services)} · ${STATUS_LABEL[e.status]}`}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        // With drag enabled the click is handled on pointerup (no movement).
                        if (!onMove) onOpen(e);
                      }}
                      onPointerDown={(ev) => {
                        if (!onMove || ev.button !== 0) return;
                        ev.preventDefault();
                        setDrag({ booking: e, startX: ev.clientX, startY: ev.clientY, target: null });
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
                        opacity: dragging ? 0.35 : 1,
                        cursor: onMove ? (drag ? "grabbing" : "grab") : "pointer",
                        touchAction: onMove ? "none" : undefined,
                      }}
                    >
                      <strong>{e.name}</strong>
                      <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: ".04em" }}>{`${slotLabel(e.slotStart)} – ${slotLabel(e.slotEnd)}`}</span>
                      <span style={{ fontSize: 11, opacity: 0.8 }}>{servicesLabel(e.services)}</span>
                      {!dayMode && (
                        <span className={styles.eventExtra} style={{ borderTopColor: e.status === "confirmed" ? "rgb(255 255 255 / 25%)" : "rgb(8 11 18 / 10%)" }}>
                          {[e.address, e.note].filter(Boolean).join(" · ")}
                        </span>
                      )}
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
