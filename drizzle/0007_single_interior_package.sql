-- Merge the former Basic and Premium tiers into one complete interior package.
-- Historical reservation labels remain unchanged.
DO $$
DECLARE
  interior_id integer;
BEGIN
  SELECT id INTO interior_id
  FROM price_packages
  WHERE name IN ('Interiér', 'Basic interiér', 'Premium interiér', 'Interiér + tepování')
  ORDER BY CASE name
    WHEN 'Interiér' THEN 0
    WHEN 'Basic interiér' THEN 1
    WHEN 'Premium interiér' THEN 2
    ELSE 3
  END, id
  LIMIT 1;

  IF interior_id IS NULL THEN
    INSERT INTO price_packages (name, price, show_currency, featured, duration_minutes, sort_order, items)
    VALUES ('Interiér', '1 500', true, false, 180, 2, '[]'::jsonb)
    RETURNING id INTO interior_id;
  END IF;

  UPDATE price_packages
  SET name = 'Interiér',
      price = '1 500',
      show_currency = true,
      featured = false,
      duration_minutes = 180,
      sort_order = 2,
      items = '["Vysávání","Čištění plastů, kůže a textilu","Vnitřní okna","Impregnace kůže a plastů","Čištění koberců","Čištění a impregnace kožených sedaček","Tepování sedaček a koberce"]'::jsonb,
      updated_at = now()
  WHERE id = interior_id;

  DELETE FROM price_packages
  WHERE name IN ('Basic interiér', 'Premium interiér', 'Interiér + tepování')
     OR (name = 'Interiér' AND id <> interior_id);
END $$;
