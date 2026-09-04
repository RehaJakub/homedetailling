# Handoff: Home Detailing – web, rezervace, administrace

## Overview
Tři obrazovky pro mobilní car‑detailing Home Detailing (Ostrava): veřejná landing page s rezervačním kalendářem, přihlášení do administrace a administrace s týdenním kalendářem, objednávkami, zákazníky, ceníkem a nastavením. Veškerý text je česky, identifikátory anglicky.

## About the Design Files
Soubory `templates/**/*.dc.html` jsou **designové reference v HTML** (prototypy s funkční logikou), ne produkční kód ke zkopírování. Úkolem je **znovu implementovat tyto obrazovky v existujícím kódu Home Detailing** (React, `@homedetailing/ui`) s jeho konvencemi. Každý `.dc.html` má dvě části: HTML šablonu (markup s inline styly a `{{ }}` proměnnými) a `class Component` (stav, výpočty, handlery) – logiku přepište 1:1 do React komponent.

Komponenty se v prototypu volají jako `<x-import component-from-global-scope="HomeDetailingUI.Button" …>` = `<Button …>` z `@homedetailing/ui`. Props jsou v kebab‑case (`full-width` → `fullWidth`). Vše, co není komponenta DS, je plain HTML s inline styly – převeďte na styled komponenty / CSS moduly dle projektu.

## Fidelity
**High‑fidelity.** Barvy, typografie, rozměry i chování jsou finální. Používejte výhradně tokeny a komponenty `@homedetailing/ui` (viz `DESIGN_SYSTEM.md`): brand blue `#1769ff`, ink `#080b12`, ostré rohy (žádný border‑radius), Geist / Geist Mono.

## Screens / Views

### 1. Landing page (`templates/landing/Landing.dc.html`)
Pořadí sekcí (každá `Container as="section"`, padding 120px nahoře i dole):
1. **SiteHeader** – logo (HOME / DETAILING mono modře), odkazy Služby, Postup, Galerie, Ceník, CTA „Rezervovat termín“ → `#rezervace`.
2. **Hero `#uvod`** – grid 1.05fr / 0.95fr, gap 56, padding 96/110. Vlevo Eyebrow, `Heading level=1 size="display"` („Čisté auto *u vás doma.*“), lead text, tlačítka primary „Rezervovat termín“ (arrow‑up‑right) + dark „Jak to funguje“ (arrow‑down → `#postup`), tři metriky (28px bold + mono 11px uppercase label). Vpravo obrázkový placeholder 4:5 (nahradit fotkou), plovoucí černý štítek „Nejbližší volný termín“ (dynamicky vypočtený první volný slot) a modrý štítek „120+ vyčištěných aut“.
3. **Marquee** – černý pruh, mono 12px uppercase, letter‑spacing .18em, nekonečný posun.
4. **Služby `#sluzby`** – ServiceGrid + 3× ServiceCard (Interiér, Exteriér, Tepování).
5. **Postup `#postup`** – pozadí `#f5f7fa`, grid .8fr/1.2fr, tři kroky (mono index 01–03 modře, 20px title, šedý popis), oddělené hairline `#e1e5eb`.
6. **Galerie `#galerie`** – pozadí `#080b12`, 3× BeforeAfterSlider.
7. **Ceník `#cenik`** – 3× PriceCard (Exteriér „Domluvou“, Interiér 1 500 featured, Tepování od 500), CTA → `#rezervace`.
8. **Rezervace `#rezervace`** – modrý pás `#1769ff`, formulář grid 1.15fr/0.85fr, gap 48 (detail níže).
9. **Footer**, **Dialog** „Děkujeme, termín je zarezervován.“ po odeslání.

#### Rezervační kalendář (levý sloupec)
- **01 · Den**: hlavička měsíc + tlačítka ‹ › (36×36, border `rgba(255,255,255,.35)`), řádek Po–Ne (mono 11px), buňky dne 46px vysoké, border `rgba(255,255,255,.22)`, mono 13px. Stavy: minulý/zavřený/plný den opacity .3 (zavřený den přeškrtnutý), dnes border `rgba(255,255,255,.7)` bold, vybraný bílé pozadí + modrý text. Zpět před aktuální měsíc nelze.
- **02 · Čas od – do**: grid 8 sloupců × 6 řad = 48 slotů po 15 min (7:00–18:45), padding 10px 0, mono 12px. Obsazený slot opacity .3, přeškrtnutý, disabled. Vybraný rozsah bílé pozadí + modrý text; při hoveru mezi zvoleným začátkem a kurzorem náhled `rgba(255,255,255,.28)`. Neděle = zavřeno (hláška v přerušovaném rámečku).
- **Souhrn**: box `rgba(255,255,255,.12)` + border `.25`, text „Út 8. 9. · 9:00 – 11:30“ a délka „2 h 30 min“.

