"use client";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BeforeAfterSlider,
  Button,
  Container,
  Eyebrow,
  Footer,
  Heading,
  Icon,
  PriceCard,
  ServiceCard,
  ServiceGrid,
  SiteHeader,
  Text,
  type IconName,
} from "@homedetailing/ui";
import { APP_VERSION } from "@/lib/version";
import { BookingForm, type PricePackage } from "@/components/landing/BookingForm";
import { FAQ, Faq } from "@/components/landing/Faq";
import styles from "./landing.module.css";

const navLinks = [
  { href: "#sluzby", label: "Služby" },
  { href: "#postup", label: "Postup" },
  { href: "#galerie", label: "Galerie" },
  { href: "#cenik", label: "Ceník" },
  { href: "#faq", label: "Dotazy" },
];

const services = [
  { number: "01", title: "Interiér", text: "Basic za 1 500 Kč zahrnuje vysávání, čištění a impregnaci interiéru. Premium za 2 000 Kč přidává péči o kožené sedačky a tepování sedaček a koberce." },
  { number: "02", title: "Exteriér", text: "Ruční mytí, čištění kol a ochranný vosk na několik týdnů." },
];

const trust: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "droplet", title: "Vlastní voda i elektřina", text: "Nepotřebujeme od vás nic než místo." },
  { icon: "wallet", title: "Platba po dokončení", text: "Hotově nebo převodem." },
  { icon: "phone", title: "Potvrzení do 3 hodin", text: "Termín vám potvrdíme telefonicky." },
];

const steps: Array<{ icon: IconName; index: string; title: string; text: string }> = [
  { icon: "calendar", index: "01", title: "Vyberete službu a čas", text: "Vyberete den a čas začátku po 30 minutách. Pro každou rezervaci vyhradíme 3 hodiny." },
  { icon: "phone", index: "02", title: "Potvrdíme termín", text: "Ozveme se telefonicky a případnou změnu času rovnou domluvíme." },
  { icon: "sparkle", index: "03", title: "Přijedeme a vyčistíme", text: "Na místě u vás doma nebo v práci. Platba hotově nebo převodem po dokončení." },
];

const gallery = [
  { number: "01", title: "Interiér", description: "Palubní deska a středový panel před čištěním a po něm.", beforeImage: "/images/interier-pred.jpeg", afterImage: "/images/interier-po.jpeg", initialPosition: 50 },
  { number: "02", title: "Středový panel", description: "Středový panel před čištěním a po něm.", beforeImage: "/images/stredpanel-v2-pred.jpeg", afterImage: "/images/stredpanel-v2-po.jpeg", initialPosition: 50 },
  { number: "03", title: "Interiér – koberce", description: "Koberce a zadní prostor interiéru před čištěním a po něm.", beforeImage: "/images/interier-koberce-pred.jpeg", afterImage: "/images/interier-koberce-po.jpeg", initialPosition: 50 },
  { number: "04", title: "Dveře", description: "Vnitřní výplň dveří před čištěním a po něm.", beforeImage: "/images/dvere-pred.jpeg", afterImage: "/images/dvere-po.jpeg", initialPosition: 50 },
];

// Shown until the pricing API answers; mirrors the seed content of the design.
const fallbackPackages: PricePackage[] = [
  { id: 1, name: "Exteriér", price: "Domluvou", showCurrency: false, featured: false, durationMinutes: 180, items: ["Ruční mytí karoserie", "Čištění kol a pneu", "Ochranný vosk na několik týdnů"] },
  { id: 2, name: "Basic interiér", price: "1 500", showCurrency: true, featured: false, durationMinutes: 150, items: ["Vysávání", "Čištění plastů, kůže a textilu", "Vnitřní okna", "Impregnace kůže a plastů", "Čištění koberců"] },
  { id: 3, name: "Premium interiér", price: "2 000", showCurrency: true, featured: true, durationMinutes: 240, items: ["Vše z balíčku Basic", "Čištění a impregnace kožených sedaček", "Tepování sedaček a koberce"] },
];

const marqueeText = "Basic interiér · Premium interiér · Exteriér · Ostrava · Poruba · Havířov · Frýdek-Místek · Přijedeme k vám ·";

