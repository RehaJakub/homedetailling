import { dayLabel, servicesLabel, slotLabel } from "@/lib/booking";

type ReservationForNotification = {
  date: string;
  slotStart: number;
  slotEnd: number;
  services: string[];
};

const DEFAULT_BASE_URL = "https://ntfy.sh";
const DEFAULT_CLICK_URL = "https://homedetailing.cz/admin";

/**
 * Publishes a privacy-conscious notification for a new public reservation.
 * Contact details and the address stay in the protected admin panel.
 * Returns false when ntfy is not configured.
 */
export async function notifyNewReservation(reservation: ReservationForNotification) {
  const topic = process.env.NTFY_TOPIC?.trim();
  if (!topic) return false;

  const baseUrl = new URL(process.env.NTFY_BASE_URL?.trim() || DEFAULT_BASE_URL);
  if (baseUrl.protocol !== "https:" && baseUrl.protocol !== "http:") {
    throw new Error("NTFY_BASE_URL must use HTTP or HTTPS.");
  }

  const token = process.env.NTFY_TOKEN?.trim();
  const message = [
    `${dayLabel(reservation.date)} · ${slotLabel(reservation.slotStart)}–${slotLabel(reservation.slotEnd)}`,
    servicesLabel(reservation.services),
    "Kontakt a adresu najdete v administraci.",
  ].join("\n");

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      topic,
      title: "Nová rezervace · Home Detailing",
      message,
      priority: 4,
      tags: ["car", "calendar"],
      click: process.env.NTFY_CLICK_URL?.trim() || DEFAULT_CLICK_URL,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) throw new Error(`ntfy returned HTTP ${response.status}.`);
  return true;
}
