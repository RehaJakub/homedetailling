"use client";
import { useCallback, useRef, useState } from "react";
import { Icon, type IconName } from "@homedetailing/ui";
import styles from "@/app/admin/admin.module.css";

export type Toast = {
  id: number;
  tone: "ok" | "warn" | "danger";
  icon: IconName;
  title: string;
  text?: string;
  ttl: number;
  actionLabel?: string;
  action?: () => void;
};

export type ToastInput = Partial<Omit<Toast, "id">> & { title: string };

const TONE_COLOR = { ok: "#1769ff", warn: "#ffb020", danger: "#ff6b5c" };

/** Bottom-right toast stack (max 4). Deletes use the `action` slot for undo. */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = Date.now() + Math.random();
      const next: Toast = { id, tone: "ok", icon: "check-circle", ttl: input.action ? 7000 : 4200, ...input };
      setToasts((list) => list.concat([next]).slice(-4));
      timers.current.set(id, setTimeout(() => dismiss(id), next.ttl));
    },
    [dismiss],
  );

  return { toasts, toast, dismiss };
}

export function ToastStack({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div aria-live="polite" className={styles.toastStack}>
      {toasts.map((n) => {
        const color = TONE_COLOR[n.tone];
        return (
          <div key={n.id} className={styles.toast}>
            <Icon name={n.icon} size={18} stroke={2} style={{ color, marginTop: 1 }} />
            <div style={{ display: "grid", gap: 2, minWidth: 0, flex: 1 }}>
              <strong style={{ fontSize: 13 }}>{n.title}</strong>
              {n.text && <span style={{ fontSize: 12, color: "#87909d", lineHeight: 1.5 }}>{n.text}</span>}
            </div>
            {n.action && (
              <button
                type="button"
                className={styles.toastAction}
                onClick={() => {
                  n.action?.();
                  dismiss(n.id);
                }}
              >
                <Icon name="undo" size={12} stroke={2} />
                {n.actionLabel ?? "Vrátit"}
              </button>
            )}
            <button type="button" className={styles.toastClose} aria-label="Zavřít" onClick={() => dismiss(n.id)}>
              <Icon name="close" size={12} stroke={2} />
            </button>
            <i className={styles.toastBar} style={{ background: color, animationDuration: `${n.ttl}ms` }} />
          </div>
        );
      })}
    </div>
  );
}
