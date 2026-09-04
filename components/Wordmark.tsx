/** Text logo "HOME / DETAILING" used by the site header, footer, login and admin. */
export function Wordmark({ size = 18, light = false, centered = false }: { size?: number; light?: boolean; centered?: boolean }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: centered ? "center" : "flex-start", lineHeight: 1, color: light ? "#fff" : "#080b12" }}>
      <strong style={{ fontSize: size, letterSpacing: "-.02em" }}>HOME</strong>
      <span style={{ fontFamily: "var(--hd-font-mono)", fontSize: Math.round(size * 0.55), letterSpacing: ".3em", color: "#1769ff", fontWeight: 700 }}>DETAILING</span>
    </span>
  );
}
