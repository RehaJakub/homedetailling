# Home Detailing

Next.js web s PostgreSQL databází, rezervačním API a zabezpečeným admin panelem.

## Požadavky

- [Bun](https://bun.sh) 1.3+ (správce balíčků a spouštěč skriptů): `curl -fsSL https://bun.sh/install | bash`
- Node.js 22+ (Next.js běží na Node, Bun ho jen spouští)
- Docker s Compose (lokální Postgres a produkční stack)
- `make`

## Lokální spuštění

```bash
make setup   # vytvoří .env z .env.example, nainstaluje závislosti, spustí Postgres, aplikuje migrace
make dev     # http://localhost:3000, administrace na /admin
```

Po `make setup` nastavte v `.env` bezpečné hodnoty `JWT_SECRET` (alespoň 32 znaků) a `ADMIN_REGISTRATION_CODE`. Původní SQLite data lze přenést příkazem `bun run db:migrate:sqlite`.

## První administrátor

Pokud databáze neobsahuje žádného uživatele, `/admin` zobrazí jednorázovou registraci. Použijte hodnotu `ADMIN_REGISTRATION_CODE`. Po vytvoření prvního účtu se registrace automaticky uzavře.

Role:

- `admin` — plný přístup včetně správy uživatelů;
- `manager` — správa rezervací a ceníku;
- `viewer` — pouze čtení.

JWT session je uložena v HttpOnly cookie a platí 8 hodin.

## Příkazy

`make help` vypíše všechny cíle. Nejčastější:

| Příkaz | Co dělá |
|---|---|
| `make check` | lint + typecheck + unit testy (definition of done) |
| `make test-integration` | testy API proti databázi `homedetailing_test` (spustí Postgres a databázi založí) |
| `make db-generate` | vygeneruje migraci po úpravě `lib/db/schema.ts` |
| `make db-migrate` | aplikuje migrace na lokální databázi |
| `make db-studio` | Drizzle Studio |
| `make db-reset` | smaže lokální databázi a založí ji znovu |
| `make seed` | naplní lokální databázi ukázkovými daty (přihlášení `admin@admin.cz` / `admin`) |
| `make build` | produkční build (standalone) |
| `make docker-build` | sestaví produkční image `homedetailing/app:local` |
| `make prod-up` / `make prod-down` | spustí / zastaví produkční stack z `compose.prod.yml` |

Každý cíl volá odpovídající `bun run …` skript z `package.json`, takže jde použít i přímo. Nikdy nepoužívejte `bun --bun` (Next musí běžet na Node) ani `bun test` (to je vlastní runner Bunu, testy běží ve Vitestu přes `bun run test`).

## Testy

- **Unit** (`lib/**/*.test.ts`, projekt `unit`): čistá logika bez databáze. `make test`.
- **Integrační** (`tests/integration/**`, projekt `integration`): route handlery `app/api/v2/*` proti skutečnému Postgresu. Používají výhradně databázi `homedetailing_test`, kterou `compose.yml` založí při prvním startu (`make db-test-ensure` pro starší volume). `make test-integration`.

## Produkce

1. `cp .env.production.example .env.production` a vyplňte hodnoty.
2. `make prod-up` sestaví image, spustí Postgres, jednorázově aplikuje migrace (`scripts/migrate.mjs`) a nastartuje aplikaci na `APP_BIND:APP_PORT` (výchozí `127.0.0.1:3000`, reverse proxy řeší host).
3. `make prod-logs` pro logy, `make prod-down` pro zastavení (volume s daty zůstává).

Postgres v produkčním stacku není vystavený mimo compose síť. Nasazení do homelabu (ct302) přes GitHub runner zatím není součástí repozitáře.
