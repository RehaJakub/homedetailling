-- Merge the existing catalogue entries; historical reservations keep their service names.
DO $$
DECLARE
  package_id integer;
BEGIN
  SELECT id INTO package_id FROM price_packages
  WHERE name IN ('Interiér', 'Tepování', 'Interiér + tepování')
  ORDER BY CASE name WHEN 'Interiér + tepování' THEN 0 WHEN 'Interiér' THEN 1 ELSE 2 END, id
  LIMIT 1;

  IF package_id IS NOT NULL THEN
    UPDATE price_packages
    SET name = 'Interiér + tepování',
        price = '2 000',
        show_currency = true,
        duration_minutes = 240,
        items = '["Hloubkové vysátí","Čištění plastů a kůže","Vnitřní okna","Tepování sedaček, koberců a stropu","Odstranění zápachu"]'::jsonb,
        updated_at = now()
    WHERE id = package_id;

    DELETE FROM price_packages
    WHERE name IN ('Interiér', 'Tepování', 'Interiér + tepování') AND id <> package_id;
  END IF;
END $$;
