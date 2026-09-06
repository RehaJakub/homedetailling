"use client";
import { useState } from "react";
import { Icon } from "@homedetailing/ui";
import styles from "@/app/landing.module.css";

export const FAQ: Array<[string, string]> = [
  ["Kolik místa potřebujete?", "Stačí parkovací místo a asi metr kolem auta. Vodu i elektřinu si přivezeme, nepotřebujeme od vás žádné přípojky."],
  ["Jak dlouho čištění trvá?", "Délka závisí na zvoleném balíčku, velikosti auta a míře znečištění. Konkrétní čas s vámi potvrdíme po přijetí rezervace."],
  ["Co když se termín nehodí vám nebo nám?", "Po přijetí rezervace se ozveme. Když bude třeba čas posunout, domluvíme se telefonicky a změnu uvidíte v potvrzení."],
  ["Jezdíte i mimo Ostravu?", "Ano, do 30 km od Ostravy bez příplatku. Dál po domluvě, cestu si účtujeme podle vzdálenosti."],
  ["Jak se platí?", "Až po dokončení a kontrole výsledku. Hotově nebo převodem podle faktury."],
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
