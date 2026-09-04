"use client";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  BeforeAfterSlider,
  Button,
  Container,
  Dialog,
  Eyebrow,
  Footer,
  Heading,
  Input,
  Notice,
  PriceCard,
  ServiceCard,
  ServiceDropdown,
  ServiceGrid,
  SiteHeader,
  Text,
  Textarea,
} from "@homedetailing/ui";

const services = [
  {
    number: "01",
    title: "Interiér",
    text: "Vysátí, tepování, čištění plastů, oken a kompletní péče o kabinu.",
  },
  {
    number: "02",
    title: "Exteriér",
    text: "Šetrné ruční mytí, kola, sušení a ochrana laku přímo u vás.",
  },
  {
    number: "03",
    title: "Přijedeme za vámi",
    text: "Přijedeme domů nebo do práce v Ostravě a okolí.",
  },
];

const gallery = [
  { title: "Sedadla", description: "Fleky a zašlá látka → Hloubkově vyčištěno" },
  { title: "Karoserie", description: "Silniční nečistoty → Lesk bez šmouh" },
  { title: "Kufr", description: "Prach a drobky → Čistý každý detail" },
];

type PricePackage = {
  id: number;
  name: string;
  price: string;
  showCurrency: boolean;
  items: string[];
};

const initialPricePackages: PricePackage[] = [
  { id: 1, name: "Exteriér", price: "Domluvou", showCurrency: false, items: ["Čištění kol", "Umytí rukavicí", "Voskování", "Čištění vnějších skel"] },
  { id: 2, name: "Interiér", price: "1 500", showCurrency: true, items: ["Koberce látkové a gumové", "Plasty", "Vysávání", "Vnitřní okna", "Čištění kůže a impregnace", "Stropnice po domluvě"] },
  { id: 3, name: "Tepování", price: "500", showCurrency: true, items: ["Tepování koberců po domluvě", "Tepování sedaček"] },
];

const navLinks = [
  { href: "#sluzby", label: "Služby" },
  { href: "#galerie", label: "Galerie" },
  { href: "#cenik", label: "Ceník" },
];

