-- Populate an empty catalogue with the exterior package previously shown as fallback.
INSERT INTO price_packages (name, price, show_currency, featured, duration_minutes, sort_order, items)
SELECT 'Exteriér', 'Domluvou', false, false, 180, 1,
       '["Ruční mytí karoserie","Dekontaminace laku","Čištění kol a pneu","Ochranný vosk"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM price_packages);
--> statement-breakpoint
-- Replace the previous interior bundle; historical reservation labels remain intact.
DO $$
DECLARE
  basic_id integer;
  premium_id integer;
BEGIN
  SELECT id INTO basic_id FROM price_packages WHERE name = 'Basic interiér' ORDER BY id LIMIT 1;
  IF basic_id IS NULL THEN
    INSERT INTO price_packages (name, price, show_currency, featured, duration_minutes, sort_order, items)
    VALUES ('Basic interiér', '1 500', true, false, 150, 2, '[]'::jsonb)
    RETURNING id INTO basic_id;
  END IF;
  UPDATE price_packages SET price = '1 500', show_currency = true, featured = false, sort_order = 2,
    items = '["Vysávání","Čištění plastů, kůže a textilu","Vnitřní okna","Impregnace kůže a plastů","Čištění koberců"]'::jsonb,
    updated_at = now()
  WHERE id = basic_id;

  SELECT id INTO premium_id FROM price_packages WHERE name IN ('Premium interiér', 'Interiér + tepování')
  ORDER BY CASE name WHEN 'Premium interiér' THEN 0 ELSE 1 END, id LIMIT 1;
  IF premium_id IS NULL THEN
    INSERT INTO price_packages (name, price, show_currency, featured, duration_minutes, sort_order, items)
    VALUES ('Premium interiér', '2 000', true, false, 240, 3, '[]'::jsonb)
    RETURNING id INTO premium_id;
  END IF;
  UPDATE price_packages SET featured = false WHERE featured AND id <> premium_id;
  UPDATE price_packages SET name = 'Premium interiér', price = '2 000', show_currency = true, featured = true, sort_order = 3,
    items = '["Vše z balíčku Basic","Čištění a impregnace kožených sedaček","Tepování sedaček a koberce"]'::jsonb,
    updated_at = now()
  WHERE id = premium_id;
  DELETE FROM price_packages
  WHERE name IN ('Interiér + tepování', 'Basic interiér', 'Premium interiér') AND id NOT IN (basic_id, premium_id);
END $$;
