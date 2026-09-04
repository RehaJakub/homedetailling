import { Footer } from '@homedetailing/ui';

// Wordmark stand-in for the site's /home-detailing-logo.png.
function Logo({ height = 40 }: { height?: number }) {
  return (
    <svg width={height * 2.6} height={height} viewBox="0 0 260 100" aria-hidden="true">
      <path d="M12 22h26v22h24V22h26v56H62V60H38v18H12z" fill="#080b12" />
      <path d="M104 22h34c22 0 34 12 34 28s-12 28-34 28h-34zm26 16v24h8c8 0 12-5 12-12s-4-12-12-12z" fill="#1769ff" />
      <text x="186" y="50" fontFamily="Geist, Arial, sans-serif" fontSize="22" fontWeight="900" fill="#080b12">HOME</text>
      <text x="186" y="78" fontFamily="Geist Mono, monospace" fontSize="12" fontWeight="700" letterSpacing="3" fill="#1769ff">DETAILING</text>
    </svg>
  );
}

export function Default() {
  return <Footer logo={<Logo height={44} />} tagline="Mobilní detailing · Ostrava a okolí" note="© 2026 Home Detailing" />;
}
