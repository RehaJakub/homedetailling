import Image from "next/image";
import Link from "next/link";
import { Footer } from "@homedetailing/ui";
import { CITY_PAGES } from "@/lib/seo";
import styles from "@/app/landing.module.css";

export function PublicFooter() {
  return (
    <Footer
      logo={
        <Image
          src="/images/home-detailing-logo.png"
          alt="Logo Home Detailing – mobilní čištění aut"
          width={2073}
          height={758}
          sizes="220px"
          className={styles.footerLogo}
        />
      }
      logoHref="/#uvod"
      tagline="Mobilní detailing · Ostrava, Havířov a okolí"
      note={
        <>
          <span>© 2026 Home Detailing. Všechna práva vyhrazena.</span>
          <span className={styles.footerCities} aria-label="Oblasti mobilního čištění aut">
            {CITY_PAGES.map((page) => (
              <Link key={page.slug} href={`/${page.slug}`} className={styles.footerLink}>
                {page.city}
              </Link>
            ))}
          </span>
        </>
      }
    />
  );
}
