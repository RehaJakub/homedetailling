# Home Detailing

Next.js web s PostgreSQL databází, rezervačním API a zabezpečeným admin panelem.

## Lokální spuštění

1. Zkopírujte `.env.example` do `.env` a nastavte bezpečné hodnoty `JWT_SECRET` a `ADMIN_REGISTRATION_CODE`.
2. Spusťte databázi: `docker compose up -d postgres`.
3. Aplikujte schéma: `npm run db:migrate`.
4. Volitelně přeneste původní SQLite data: `npm run db:migrate:sqlite`.
5. Spusťte web: `npm run dev`.

Web je dostupný na `http://localhost:3000`, administrace na `/admin`.

## První administrátor

Pokud databáze neobsahuje žádného uživatele, `/admin` zobrazí jednorázovou registraci. Použijte hodnotu `ADMIN_REGISTRATION_CODE`. Po vytvoření prvního účtu se registrace automaticky uzavře.

Role:

- `admin` — plný přístup včetně správy uživatelů;
- `manager` — správa rezervací a ceníku;
- `viewer` — pouze čtení.

JWT session je uložena v HttpOnly cookie a platí 8 hodin.

## Příkazy

```bash
npm run lint
npm run build
npm run db:generate
npm run db:migrate
npm run db:studio
```
