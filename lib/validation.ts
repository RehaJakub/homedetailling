export function parseReservation(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const service = String(body.service ?? "").trim();
  const address = String(body.address ?? "").trim();
  const note = String(body.note ?? "").trim();
  if (!name || !phone || !email || !service || !address) return null;
  if (name.split(/\s+/).length < 2 || phone.replace(/\D/g, "").length < 9) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return { name: name.slice(0, 120), phone: phone.slice(0, 40), email: email.slice(0, 254), service: service.slice(0, 80), address: address.slice(0, 240), note: note.slice(0, 1000) };
}

export function parsePricePackage(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  const price = String(body.price ?? "").trim();
  const items = Array.isArray(body.items) ? body.items.map(String).map((item) => item.trim()).filter(Boolean) : [];
  if (!name || !price || items.length === 0) return null;
  return { name: name.slice(0, 80), price: price.slice(0, 30), showCurrency: body.showCurrency !== false, items: items.slice(0, 12) };
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
