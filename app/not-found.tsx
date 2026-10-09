import type { Metadata } from "next";
import Image from "next/image";
import { Button, Container, Eyebrow, Heading, SiteHeader, Text } from "@homedetailing/ui";
import { PublicFooter } from "@/components/landing/PublicFooter";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: { absolute: "Stránka nenalezena | Home Detailing" },
  description: "Požadovaná stránka nebyla nalezena. Vraťte se na web Home Detailing a vyberte si službu nebo termín mobilního čištění auta.",
};

const links = [
  { href: "/#sluzby", label: "Služby" },
  { href: "/#galerie", label: "Galerie" },
  { href: "/#cenik", label: "Ceník" },
  { href: "/#faq", label: "Dotazy" },
];

export default function NotFound() {
  return (
    <main className={styles.page}>
      <SiteHeader
        logo={
          <Image
            src="/images/home-detailing-logo.png"
            alt="Logo Home Detailing – mobilní čištění aut"
            width={2073}
            height={758}
            sizes="(max-width: 650px) 160px, 180px"
            className={styles.headerLogo}
          />
        }
        logoHref="/"
        links={links}
        cta={{ href: "/#rezervace", label: "Rezervovat termín" }}
      />
      <Container as="section" className={styles.notFound}>
        <Eyebrow>Chyba 404</Eyebrow>
        <Heading level={1} size="display">
          Tato stránka <em>neexistuje.</em>
        </Heading>
        <Text tone="muted" lead>
          Odkaz je neplatný nebo byla stránka přesunuta. Na hlavní stránce najdete služby, ceník i online rezervaci.
        </Text>
        <Button href="/" variant="primary" icon="arrow-up-right">
          Zpět na hlavní stránku
        </Button>
      </Container>
      <PublicFooter />
    </main>
  );
}
