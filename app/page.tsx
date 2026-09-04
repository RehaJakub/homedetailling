"use client";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
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
  {
    title: "Sedadla",
    description: "Fleky a zašlá látka → Hloubkově vyčištěno",
    type: "seat",
  },
  {
    title: "Karoserie",
    description: "Silniční nečistoty → Lesk bez šmouh",
    type: "body",
  },
  {
    title: "Kufr",
    description: "Prach a drobky → Čistý každý detail",
    type: "trunk",
  },
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

function BeforeAfter({
  title,
  description,
  type,
  index,
}: {
  title: string;
  description: string;
  type: string;
  index: number;
}) {
  const [position, setPosition] = useState(50);

  return (
    <article className="comparison">
      <div className={`comparison-image ${type}`}>
        <div className="after">
          <span>PO</span>
        </div>

        <div
          className="before"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <span>PŘED</span>
        </div>

        <div className="comparison-line" style={{ left: `${position}%` }}>
          <b>↔</b>
        </div>

        <input
          type="range"
          min="5"
          max="95"
          value={position}
          aria-label={`Porovnání před a po – ${title}`}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
      </div>

      <div className="comparison-text">
        <h3>
          <span>0{index + 1}</span> {title}
        </h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [reservationState, setReservationState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [selectedService, setSelectedService] = useState("");
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);
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
      setServiceMenuOpen(true);
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
      <header className="header container">
        <a href="#uvod" className="logo" aria-label="Home Detailing">
  <Image
    src="/home-detailing-logo.png"
    alt="Home Detailing"
    width={240}
    height={90}
    priority
    className="logo-image"
  />
</a>

        <button className="menu-button" onClick={() => setMenu(!menu)}>
          ☰
        </button>

        <nav className={menu ? "navigation open" : "navigation"}>
          <a href="#sluzby">Služby</a>
          <a href="#galerie">Galerie</a>
          <a href="#cenik">Ceník</a>
          <a href="#kontakt" className="nav-button">
            Objednat termín ↗
          </a>
        </nav>
      </header>

      <section className="hero container" id="uvod">
        <div className="hero-content">
          <span className="label">MOBILNÍ DETAILING · OSTRAVA A OKOLÍ</span>

          <h1>
            Čisté auto.
            <br />
            <em>Bez cesty</em> do myčky.
          </h1>

          <p>
            Přijedeme za vámi domů nebo do práce a postaráme se o interiér
            i exteriér vašeho auta v Ostravě a okolí.
          </p>

          <div className="buttons">
            <a href="#kontakt" className="primary-button">
              Chci čisté auto ↗
            </a>
            <a href="#cenik" className="price-link">
              Zobrazit ceník ↓
            </a>
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
      </section>

      <section className="services container" id="sluzby">
        <div className="section-heading">
          <span className="label">CO UMÍME</span>
          <h2>
            Kompletní péče.
            <br />
            Přímo <em>u vás.</em>
          </h2>
          <p>
            Profesionální výsledek bez čekání a bez ztraceného času.
          </p>
        </div>

        <div className="service-grid">
          {services.map((service) => (
            <article key={service.title}>
              <span>{service.number}</span>
              <div className="service-icon">✦</div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery-section" id="galerie">
        <div className="container">
          <div className="gallery-heading">
            <span className="label">VÝSLEDEK MLUVÍ ZA NÁS</span>

            <h2>
              Rozdíl, který <em>uvidíte.</em>
            </h2>

            <p>
              Posuňte jezdec a podívejte se, co dokáže poctivý detailing.
            </p>
          </div>

          <div className="gallery-grid">
            {gallery.map((item, index) => (
              <BeforeAfter {...item} index={index} key={item.title} />
            ))}
          </div>

          <div className="slider-help">
            ← POSUŇTE JEZDEC A POROVNEJTE →
          </div>
        </div>
      </section>

      <section className="pricing container" id="cenik">
  <div className="section-heading pricing-heading">
    <h2>
      Vyberte péči pro <em>vaše auto.</em>
    </h2>
  </div>

        <div className="pricing-grid">
          {pricePackages.map((item, index) => (
            <Price
              key={item.id}
              featured={index === 1}
              name={item.name}
              price={item.price}
              showCurrency={item.showCurrency}
              items={item.items}
            />
          ))}
        </div>
      </section>

      <section className="contact" id="kontakt">
        <div className="container contact-content">
          <div>
            <span className="label">AUTO, KTERÉ DĚLÁ RADOST</span>
            <h2>
              Vy si dejte kávu.
              <br />
              My přijedeme.
            </h2>
          </div>

          <div className="reservation-column">
            <p>
              Vyplňte rezervaci. Ozveme se vám s potvrzením termínu a cenou.
            </p>
            <form className="reservation-form" onSubmit={createReservation}>
              <input
                name="name"
                placeholder="Jméno a příjmení"
                pattern="\S+(?:\s+\S+)+"
                title="Zadejte jméno i příjmení."
                autoComplete="name"
                required
              />
              <input
                name="phone"
                type="tel"
                placeholder="Telefon"
                minLength={9}
                autoComplete="tel"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="E-mail"
                autoComplete="email"
                required
              />
              <div className="service-dropdown">
                <input type="hidden" name="service" value={selectedService} />
                <button
                  type="button"
                  className="service-dropdown-trigger"
                  aria-expanded={serviceMenuOpen}
                  aria-controls="service-options"
                  onClick={() => setServiceMenuOpen((open) => !open)}
                >
                  <span>
                    {selectedService || "Vyberte službu"}
                    {selectedService && (
                      <small>
                        {pricePackages.find((item) => item.name === selectedService)?.price}
                      </small>
                    )}
                  </span>
                  <b aria-hidden="true">⌄</b>
                </button>

                {serviceMenuOpen && (
                  <div className="service-dropdown-menu" id="service-options" role="listbox">
                    {pricePackages.map((service) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedService === service.name}
                        key={service.id}
                        onClick={() => {
                          setSelectedService(service.name);
                          setServiceMenuOpen(false);
                          setReservationState("idle");
                        }}
                      >
                        <span>{service.name}</span>
                        <strong>{service.price}{service.showCurrency ? " Kč" : ""}</strong>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                className="full-width"
                name="address"
                placeholder="Přesná adresa (ulice, číslo, město)"
                autoComplete="street-address"
                required
              />
              <textarea name="note" placeholder="Poznámka (nepovinná)" />
              <button type="submit" disabled={reservationState === "saving"}>
                {reservationState === "saving" ? "Ukládám…" : "Odeslat rezervaci ↗"}
              </button>
              {reservationState === "error" && (
                <span className="reservation-message error">Rezervaci se nepodařilo uložit. Zkuste to znovu.</span>
              )}
            </form>
          </div>
        </div>
      </section>

      <footer className="footer container">
        <a href="#uvod" className="footer-logo" aria-label="Home Detailing">
  <Image
    src="/home-detailing-logo.png"
    alt="Home Detailing"
    width={260}
    height={100}
    className="footer-logo-image"
  />
</a>

        <p>Mobilní detailing · Ostrava a okolí</p>
        <small>© 2026 Home Detailing</small>
      </footer>

      <Link href="/admin" className="admin-corner-link">
        Admin panel
      </Link>

      {reservationState === "saved" && (
        <div className="reservation-modal-backdrop" role="presentation">
          <section
            className="reservation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-success-title"
          >
            <span className="label">REZERVACE ODESLÁNA</span>
            <h2 id="reservation-success-title">Děkujeme za rezervaci.</h2>
            <p>Budeme vás kontaktovat ohledně domluvy termínu.</p>
            <button type="button" onClick={() => setReservationState("idle")}>
              Rozumím
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

function Price({
  name,
  price,
  items,
  featured = false,
  from = false,
  showCurrency = true,
}: {
  name: string;
  price: string;
  items: string[];
  featured?: boolean;
  from?: boolean;
  showCurrency?: boolean;
}) {
  return (
    <article className={featured ? "price-card featured" : "price-card"}>
      {featured && <span className="popular">NEJOBLÍBENĚJŠÍ</span>}
      <small>BALÍČEK</small>
      <h3>{name}</h3>

      <div className="price">
        {from && "od "}<b>{price}</b>{showCurrency && " Kč"}
      </div>

      <ul>
        {items.map((item) => (
          <li key={item}>✓ {item}</li>
        ))}
      </ul>

      <a href="#kontakt">Objednat ↗</a>
    </article>
  );
}
