export function isInteriorTier(name: string) {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/\s+/g, " ");
  return normalized === "basic interier" || normalized === "premium interier";
}

/** Keep the newly selected interior tier; exterior and other services are unaffected. */
export function selectServices(previous: string[], next: string[]) {
  const added = next.find(name => isInteriorTier(name) && !previous.includes(name));
  const chosen = added ?? next.find(isInteriorTier);
  return next.filter(name => !isInteriorTier(name) || name === chosen);
}