#### Pravý sloupec (03 · Služba a kontakt)
ServiceDropdown (on‑blue), Input on‑blue: Jméno, Telefon (2 sloupce), E‑mail, Adresa, Textarea Poznámka (3 řádky), Notice on‑blue pro chyby, řádek Cena (vypočtená z balíčku), `Button variant="light" fullWidth icon="arrow-up-right"` „Odeslat rezervaci“, GDPR věta 12px.

### 2. Přihlášení (`templates/admin-login/AdminLogin.dc.html`)
Pozadí `#080b12`, vycentrované logo + `Card variant="panel"` (max 400px) jako `<form>`: Heading „Přihlášení“, Field stacked E‑mail, Field stacked Heslo, Notice error při chybě, Button primary fullWidth „Přihlásit se“. Po úspěchu redirect do administrace.

### 3. Administrace (`templates/admin/Admin.dc.html`)
Pozadí `#080b12`, horní lišta (logo, datum mono, odkazy Web / Odhlásit), `Card variant="panel"`, grid 224px / 1fr, gap 40. Vlevo sticky: Eyebrow „Administrace“, Heading, vertikální **Tabs** s počty (Kalendář = počet překryvů, Objednávky = počet nových), tlačítko primary „Nová objednávka“.

Záložky:
- **Přehled** – 4 klikací stat dlaždice (border `#e1e5eb`, mono label, 32px číslo, 12px popis): Čeká na potvrzení, Dnes, Tento týden, Překryvy. Pod nimi dva seznamy: „Dnes“ (čas mono 12px, jméno, služba · adresa, Button ghost sm Otevřít) a „Čeká na potvrzení“ (Badge count, tlačítka Upravit / Potvrdit, červený text „Překrývá se s jinou zakázkou“).
- **Kalendář** – toolbar ‹ Dnes › + rozsah týdne, legenda (Potvrzeno plná modrá, Čeká přerušovaný modrý rámeček na `#dce8ff`, Hotovo `#e1e5eb`, Překryv červený levý proužek). Grid 56px + 7 sloupců, hlavička dne (dow mono, číslo 18px, počet zakázek; dnes `#dce8ff` modrý text; nepracovní den šrafování). Tělo: 1 slot 15 min = 13px, hodinové linky `#edf0f4`, popisky hodin vlevo. Události absolutně pozicované: `top=(start-open)*13px`, `height=(end-start)*13px-2`, **překrývající se zakázky se řadí do sloupců vedle sebe** (šířka 100%/počet sloupců v clusteru), kolize `box-shadow: inset 3px 0 0 #b42318`. Červená linka „teď“ v dnešním sloupci. Klik na událost → modal Objednávka.
- **Objednávky** – horizontální Tabs filtr (Nové / Potvrzené / Hotové / Vše s počty), search Input (260px), DataTable: Klient (jméno + tel odkaz), Termín (datum + mono čas · délka), Služba, Adresa, Stav (Badge solid pro potvrzeno, soft jinak + „Překryv“ červeně), Akce (Upravit ghost sm, Potvrdit / Hotovo primary sm, Smazat outline‑danger sm).
- **Zákazníci** – seskupení podle e‑mailu, DataTable: Zákazník, Kontakt, Zakázek (Badge count), Poslední termín, Akce (Detail → modal s historií, Nová zakázka → předvyplněný modal).
- **Ceník** – grid 2 sloupce, karty balíčků (kicker mono, název + cena 22px modře, položky · oddělené, Badge corner u featured, Button Upravit) + přerušovaná karta „+ Přidat balíček“.
- **Nastavení** – Card „Provozní doba“ (Select od/do po hodinách, toggle dnů Po–Ne 44×40, Select Krok rezervace 15/30/60, Přejezd mezi zakázkami), Card „Uživatelé“ (seznam, Badge role, Odebrat, „Přidat uživatele“), Card „Změna hesla“.

#### Modal Objednávka (úprava času po domluvě)
Vlastní overlay (`rgba(8,11,18,.6)` + blur 6px), panel 720px, bílý, `--hd-shadow-panel`. Hlavička: Eyebrow „Objednávka #ID · stav“, Heading dialog jméno, × tlačítko. Sekce **Klient** (Jméno, Telefon, E‑mail, Adresa – 2 sloupce). Sekce **Termín**: Datum (date input), Od / Do (Select po 15 min v rámci provozní doby), Služba; vpravo mono délka; rychlé posuny „− 1 h, − 15 min, + 15 min, + 1 h, Prodloužit o 30 min“; **Notice error** s výpisem kolidujících zakázek a časů, nebo **Notice info** „Termín je volný“. Řádek Stav (Select: Čeká na potvrzení / Potvrzeno / Hotovo / Zrušeno) + Poznámka. Patička `#f5f7fa`: vlevo Smazat (outline‑danger sm, jen u existující), vpravo Zavřít ghost, „Potvrdit termín“ dark (jen u stavu new), Uložit primary.

