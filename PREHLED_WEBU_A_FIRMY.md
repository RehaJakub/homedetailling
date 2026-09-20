# Přehled webu a firmy Home Detailing

## Stručně o firmě

Home Detailing se zaměřuje na mobilní čištění a detailing automobilů v Ostravě, Havířově, Frýdku-Místku a okolí. Za zákazníkem přijede domů nebo do práce s vlastní vodou a elektřinou. Zákazník tak nemusí s autem nikam cestovat ani zajišťovat přípojky.

Doprava do 30 km od Ostravy je bez příplatku. Vzdálenější zakázky lze domluvit individuálně. Rezervace je během několika minut telefonicky potvrzena a platba probíhá po dokončení hotově nebo převodem.

### Hlavní výhody pro zákazníka

- čištění auta na zvolené adrese;
- vlastní voda a elektřina;
- jednoduchá rezervace termínu online;
- jasná nabídka služeb a cen;
- telefonické potvrzení termínu;
- platba až po dokončení;
- fotografie skutečných výsledků před a po čištění.

## Nabízené služby

### Interiér – 1 500 Kč

- vysávání;
- čištění plastů, kůže a textilu;
- čištění vnitřních oken;
- impregnace kůže a plastů;
- čištění koberců;
- čištění a impregnace kožených sedaček;
- tepování sedaček a koberců.

### Exteriér – cena domluvou

- ruční mytí karoserie;
- čištění kol a pneumatik;
- ochranný vosk na několik týdnů.

U výrazně znečištěného vozu může být po domluvě účtován příplatek. Zákazník je na tuto možnost upozorněn přímo v rezervačním formuláři.

## Co umí veřejná část webu

### Prezentace firmy

- přehled služeb, balíčků a cen;
- vysvětlení průběhu zakázky;
- kontaktní telefonní čísla;
- seznam obsluhovaných oblastí;
- odpovědi na časté dotazy;
- interaktivní galerie fotografií před a po;
- interaktivní 3D model automobilu;
- responzivní zobrazení pro počítače, tablety a telefony.

### Online rezervace

- zákazník si vybere službu, datum a začátek rezervace;
- veřejné termíny začínají po 30 minutách;
- každá veřejná rezervace automaticky blokuje tři hodiny;
- dostupnost se řídí pracovní dobou nastavenou samostatně pro každý den v týdnu;
- obsazené a minulé termíny nelze rezervovat;
- systém zabraňuje souběžnému vytvoření dvou rezervací na stejný čas;
- formulář kontroluje jméno, telefon, e-mail, adresu a vybrané služby;
- zákazník může vybrat Interiér, Exteriér nebo obě služby společně;
- po odeslání se zobrazí potvrzení a informace o následném telefonickém kontaktu.

### Viditelnost ve vyhledávačích

- lokální SEO pro hledání čištění aut v Ostravě, Havířově a Frýdku-Místku;
- správný titulek, popis stránky a klíčová slova;
- strukturovaná data firmy, služeb, cen a častých dotazů;
- soubory `sitemap.xml` a `robots.txt` pro vyhledávače;
- ikona webu, Open Graph metadata a webový manifest;
- ověřovací soubor pro Google Search Console.

## Co umí administrační panel

Administrace je dostupná na adrese `/admin` pouze po přihlášení.

### Přehled a kalendář

- rychlý přehled nových rezervací a důležitých informací;
- týdenní kalendář a jednodenní zobrazení pro mobilní zařízení;
- jasné rozlišení pracovní a nepracovní doby;
- zobrazení rezervací v konkrétních hodinách;
- upozornění na překrývající se objednávky;
- přesouvání rezervací v kalendáři s možností vrátit poslední přesun.

### Správa objednávek

- vytvoření objednávky ručně, například při telefonické domluvě;
- otevření a úprava kontaktních údajů, adresy, služeb, data, času a poznámky;
- stavy: nová, potvrzená, hotová a zrušená;
- filtrování objednávek podle stavu;
- hledání podle jména, telefonu, e-mailu, adresy nebo služby;
- smazání objednávky s možností okamžitého obnovení;
- rychlé volání z telefonního čísla zákazníka.

### Správa zákazníků

- automatické seskupení zákazníků podle e-mailu;
- historie všech zakázek daného zákazníka;
- počet zakázek, počet dokončených zakázek a nejčastější služba;
- rychlé vytvoření nové objednávky s předvyplněnými údaji zákazníka;
- odkazy pro zavolání nebo odeslání e-mailu.

### Ceny, pracovní doba a uživatelé

- vytváření, úprava a mazání cenových balíčků;
- nastavení názvu, ceny, obsahu, zvýraznění a délky balíčku;
- změny ceníku se načítají také na veřejném webu;
- samostatné zapnutí nebo vypnutí každého dne v týdnu;
- samostatná pracovní doba pro pondělí až neděli;
- správa uživatelských účtů a jejich oprávnění;
- změna vlastního hesla.

### Uživatelské role

- **Admin** – plný přístup včetně správy dalších uživatelů;
- **Správce** – správa rezervací, zákazníků, ceníku a nastavení;
- **Pouze čtení** – může data prohlížet, ale nemůže je měnit.

## Zabezpečení a spolehlivost

- hesla jsou ukládána pouze v zahashované podobě;
- přihlášení používá zabezpečenou `HttpOnly` cookie s omezenou platností;
- server kontroluje oprávnění podle role u každé chráněné operace;
- omezení počtu pokusů chrání přihlášení i veřejný rezervační formulář proti zneužití;
- požadavky měnící data jsou chráněny kontrolou původu;
- web posílá bezpečnostní hlavičky včetně Content Security Policy;
- administrace není určena k indexaci vyhledávači;
- data rezervací, ceníku, nastavení a uživatelů jsou uložena v databázi PostgreSQL;
- produkční nasazení obsahuje automatické databázové migrace a kontrolu stavu aplikace.

## Použité technologie a provoz

- Next.js, React a TypeScript;
- PostgreSQL a Drizzle ORM;
- vlastní design systém pro jednotný vzhled webu a administrace;
- Docker pro produkční provoz;
- automatické kontroly kódu, testy, sestavení a nasazení pomocí GitHub Actions;
- automatické verzování a zveřejňování nových verzí;
- produkční doména: [homedetailing.cz](https://homedetailing.cz).

## Kontakty

- telefon: [+420 777 011 690](tel:+420777011690);
- telefon: [+420 733 477 254](tel:+420733477254);
- web: [https://homedetailing.cz](https://homedetailing.cz).

## Krátký prezentační text

**Home Detailing přiváží profesionální čištění auta přímo k zákazníkovi. V Ostravě, Havířově, Frýdku-Místku a okolí poskytuje péči o interiér i exteriér s vlastní vodou a elektřinou. Termín lze jednoduše rezervovat online a firma jej během několika minut telefonicky potvrdí.**