const siteUrl = "https://homedetailing.cz";
const businessId = `${siteUrl}/#business`;
const serviceAreas = ["Ostrava", "Havířov", "Frýdek-Místek"];

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: "Home Detailing",
      inLanguage: "cs-CZ",
      publisher: { "@id": businessId },
    },
    {
      "@type": "AutomotiveBusiness",
      "@id": businessId,
      name: "Home Detailing",
      url: `${siteUrl}/`,
      logo: `${siteUrl}/images/home-detailing-logo.png`,
      image: [
        `${siteUrl}/images/interier-po.jpeg`,
        `${siteUrl}/images/stredpanel-v2-po.jpeg`,
        `${siteUrl}/images/dvere-po.jpeg`,
      ],
      description: "Mobilní čištění interiéru a exteriéru aut v Ostravě, Havířově, Frýdku-Místku a okolí.",
      priceRange: "1 500–2 000 Kč",
      telephone: "+420777011690",
      contactPoint: [
        { "@type": "ContactPoint", telephone: "+420777011690", contactType: "rezervace", availableLanguage: "Czech" },
        { "@type": "ContactPoint", telephone: "+420733477254", contactType: "rezervace", availableLanguage: "Czech" },
      ],
      areaServed: [
        ...serviceAreas.map((name) => ({ "@type": "City", name })),
        { "@type": "AdministrativeArea", name: "okolí Ostravy do 30 km" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Mobilní čištění a detailing aut",
        itemListElement: [
          {
            "@type": "Offer",
            price: "1500",
            priceCurrency: "CZK",
            itemOffered: { "@type": "Service", name: "Basic čištění interiéru auta", areaServed: serviceAreas },
          },
          {
            "@type": "Offer",
            price: "2000",
            priceCurrency: "CZK",
            itemOffered: { "@type": "Service", name: "Premium čištění interiéru a tepování auta", areaServed: serviceAreas },
          },
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Ruční mytí a detailing exteriéru auta", areaServed: serviceAreas },
          },
        ],
      },
      potentialAction: {
        "@type": "ReserveAction",
        target: `${siteUrl}/#rezervace`,
        result: { "@type": "Reservation", name: "Rezervace mobilního čištění auta" },
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq-schema`,
      mainEntity: FAQ.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

export default function Home() {
  const [packages, setPackages] = useState<PricePackage[]>(fallbackPackages);
  const [toast, setToast] = useState<{ message: string; icon: IconName } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeHref, setActiveHref] = useState<string | undefined>(undefined);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Every "#rezervace" link opens the booking modal instead of scrolling.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href="#rezervace"]');
      if (!link) return;
      event.preventDefault();
      setBookingOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Lock page scroll and close on Escape while the modal is open.
  useEffect(() => {
    if (!bookingOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBookingOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [bookingOpen]);

  useEffect(() => {
    fetch("/api/v2/pricing")
      .then((response) => response.json())
      .then((data: { packages: PricePackage[] }) => {
        if (data.packages?.length) setPackages(data.packages);
      })
      .catch(() => undefined);
  }, []);

  // Highlight the nav link of the section currently under the header.
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1)).concat("rezervace");
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((x, y) => y.intersectionRatio - x.intersectionRatio)[0];
        if (visible) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.2, 0.5] },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const showToast = useCallback((message: string, icon: IconName = "check") => {
    setToast({ message, icon });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader
        logo={<Image src="/images/home-detailing-logo.png" alt="Home Detailing" width={2073} height={758} sizes="(max-width: 650px) 160px, 180px" className={styles.headerLogo} loading="eager" />}
        links={navLinks}
        cta={{ href: "#rezervace", label: "Rezervovat termín" }}
        sticky
        activeHref={activeHref}
      />

      <Container as="section" id="uvod" style={{ display: "block" }}>
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.up} style={{ animationDuration: ".7s" }}>
              <Eyebrow>Mobilní detailing · Ostrava a okolí</Eyebrow>
            </div>
            <div className={styles.up} style={{ animationDelay: ".1s" }}>
              <Heading level={1} size="display">
                Čištění aut <em>Ostrava a okolí.</em>
              </Heading>
            </div>
            <div className={styles.up} style={{ animationDelay: ".2s" }}>
              <Text tone="muted" lead>
                <span className={styles.heroLeadLine}>Mobilní detailing v Ostravě, Havířově a okolí.</span>{" "}
                <span className={styles.heroLeadLine}>Přijedeme k vám domů nebo do práce.</span>{" "}
                <span className={styles.heroLeadLine}>Vyčistíme interiér i exteriér vozu.</span>
              </Text>
            </div>
            <div className={`${styles.heroButtons} ${styles.up}`} style={{ animationDelay: ".3s" }}>
              <Button href="#rezervace" variant="primary" icon="arrow-up-right">
                Rezervovat termín
              </Button>
              <Button href="#postup" variant="dark" icon="arrow-down">
                Jak to funguje
              </Button>
            </div>
            <div className={`${styles.metrics} ${styles.up}`} style={{ animationDelay: ".4s" }}>
              {(
                [
                  ["clock", "3 h", "Průměrná návštěva"],
                ] as Array<[IconName, string, string]>
              ).map(([icon, value, label]) => (
                <div key={label} className={styles.metric}>
                  <strong>
                    <Icon name={icon} size={20} style={{ color: "#1769ff" }} />
                    {value}
                  </strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.heroVisual} ${styles.up}`} style={{ animationDuration: ".9s", animationDelay: ".25s" }}>
            <div className={styles.heroModel}>
              <model-viewer
                src="/models/car.glb"
                alt="3D model automobilu"
                auto-rotate
                rotation-per-second="18deg"
                disable-zoom
                shadow-intensity="1.2"
                shadow-softness="0.85"
                exposure="1.05"
                environment-image="legacy"
                tone-mapping="neutral"
                autoplay
                camera-orbit="35deg 74deg auto"
                field-of-view="24deg"
                interaction-prompt="none"
                className={styles.carModel}
              />
            </div>
          </div>
        </div>
      </Container>

      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
        </div>
      </div>

      <Container as="section" style={{ display: "block", paddingTop: 56 }}>
        <div className={`${styles.trust} ${styles.reveal}`}>
          {trust.map((item) => (
            <div key={item.title} className={styles.trustItem}>
              <Icon name={item.icon} size={22} />
              <div style={{ display: "grid", gap: 4 }}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </Container>

      <Container as="section" id="sluzby" className={styles.section}>
        <div className={`${styles.sectionIntro} ${styles.reveal}`}>
          <Eyebrow>Co umíme</Eyebrow>
          <Heading level={2} size="section">
            Kompletní péče <em>bez cestování.</em>
          </Heading>
          <Text tone="muted" lead>
            Vše potřebné máme s sebou včetně vody a elektřiny. Stačí nám místo k zaparkování.
          </Text>
        </div>
        <div className={styles.revealLate}>
          <ServiceGrid className={styles.serviceGrid}>
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </ServiceGrid>
        </div>

        <section className={`${styles.locations} ${styles.reveal}`} aria-labelledby="lokality-nadpis">
          <div className={styles.locationsIntro}>
            <Eyebrow>Kde jezdíme</Eyebrow>
            <Heading level={2} size="card" id="lokality-nadpis">
              Mobilní čištění aut <em>ve vašem okolí.</em>
            </Heading>
            <Text tone="muted">
              Přijedeme na vaši adresu s vlastní vodou i elektřinou. Doprava do 30 km od Ostravy je bez příplatku.
            </Text>
          </div>
          <div className={styles.locationGrid}>
            <article className={styles.locationCard}>
              <h3>Čištění aut Ostrava</h3>
              <p>Mobilní čištění interiéru, tepování a ruční mytí auta přímo u vás doma nebo v práci v Ostravě.</p>
            </article>
            <article className={styles.locationCard}>
              <h3>Čištění aut Havířov</h3>
              <p>Za zákazníky v Havířově přijedeme kompletně vybaveni a vyčistíme interiér i exteriér vozu na místě.</p>
            </article>
            <article className={styles.locationCard}>
              <h3>Čištění aut Frýdek-Místek</h3>
              <p>Mobilní detailing ve Frýdku-Místku objednáte online. Termín s vámi následně potvrdíme telefonicky.</p>
            </article>
          </div>
        </section>
      </Container>

      <div id="postup" className={styles.stepsBand}>
        <Container as="section" className={styles.section}>
          <div className={styles.split}>
            <div className={`${styles.splitIntro} ${styles.reveal}`}>
              <Eyebrow>Jak to funguje</Eyebrow>
              <Heading level={2} size="section">
                Tři kroky <em>k čistému autu.</em>
              </Heading>
              <Text tone="muted">Rezervaci potvrdíme do několika hodin. Pokud bude třeba čas posunout, zavoláme a domluvíme se.</Text>
            </div>
            <div className={`${styles.steps} ${styles.revealLate}`}>
              {steps.map((step) => (
                <div key={step.index} className={styles.step}>
                  <span className={styles.stepIndex}>
                    <Icon name={step.icon} size={22} />
                    {step.index}
                  </span>
                  <div className={styles.stepBody}>
                    <strong>{step.title}</strong>
                    <span>{step.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      <div id="galerie" className={styles.darkBand}>
        <Container as="section" className={styles.section}>
          <div className={`${styles.sectionIntro} ${styles.reveal}`}>
            <Eyebrow tone="on-dark">Před a po</Eyebrow>
            <Heading level={2} size="section" style={{ color: "#fff" }}>
              Výsledky, které <em>vidíte hned.</em>
            </Heading>
            <Text tone="on-dark" lead>
              Přetáhněte dělicí čáru a porovnejte stav před čištěním a po něm.
            </Text>
          </div>
          <div className={`${styles.gallery} ${styles.revealLate}`}>
            {gallery.map((item) => (
              <BeforeAfterSlider key={item.title} {...item} />
            ))}
          </div>
        </Container>
      </div>

      <Container as="section" id="cenik" className={styles.section}>
        <div className={`${styles.sectionIntro} ${styles.reveal}`}>
          <Eyebrow>Ceník</Eyebrow>
          <Heading level={2} size="section">
            Vyberte péči pro <em>vaše auto.</em>
          </Heading>
          <Text tone="muted" lead>
            Ceny jsou konečné, doprava po Ostravě je v ceně. Pro interiér zvolte Basic, nebo Premium; exteriér můžete přidat k oběma.
          </Text>
        </div>
        <div className={`${styles.priceGrid} ${styles.revealLate}`}>
          {packages.map((item) => (
            <PriceCard
              key={item.id}
              featured={item.featured}
              name={item.name}
              price={item.price.replace(/^od\s+/i, "")}
              from={/^od\s/i.test(item.price)}
              showCurrency={item.showCurrency}
              items={item.items}
              ctaLabel="Rezervovat"
              ctaHref="#rezervace"
            />
          ))}
        </div>
      </Container>

      <div id="rezervace" className={styles.bookingBand}>
        <Container as="section" className={styles.section}>
          <div className={styles.bookingCta}>
            <div className={styles.bookingIntro} style={{ marginBottom: 0 }}>
              <Eyebrow tone="on-blue">Rezervace</Eyebrow>
              <Heading level={2} size="section" style={{ color: "#fff" }}>
                Vyberte si den a čas.
              </Heading>
              <Text tone="on-blue" lead>
                Vyberete den, čas začátku a služby. Automaticky vám vyhradíme 3 hodiny. Celé objednání zabere minutu.
              </Text>
            </div>
            <div className={styles.bookingCtaSide}>
              <Button variant="light" icon="arrow-up-right" onClick={() => setBookingOpen(true)}>
                Otevřít rezervaci
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <div className={styles.bookingModal} hidden={!bookingOpen} role="dialog" aria-modal="true" aria-label="Rezervace termínu">
        <div className={styles.bookingModalBackdrop} onClick={() => setBookingOpen(false)} />
        <div className={styles.bookingModalPanel}>
          <div className={styles.bookingModalHead}>
            <div>
              <Eyebrow tone="on-blue">Rezervace</Eyebrow>
              <Heading level={2} size="card" style={{ color: "#fff", marginTop: 6 }}>
                Vyberte si den a čas.
              </Heading>
            </div>
            <button type="button" className={styles.bookingModalClose} onClick={() => setBookingOpen(false)} aria-label="Zavřít rezervaci">
              <Icon name="close" size={18} stroke={2} />
            </button>
          </div>
          <div className={styles.bookingModalBody}>
            <BookingForm packages={packages} onToast={showToast} active={bookingOpen} />
          </div>
        </div>
      </div>

      <Container as="section" id="faq" className={styles.section}>
        <div className={styles.split}>
          <div className={`${styles.splitIntro} ${styles.reveal}`}>
            <Eyebrow>Časté dotazy</Eyebrow>
            <Heading level={2} size="section">
              Než <em>zarezervujete.</em>
            </Heading>
            <Text tone="muted">
              Nenašli jste odpověď? Zavolejte na{" "}
              <a href="tel:+420777011690" style={{ color: "#1769ff", textDecoration: "none" }}>
                +420 777 011 690
              </a>
              {" nebo "}
              <a href="tel:+420733477254" style={{ color: "#1769ff", textDecoration: "none" }}>
                +420 733 477 254
              </a>
              .
            </Text>
          </div>
          <Faq />
        </div>
      </Container>

      <Footer
        logo={<Image src="/images/home-detailing-logo.png" alt="Home Detailing" width={2073} height={758} sizes="220px" className={styles.footerLogo} />}
        tagline="Mobilní detailing · Ostrava, Havířov a okolí"
        note={
          <>
            © 2026 Home Detailing. Všechna práva vyhrazena. ·{" "}
            <Link href="/admin" className={styles.footerLink}>
              Administrace
            </Link>{" "}
            · <span className={styles.monoLabel} style={{ textTransform: "none" }}>version: {APP_VERSION}</span>
          </>
        }
      />

      {toast && (
        <div role="status" className={styles.toast}>
          <Icon name={toast.icon} size={16} stroke={2} />
          {toast.message}
        </div>
      )}
    </main>
  );
}