Ostatní modaly: Dialog „Smazat objednávku?“ (Vrátit ghost / Smazat danger), Dialog „Přidat uživatele“ (Jméno, E‑mail, Role), overlay balíčku (Název, Cena, Položky po řádcích, checkbox Nejoblíbenější – jen jeden), overlay Detail zákazníka, Dialog úspěchu „Hotovo“ s OK.

### 4. Icon pack (`templates/icons/Icons.dc.html`, `templates/_shared/icons.js`)
42 čárových ikon na mřížce 24 px, stroke 1,75 (default), `stroke-linecap: square`, `stroke-linejoin: miter`, `fill: none`, `stroke: currentColor`. V prototypu web component `<hd-icon name size stroke>`; v Reactu vytvořte `<Icon name="…" size={20} />` se stejnými path daty (zkopírujte objekt `P` z `icons.js`). Názvy: arrow-up-right, arrow-down, arrow-left, arrow-right, chevron-left/right/down, close, check, check-circle, plus, minus, search, calendar, clock, pin, phone, mail, user, users, car, droplet, sparkle, spray, shield, home, edit, trash, info, alert, bell, undo, refresh, menu, logout, settings, grid, list, tag, star, wallet, file, external.

### Doplňky landing page (v2)
- Hero metriky mají ikonu (clock / calendar / home) v modré před číslem.
- **Pás důvěry** pod marquee: 4 karty (border `#e1e5eb`, padding 20, ikona 22px modře + 15px bold titulek + 13px šedý popis): Pojištění odpovědnosti, Vlastní voda i elektřina, Platba po dokončení, Potvrzení do 3 hodin.
- Kroky postupu mají ikonu nad číslem (calendar / phone / sparkle).
- **Průběh rezervace**: 3 dlaždice nad formulářem (01 Den, 02 Čas, 03 Služba); hotový krok = ikona check, border `rgba(255,255,255,.7)`, pozadí `rgba(255,255,255,.14)`; nehotový border `.25`. Text dlaždice ukazuje aktuální hodnotu nebo nápovědu.
- Šipky měsíce jsou ikony chevron-left/right; v souhrnu tlačítko × (32px) pro zrušení výběru času.
- **FAQ** `#faq` před footerem: grid .8fr/1.2fr, akordeon 5 otázek (17px bold otázka, ikona plus/minus modře, odpověď 15px šedá, otevřená vždy max. jedna, první otevřená). Odkaz „Dotazy“ v navigaci.
- **Plovoucí CTA** vpravo dole (fixed 28px, černé, pulsující modrá tečka, „Nejbližší volný termín + hodnota“, hover modré) – zobrazí se po 600px scrollu a skryje v sekci rezervace.
- **Toast** (fixed dole uprostřed, černý, 13px, ikona modře, 3,2 s): výběr termínu, obsazený slot mezi začátkem a koncem, chybějící den, odeslání.

### Doplňky administrace (v2)
- **Toast stack** vpravo dole (max 4, šířka 360, černé `#080b12`, ikona v barvě tónu: ok `#1769ff`, warn `#ffb020`, danger `#ff6b5c`, titulek 13px bold + text 12px `#87909d`, spodní 2px proužek se zmenšuje po dobu TTL 4,2 s / 7 s u akcí, × pro zavření). Nahrazuje původní dialog „Hotovo“. Mazání objednávky, uživatele i balíčku je okamžité s akcí **Vrátit** (undo) v toastu – potvrzovací dialog se nepoužívá.
- **Modal objednávky** (860px, grid header / scroll body / footer): hlavička s avatarem iniciál (barva podle stavu), jméno, „Objednávka #ID · stav“, tlačítko zavolat (tel:), ×. Tělo dva sloupce: vlevo Klient (u nové objednávky bez e-mailu řádek „Stálý zákazník?“ se 4 čipy, které předvyplní kontakt), Termín (Datum / Od / Do, rychlé posuny, u kolize modré tlačítko „Najít nejbližší volný“ – posune na první volný úsek stejné délky v ten den), Notice error/info; Služba jako 3 karty (vybraná modrá s check), Stav jako čipy (vybraný černý), Poznámka. Vpravo panel `#f5f7fa` s **mini‑timeline dne** (440px, hodinové linky, ostatní zakázky šedě, tato objednávka modře; při překryvu červený 2px obrys, kolidující zakázky červený inset). Patička: Smazat + text „Neuložené změny · Ctrl+Enter uloží“, Zavřít / Potvrdit termín / „Založit objednávku“ nebo „Uložit změny“. Esc zavře, Ctrl/Cmd+Enter uloží.
- Klik do prázdného místa v kalendářním sloupci (cursor copy) založí novou objednávku na danou hodinu (délka 2 h).
- Modal balíčku: × v hlavičce, živý náhled karty (název, cena, položky) tak, jak se zobrazí na webu.
- Detail zákazníka: odkazy tel:/mailto: s ikonou, 3 statistiky (Zakázek, Hotových, Nejčastěji služba), seznam max. výška 280 s posuvem, tlačítko Nová zakázka.
- Ikony v horní liště (external, logout), šipky týdne, alert u překryvů, plus u „Přidat balíček“.

