# Ověření klíčových slov pro Home Detailing

Ověřeno 9. října 2026. Dokument vychází pouze ze služeb, měst, cen a kontaktů uvedených v projektu. V repozitáři nebyl nalezen export z Google Search Console ani jiný soubor s daty o kliknutích, zobrazeních nebo objemu hledání. Proto zde nejsou uváděny počty hledání.

## Co je ověřeno a co je pouze předpoklad

- **Ověřeno:** fráze se objevila v Google autocomplete nebo pro ni vyhledávače vracely konkrétní lokální konkurenty a relevantní vstupní stránky.
- **Odhad konkurence:** kvalitativní posouzení podle množství a specializace nalezených výsledků. Nejde o metriku z placeného SEO nástroje.
- **Předpoklad:** formulace odvozená z obsahu webu, pro kterou autocomplete nevrátil dostatečný signál. Taková fráze nebude základem nové samostatné stránky.

## Hlavní ověřené fráze

| Fráze | Stav | Záměr | Odhad konkurence | Použití |
|---|---|---|---|---|
| čištění aut Ostrava | Ověřeno: přesná fráze a více místních variant v autocomplete; relevantní organické i firemní výsledky | lokální služba | vysoká | homepage H1/title, `/cisteni-aut-ostrava` |
| čištění interiérů aut Ostrava | Ověřeno: autocomplete i přesné titulky konkurenčních stránek | služba + lokální | vysoká | homepage služby, stránka Ostrava, popisy obrázků |
| mobilní detailing Ostrava | Ověřeno: přesný autocomplete návrh a několik specializovaných konkurentů | mobilní služba | střední až vysoká | homepage description, stránka Ostrava |
| tepování sedaček Ostrava | Ověřeno: přesný autocomplete návrh | konkrétní služba | střední | text služby a stránka Ostrava; ne samostatná stránka |
| detailing Havířov | Ověřeno: autocomplete „detailing havířov“ a „car detailing havířov“; lokální studia ve výsledcích | lokální služba | střední | `/cisteni-aut-havirov` |
| čištění interiéru auta Havířov | Ověřeno: přesný autocomplete návrh | služba + lokální | střední | stránka Havířov |
| čištění aut Frýdek-Místek | Ověřeno: autocomplete nabízí přesnou frázi | lokální služba | střední | `/cisteni-aut-frydek-mistek` |
| čištění interiérů aut Frýdek-Místek | Ověřeno: autocomplete nabízí přesnou frázi a ve výsledcích jsou místní detailingové provozy | služba + lokální | střední | stránka Frýdek-Místek |
| detailing Frýdek-Místek | Ověřeno: přesný autocomplete návrh | lokální služba | střední | doplňková fráze na stránce Frýdek-Místek |

## Vedlejší fráze

| Fráze | Stav | Záměr | Odhad konkurence | Použití |
|---|---|---|---|---|
| mobilní čištění aut | Ověřeno nepřímo: používají jej relevantní výsledky a odpovídá hlavní službě webu | služba | střední | metadata a úvodní texty |
| čištění interiéru auta | Ověřeno v lokálních kombinacích | služba | vysoká | sekce služby a Service JSON-LD |
| tepování aut Ostrava | Předpoklad: samostatný autocomplete seznam byl prázdný | konkrétní služba | neurčeno | pouze přirozená zmínka, ne cílová stránka |
| ruční mytí aut Ostrava | Ověřeno ve výsledcích konkurence; služba je skutečně uvedena v projektu | služba + lokální | vysoká | stránka Ostrava a Service JSON-LD |
| čištění auta doma Ostrava | Předpoklad: odpovídá mobilnímu modelu, ale bez přímého autocomplete důkazu | lokální / pohodlí | neurčeno | pouze přirozený popis služby |
| cena čištění interiéru auta Ostrava | Předpoklad komerčního záměru; cena 1 500 Kč je v projektu | cena | střední | ceník a metadata stránky Ostrava, bez samostatné stránky |

## Co se umisťuje a jak jsou stránky postavené

- Pro Ostravu se zobrazují specializované stránky s title a H1 obsahujícími přímo „čištění interiérů aut Ostrava“, „mytí interiéru auta Ostrava“ nebo „mobilní detailing v Ostravě a okolí“. Výsledky často oddělují služby, ceník, galerii a rezervaci.
- Na Seznamu se vedle organických výsledků výrazně objevují firemní profily z Firmy.cz/Mapy.cz. To potvrzuje důležitost správného a kompletního firemního profilu mimo web.
- Pro Havířov se zobrazují místní detailingová studia s titulky typu „Kompletní detailing v Havířově“ a samostatnými bloky pro interiér a exteriér.
- Pro Frýdek-Místek se zobrazují lokální detailingová a ruční mycí studia. Přesné autocomplete návrhy existují pro „čištění aut“ i „čištění interiérů aut“.
- Nalezené konkurenční stránky pracují s přesnou službou a městem v title/H1, konkrétním ceníkem, lokální dostupností, fotografiemi výsledků a jasnou rezervací. Home Detailing už většinu těchto prvků obsahuje; chyběly samostatné indexovatelné lokální vstupní stránky.

## Rozhodnutí o městských stránkách

### Vytvořit

1. `/cisteni-aut-ostrava` — nejsilnější a nejširší autocomplete signál, nejvyšší lokální konkurence, město je hlavním působištěm webu.
2. `/cisteni-aut-havirov` — existují přesné návrhy pro detailing i čištění interiéru a web výslovně uvádí, že do Havířova přijíždí.
3. `/cisteni-aut-frydek-mistek` — existují přesné návrhy pro čištění aut, čištění interiérů a detailing; město je výslovně uvedeno v oblasti působnosti.

Každá stránka bude používat pouze existující fakta a odlišný úhel podle současného textu „Kde jezdíme“. Nebudou přidány smyšlené pobočky, adresy, otevírací doby ani reference.

### Nevytvářet

- Ostrava-Poruba, Ostrava-Hrabůvka a další čtvrti: některé se objevují v autocomplete, ale projekt nepotvrzuje samostatné lokální pobočky a stránky by byly pouze doorway variantami.
- Okolní obce do 30 km: web uvádí obecný dojezd, nikoli ověřený seznam obcí nebo dostatečnou poptávku pro jednotlivé stránky.
- Samostatné stránky „tepování“ a „ruční mytí“: web má omezené množství unikátního obsahu k těmto jednotlivým službám; vhodnější je pokrýt je na městských stránkách a v ceníku.

## Zdroje ověření

- Google autocomplete endpoint, dotazy: „čištění aut Ostrava“, „mobilní detailing Ostrava“, „tepování sedaček Ostrava“, „čištění interiéru auta Havířov“, „detailing Havířov“, „čištění aut Frýdek-Místek“ a „detailing Frýdek-Místek“.
- Seznam.cz výsledky pro „čištění aut Ostrava“ (kontrola lokálních organických výsledků a integrace Firmy.cz).
- Relevantní nalezené stránky: `ciste-auto-ostrava.cz/mobilni-detailing/`, `leodetailing.cz`, `cisteni-kobercu-ostrava.com/cisteni-interieru-aut-ostrava/`, `iamclean.cz`, `modetailing.cz`, `top-int.cz`, `kitsunedetailing.cz` a `autochodura.cz/detailing/`.

## Omezení výzkumu

- Autocomplete a aktuální SERP potvrzují, že se fráze používají, ale samy o sobě neposkytují spolehlivý počet hledání.
- Přesné objemy, prokliky a současné pozice je nutné po nasazení doplnit z Google Search Console a dostupných statistik Seznamu.
