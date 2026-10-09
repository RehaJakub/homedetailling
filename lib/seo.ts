import type { Metadata } from "next";

export const SITE_URL = "https://homedetailing.cz";
export const BUSINESS_ID = `${SITE_URL}/#business`;
export const OG_IMAGE = {
  url: `${SITE_URL}/images/home-detailing-logo.png`,
  width: 2073,
  height: 758,
  alt: "Home Detailing – mobilní čištění aut",
};

export const SERVICE_AREAS = ["Ostrava", "Havířov", "Frýdek-Místek"] as const;

export const CITY_PAGES = [
  {
    slug: "cisteni-aut-ostrava",
    city: "Ostrava",
    title: "Čištění aut Ostrava | Home Detailing",
    description: "Čištění aut v Ostravě přímo u vás doma nebo v práci. Přivezeme si vodu i elektřinu. Vyberte si online termín mobilního detailingu.",
    eyebrow: "Mobilní detailing · Ostrava",
    heading: "Čištění aut Ostrava",
    headingAccent: "přímo u vás.",
    lead: "Přijedeme na vaši adresu v Ostravě s vlastní vodou a elektřinou. Vyčistíme interiér i exteriér vozu doma nebo v práci.",
    sectionHeading: "Mobilní péče po celé Ostravě.",
    sectionText: "Auto nemusíte nikam převážet. Stačí místo k zaparkování a vše potřebné k čištění přivezeme s sebou. Doprava do 30 km od Ostravy je bez příplatku.",
    image: "/images/interier-po.jpeg",
    imageAlt: "Vyčištěný interiér automobilu po mobilním detailingu v Ostravě",
  },
  {
    slug: "cisteni-aut-havirov",
    city: "Havířov",
    title: "Čištění aut Havířov | Home Detailing",
    description: "Mobilní čištění aut v Havířově. Přijedeme kompletně vybaveni a vyčistíme interiér i exteriér přímo na místě. Rezervujte online.",
    eyebrow: "Mobilní detailing · Havířov",
    heading: "Čištění aut Havířov",
    headingAccent: "na vaší adrese.",
    lead: "Za zákazníky v Havířově přijedeme kompletně vybaveni. Interiér i exteriér vozu vyčistíme přímo na místě.",
    sectionHeading: "Interiér i exteriér v Havířově.",
    sectionText: "Přivezeme si vlastní vodu i elektřinu, takže od vás potřebujeme jen místo k zaparkování. Po odeslání rezervace termín telefonicky potvrdíme.",
    image: "/images/stredpanel-v2-po.jpeg",
    imageAlt: "Vyčištěný středový panel automobilu po detailingu v Havířově",
  },
  {
    slug: "cisteni-aut-frydek-mistek",
    city: "Frýdek-Místek",
    title: "Čištění aut Frýdek-Místek | Home Detailing",
    description: "Mobilní čištění aut ve Frýdku-Místku. Vyberte službu a termín online, přijedeme s vlastní vodou i elektřinou a vše potvrdíme telefonicky.",
    eyebrow: "Mobilní detailing · Frýdek-Místek",
    heading: "Čištění aut Frýdek-Místek",
    headingAccent: "s rezervací online.",
    lead: "Mobilní detailing ve Frýdku-Místku objednáte online. Vybraný termín s vámi následně potvrdíme telefonicky.",
    sectionHeading: "Termín vyberete online.",
    sectionText: "Zvolíte den, začátek a požadované služby. Pro rezervaci vyhradíme tři hodiny a na místo přijedeme s vlastní vodou i elektřinou.",
    image: "/images/interier-koberce-po.jpeg",
    imageAlt: "Vyčištěné koberce a zadní část interiéru auta ve Frýdku-Místku",
  },
] as const;

export type CityPage = (typeof CITY_PAGES)[number];

export function pageMetadata(page: CityPage): Metadata {
  const canonical = `${SITE_URL}/${page.slug}`;
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "cs_CZ",
      url: canonical,
      siteName: "Home Detailing",
      title: page.title,
      description: page.description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [OG_IMAGE.url],
    },
  };
}

const areaServed = SERVICE_AREAS.map((name) => ({ "@type": "City", name }));

const business = {
  "@type": "AutoWash",
  "@id": BUSINESS_ID,
  name: "Home Detailing",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/images/home-detailing-logo.png`,
  image: [
    `${SITE_URL}/images/interier-po.jpeg`,
    `${SITE_URL}/images/stredpanel-v2-po.jpeg`,
    `${SITE_URL}/images/dvere-po.jpeg`,
  ],
  description: "Mobilní čištění interiéru a exteriéru aut v Ostravě, Havířově, Frýdku-Místku a okolí.",
  telephone: "+420777011690",
  contactPoint: [
    { "@type": "ContactPoint", telephone: "+420777011690", contactType: "rezervace", availableLanguage: "cs" },
    { "@type": "ContactPoint", telephone: "+420733477254", contactType: "rezervace", availableLanguage: "cs" },
  ],
  areaServed: [...areaServed, { "@type": "AdministrativeArea", name: "okolí Ostravy do 30 km" }],
  paymentAccepted: "Hotově nebo bankovním převodem",
  potentialAction: {
    "@type": "ReserveAction",
    target: `${SITE_URL}/#rezervace`,
    result: { "@type": "Reservation", name: "Rezervace mobilního čištění auta" },
  },
};

const interiorService = {
  "@type": "Service",
  "@id": `${SITE_URL}/#service-interier`,
  name: "Mobilní čištění interiéru auta",
  serviceType: "Čištění interiéru a tepování auta",
  description: "Vysávání, čištění plastů, kůže, textilu, oken a koberců, impregnace a tepování sedaček a koberců.",
  provider: { "@id": BUSINESS_ID },
  areaServed,
  offers: {
    "@type": "Offer",
    price: "1500",
    priceCurrency: "CZK",
    url: `${SITE_URL}/#cenik`,
  },
};

const exteriorService = {
  "@type": "Service",
  "@id": `${SITE_URL}/#service-exterier`,
  name: "Mobilní ruční mytí exteriéru auta",
  serviceType: "Ruční mytí a čištění exteriéru auta",
  description: "Ruční mytí karoserie, čištění kol a pneumatik a ochranný vosk na několik týdnů.",
  provider: { "@id": BUSINESS_ID },
  areaServed,
};

export function homeJsonLd(faq: ReadonlyArray<readonly [string, string]>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: "Home Detailing",
        inLanguage: "cs-CZ",
        publisher: { "@id": BUSINESS_ID },
      },
      business,
      interiorService,
      exteriorService,
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq-schema`,
        mainEntity: faq.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
}

export function cityJsonLd(page: CityPage): Record<string, unknown> {
  const url = `${SITE_URL}/${page.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      business,
      interiorService,
      exteriorService,
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "cs-CZ",
        about: { "@id": BUSINESS_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home Detailing", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: page.heading, item: url },
        ],
      },
    ],
  };
}