## Interactions & Behavior
- Sloty jsou indexy čtvrthodin od půlnoci (7:00 = 28). Rezervace = `{date, a, b}` s `b` exkluzivní. Překryv: `o.a < r.b && o.b > r.a` na stejném dni mezi stavy new/confirmed.
- Výběr rozsahu na webu: první klik = začátek, druhý (≥ začátek) = konec; klik před začátek přesune začátek; pokud mezi začátkem a koncem leží obsazený slot, výběr začne znovu. Sloty v minulosti (dnes) jsou obsazené.
- Validace formuláře: den → čas od–do → služba; HTML `required` na kontaktech.
- Uložení objednávky v adminu: `b <= a` → `b = a+1`; „Potvrdit“ = uložit se stavem confirmed; „Hotovo“ = done.
- Animace landing: `hdUp` (opacity 0→1, translateY 28→0, .7–.9s, cubic‑bezier(.2,.7,.2,1), postupné delay .1s), `hdReveal` při scrollu (`animation-timeline: view()`, range entry 0–40 %), `hdMarquee` 28s linear infinite, `hdFloat` 5–6s, `hdSweep` lesk přes placeholder. Respektovat `prefers-reduced-motion`.
- Admin: obsah záložky `hdUp .35s`, overlay `hdFade .2s` + panel `hdUp .25s`. Levý panel sticky top 24px.
- Responsivita: DS komponenty se skládají samy (< 850 / 760 / 650 px); vlastní gridy (hero, rezervace, kalendář) na < 900 px přepnout na jeden sloupec; týdenní kalendář na mobilu zobrazit jako denní.

## State Management
**Landing:** `month, day, a, b, hov, service, sent, error`. Obsazenost slotů načíst z API (`GET /availability?date=`) místo mock generátoru `busyRanges()`. Odeslání `POST /reservations`.
**Admin:** `tab, weekStart, orderFilter, query, modal (edit|delete|price|user|customer + draft, orig), toasts[], open, close, workDays, reservations, prices, users`. Pro rezervace, ceník, uživatele i nastavení napojit CRUD API; layout překryvů (`layout()` – greedy přiřazení sloupců v clusteru) ponechat na klientu.

## Design Tokens
Viz `DESIGN_SYSTEM.md` (všechny `--hd-*`). Použité navíc jen literály z DS palety: `#1769ff`, `#dce8ff`, `#cbdcff`, `#080b12`, `#101620`, `#29303b`, `#87909d`, `#687080`, `#a9afb9`, `#e1e5eb`, `#edf0f4`, `#f5f7fa`, `#b42318`, bílé alfa vrstvy na modrém pásu `.12 / .22 / .25 / .28 / .35 / .7`. Typografie: Geist (display/section/panel/title/dialog/card dle `Heading`), Geist Mono 10–13px uppercase letter‑spacing .12–.3em pro labely. Spacing: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 36, 40, 48, 56, 96, 110, 120. Radius 0.

## Assets
Žádné bitmapy – hero placeholder a slidery „před/po“ čekají na reálné fotografie. Logo je textový wordmark (HOME / DETAILING). Ikony: vlastní sada v `templates/_shared/icons.js` (viz obrazovka 4).

## Files
- `templates/landing/Landing.dc.html` – landing + rezervace
- `templates/admin-login/AdminLogin.dc.html` – přihlášení
- `templates/admin/Admin.dc.html` – administrace
- `templates/icons/Icons.dc.html` + `templates/_shared/icons.js` – icon pack
- `DESIGN_SYSTEM.md` – konvence a komponenty `@homedetailing/ui`
