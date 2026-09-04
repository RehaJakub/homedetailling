"use client";
import Link from "next/link";
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
import { Wordmark } from "@/components/Wordmark";
import { BookingForm, type PricePackage } from "@/components/landing/BookingForm";
import { Faq } from "@/components/landing/Faq";
import styles from "./landing.module.css";

const navLinks = [
  { href: "#sluzby", label: "Služby" },
  { href: "#postup", label: "Postup" },
  { href: "#galerie", label: "Galerie" },
  { href: "#cenik", label: "Ceník" },
  { href: "#faq", label: "Dotazy" },
];

const services = [
  { number: "01", title: "Interiér", text: "Hloubkové vysátí, čištění plastů, kůže i vnitřních oken. Auto voní a vypadá jako nové." },
  { number: "02", title: "Exteriér", text: "Ruční mytí, dekontaminace laku, čištění kol a ochranný vosk na několik měsíců." },
  { number: "03", title: "Tepování", text: "Extrakční tepování sedaček, koberců a stropu. Odstraníme fleky, zápach i alergeny." },
];

const trust: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "shield", title: "Pojištění odpovědnosti", text: "Pracujeme pojištění do 2 mil. Kč." },
  { icon: "droplet", title: "Vlastní voda i elektřina", text: "Nepotřebujeme od vás nic než místo." },
  { icon: "wallet", title: "Platba po dokončení", text: "Hotově, kartou nebo převodem." },
  { icon: "phone", title: "Potvrzení do 3 hodin", text: "Zavoláme nebo napíšeme e-mail." },
];

const steps: Array<{ icon: IconName; index: string; title: string; text: string }> = [
  { icon: "calendar", index: "01", title: "Vyberete službu a čas", text: "V kalendáři kliknete na den, pak na začátek a konec úseku. Nejkratší krok je 15 minut." },
  { icon: "phone", index: "02", title: "Potvrdíme termín", text: "Ozveme se telefonicky nebo e-mailem. Případnou změnu času vidíte hned v potvrzení." },
  { icon: "sparkle", index: "03", title: "Přijedeme a vyčistíme", text: "Na místě u vás doma nebo v práci. Platba hotově, kartou nebo převodem po dokončení." },
];

const gallery = [
  { number: "01", title: "Sedačky", description: "Fleky a zašlá látka → Hloubkově vyčištěno", initialPosition: 45 },
  { number: "02", title: "Lak", description: "Matný a zaprášený → Lesk s ochranným voskem", initialPosition: 55 },
  { number: "03", title: "Kola", description: "Brzdový prach → Čisté disky i pneu", initialPosition: 50 },
];

// Shown until the pricing API answers; mirrors the seed content of the design.
const fallbackPackages: PricePackage[] = [
  { id: 1, name: "Exteriér", price: "Domluvou", showCurrency: false, featured: false, items: ["Ruční mytí karoserie", "Dekontaminace laku", "Čištění kol a pneu", "Ochranný vosk"] },
  { id: 2, name: "Interiér", price: "1 500", showCurrency: true, featured: true, items: ["Hloubkové vysátí", "Čištění plastů a kůže", "Vnitřní okna", "Odstranění zápachu"] },
  { id: 3, name: "Tepování", price: "od 500", showCurrency: true, featured: false, items: ["Tepování sedaček", "Tepování koberců", "Cena za kus"] },
];

const marqueeText = "Interiér · Exteriér · Tepování · Ostrava · Poruba · Havířov · Frýdek-Místek · Přijedeme k vám · Termín po 15 minutách ·";

export default function Home() {
  const [packages, setPackages] = useState<PricePackage[]>(fallbackPackages);
  const [toast, setToast] = useState<{ message: string; icon: IconName } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [nextFree, setNextFree] = useState("…");
  const [sent, setSent] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/v2/pricing")
      .then((response) => response.json())
      .then((data: { packages: PricePackage[] }) => {
        if (data.packages?.length) setPackages(data.packages);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const section = document.getElementById("rezervace");
      const inBooking = section !== null && y + window.innerHeight > section.offsetTop + 200 && y < section.offsetTop + section.offsetHeight;
      setScrolled(y > 600 && !inBooking);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      <SiteHeader logo={<Wordmark />} links={navLinks} cta={{ href: "#rezervace", label: "Rezervovat termín" }} />

      <Container as="section" id="uvod" style={{ display: "block" }}>
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.up} style={{ animationDuration: ".7s" }}>
              <Eyebrow>Mobilní detailing · Ostrava a okolí</Eyebrow>
            </div>
            <div className={styles.up} style={{ animationDelay: ".1s" }}>
              <Heading level={1} size="display">
                Čisté auto <em>u vás doma.</em>
              </Heading>
            </div>
            <div className={styles.up} style={{ animationDelay: ".2s" }}>
              <Text tone="muted" lead>
                Přijedeme k vám, vyčistíme interiér i exteriér a vy mezitím děláte, co potřebujete. Termín si vyberete v kalendáři na minutu přesně.
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
                  ["clock", "4 h", "Průměrná návštěva"],
                  ["calendar", "15 min", "Krok rezervace"],
                  ["home", "0 km", "Vaše cesta k nám"],
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
                shadow-intensity="1.4"
                shadow-softness="0.75"
                exposure="1.25"
                environment-image="neutral"
                camera-orbit="35deg 74deg auto"
                field-of-view="24deg"
                interaction-prompt="none"
                className={styles.carModel}
              />
            </div>
            <div className={styles.floatDark}>
              <span>Nejbližší volný termín</span>
              <strong>{nextFree}</strong>
            </div>
            <div className={styles.floatBlue}>
              <strong>120+</strong>
              <span>vyčištěných aut</span>
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
          <ServiceGrid>
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </ServiceGrid>
        </div>
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
          <div className={`${styles.threeCols} ${styles.revealLate}`}>
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
            Ceny jsou konečné, doprava po Ostravě je v ceně. Balíčky lze kombinovat.
          </Text>
        </div>
        <div className={`${styles.threeCols} ${styles.revealLate}`}>
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
          <div className={styles.bookingIntro}>
            <Eyebrow tone="on-blue">Rezervace</Eyebrow>
            <Heading level={2} size="section" style={{ color: "#fff" }}>
              Vyberte si den a čas.
            </Heading>
            <Text tone="on-blue" lead>
              Klikněte na den, potom na začátek a konec úseku. Obsazené časy jsou přeškrtnuté.
            </Text>
          </div>
          <BookingForm packages={packages} onToast={showToast} onNextFree={setNextFree} onSentChange={setSent} />
        </Container>
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
              <a href="tel:+420777000111" style={{ color: "#1769ff", textDecoration: "none" }}>
                +420 777 000 111
              </a>
              .
            </Text>
          </div>
          <Faq />
        </div>
      </Container>

      <Footer logo={<Wordmark size={20} />} tagline="Mobilní detailing · Ostrava a okolí" note="© 2026 Home Detailing. Všechna práva vyhrazena." />

      <Link href="/admin" className="admin-corner-link">
        Admin panel
      </Link>

      {scrolled && !sent && (
        <a href="#rezervace" className={styles.floatingCta}>
          <span className={styles.pulse} />
          <span className={styles.floatingCtaText}>
            <span>Nejbližší volný termín</span>
            <strong>{nextFree}</strong>
          </span>
          <Icon name="arrow-up-right" size={16} stroke={2} />
        </a>
      )}

      {toast && (
        <div role="status" className={styles.toast}>
          <Icon name={toast.icon} size={16} stroke={2} />
          {toast.message}
        </div>
      )}
    </main>
  );
}
