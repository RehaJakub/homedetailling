"use client";
import { useState } from "react";
import { Icon } from "@homedetailing/ui";
import styles from "@/app/landing.module.css";

export const FAQ: Array<[string, string]> = [
  ["Kolik místa potřebujete?", "Stačí parkovací místo a asi metr kolem auta. Vodu i elektřinu si přivezeme, nepotřebujeme od vás žádné přípojky."],
  ["Jak dlouho čištění trvá?", "Interiér 2–3 hodiny, exteriér 2–4 hodiny, tepování podle počtu kusů. V kalendáři vybíráte úsek po 30 minutách, takže víte přesně, kdy budeme hotovi."],
  ["Co když se termín nehodí vám nebo nám?", "Po přijetí rezervace se ozveme. Když bude třeba čas posunout, domluvíme se telefonicky a změnu uvidíte v potvrzení."],
  ["Jezdíte i mimo Ostravu?", "Ano, do 30 km od Ostravy bez příplatku. Dál po domluvě, cestu si účtujeme podle vzdálenosti."],
  ["Jak se platí?", "Až po dokončení a kontrole výsledku. Hotově, kartou přes terminál nebo převodem podle faktury."],
];

/** Accordion: at most one question open, the first one open by default. */
export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className={`${styles.faq} ${styles.revealLate}`}>
      {FAQ.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div key={q} className={styles.faqItem}>
            <button type="button" className={styles.faqQuestion} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
              <strong>{q}</strong>
              <Icon name={isOpen ? "minus" : "plus"} size={18} />
            </button>
            {isOpen && <p className={styles.faqAnswer}>{a}</p>}
          </div>
        );
      })}
    </div>
  );
}