export default function Home() {
  const [reservationState, setReservationState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [selectedService, setSelectedService] = useState("");
  const [pricePackages, setPricePackages] = useState(initialPricePackages);

  useEffect(() => {
    fetch("/api/v2/pricing")
      .then((response) => response.json())
      .then((data: { packages: PricePackage[] }) => setPricePackages(data.packages))
      .catch(() => undefined);
  }, []);

  async function createReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReservationState("saving");

    const form = event.currentTarget;
    if (!selectedService) {
      setReservationState("error");
      return;
    }

    const response = await fetch("/api/v2/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });

    if (response.ok) {
      form.reset();
      setSelectedService("");
      setReservationState("saved");
    } else {
      setReservationState("error");
    }
  }

  return (
    <main>
      <SiteHeader
        logo={
          <Image src="/home-detailing-logo.png" alt="Home Detailing" width={240} height={90} priority />
        }
        links={navLinks}
        cta={{ href: "#kontakt", label: "Objednat termín" }}
      />

      <Container as="section" className="hero" id="uvod">
        <div>
          <Eyebrow>Mobilní detailing · Ostrava a okolí</Eyebrow>

          <Heading level={1} size="display">
            Čisté auto.
            <br />
            <em>Bez cesty</em> do myčky.
          </Heading>

          <Text tone="muted" lead>
            Přijedeme za vámi domů nebo do práce a postaráme se o interiér i exteriér vašeho auta v Ostravě a okolí.
          </Text>

          <div className="buttons">
            <Button href="#kontakt" variant="primary" icon="arrow-up-right">
              Chci čisté auto
            </Button>
            <Button href="#cenik" variant="dark" icon="arrow-down">
              Zobrazit ceník
            </Button>
          </div>
        </div>

        <div className="hero-visual">
          <model-viewer
            src="/models/car.glb"
            alt="3D model automobilu"
            auto-rotate
            rotation-per-second="18deg"
            disable-zoom
            shadow-intensity="1"
            exposure="1"
            camera-orbit="35deg 72deg auto"
            field-of-view="30deg"
            interaction-prompt="none"
            className="car-model"
          />
        </div>
      </Container>

      <Container as="section" className="services" id="sluzby">
        <div className="section-heading">
          <Eyebrow>Co umíme</Eyebrow>
          <Heading level={2} size="section">
            Kompletní péče.
            <br />
            Přímo <em>u vás.</em>
          </Heading>
          <Text tone="muted" lead>
            Profesionální výsledek bez čekání a bez ztraceného času.
          </Text>
        </div>

        <ServiceGrid>
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </ServiceGrid>
      </Container>

      <section className="gallery-section" id="galerie">
        <Container>
          <div className="section-heading">
            <Eyebrow>Výsledek mluví za nás</Eyebrow>
            <Heading level={2} size="section">
              Rozdíl, který <em>uvidíte.</em>
            </Heading>
            <Text tone="on-dark" lead>
              Posuňte jezdec a podívejte se, co dokáže poctivý detailing.
            </Text>
          </div>

          <div className="gallery-grid">
            {gallery.map((item, index) => (
              <BeforeAfterSlider key={item.title} number={`0${index + 1}`} {...item} />
            ))}
          </div>

          <div className="slider-help">← POSUŇTE JEZDEC A POROVNEJTE →</div>
        </Container>
      </section>

      <Container as="section" className="pricing" id="cenik">
        <div className="section-heading pricing-heading">
          <Heading level={2} size="section">
            Vyberte péči pro <em>vaše auto.</em>
          </Heading>
        </div>

        <div className="pricing-grid">
          {pricePackages.map((item, index) => (
            <PriceCard
              key={item.id}
              featured={index === 1}
              name={item.name}
              price={item.price}
              showCurrency={item.showCurrency}
              items={item.items}
            />
          ))}
        </div>
      </Container>

      <section className="contact" id="kontakt">
        <Container className="contact-content">
          <div>
            <Eyebrow tone="on-blue">Auto, které dělá radost</Eyebrow>
            <Heading level={2} size="section">
              Vy si dejte kávu.
              <br />
              My přijedeme.
            </Heading>
          </div>

          <div>
            <Text tone="on-blue" size="sm" className="reservation-intro">
              Vyplňte rezervaci. Ozveme se vám s potvrzením termínu a cenou.
            </Text>
            <form className="reservation-form" onSubmit={createReservation}>
              <Input
                tone="on-blue"
                name="name"
                placeholder="Jméno a příjmení"
                pattern="\S+(?:\s+\S+)+"
                title="Zadejte jméno i příjmení."
                autoComplete="name"
                required
              />
              <Input tone="on-blue" name="phone" type="tel" placeholder="Telefon" minLength={9} autoComplete="tel" required />
              <Input tone="on-blue" name="email" type="email" placeholder="E-mail" autoComplete="email" required />
              <ServiceDropdown
                options={pricePackages}
                value={selectedService}
                onChange={(name) => {
                  setSelectedService(name);
                  setReservationState("idle");
                }}
              />
              <Input
                tone="on-blue"
                className="full-width"
                name="address"
                placeholder="Přesná adresa (ulice, číslo, město)"
                autoComplete="street-address"
                required
              />
              <Textarea tone="on-blue" name="note" placeholder="Poznámka (nepovinná)" />
              <Button type="submit" variant="light" fullWidth icon="arrow-up-right" disabled={reservationState === "saving"}>
                {reservationState === "saving" ? "Ukládám…" : "Odeslat rezervaci"}
              </Button>
              {reservationState === "error" && (
                <Notice tone="on-blue">
                  {selectedService ? "Rezervaci se nepodařilo uložit. Zkuste to znovu." : "Vyberte prosím službu."}
                </Notice>
              )}
            </form>
          </div>
        </Container>
      </section>

      <Footer
        logo={<Image src="/home-detailing-logo.png" alt="Home Detailing" width={260} height={100} />}
        tagline="Mobilní detailing · Ostrava a okolí"
        note="© 2026 Home Detailing"
      />

      <Link href="/admin" className="admin-corner-link">
        Admin panel
      </Link>

      <Dialog
        open={reservationState === "saved"}
        eyebrow="Rezervace odeslána"
        title="Děkujeme za rezervaci."
        actions={
          <Button type="button" variant="primary" fullWidth onClick={() => setReservationState("idle")}>
            Rozumím
          </Button>
        }
      >
        Budeme vás kontaktovat ohledně domluvy termínu.
      </Dialog>
    </main>
  );
}
