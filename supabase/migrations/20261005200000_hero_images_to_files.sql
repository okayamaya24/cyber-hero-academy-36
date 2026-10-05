-- Hero images moved from base64 text (~480 KB per kid, stored in
-- child_profiles.avatar_config->'heroSrc') to files in public/heroes/<key>.webp.
-- Rewrite saved profiles to point at the file so every query that loads a
-- child profile stops downloading the whole picture.
--
-- Key format (matches src/components/avatar/heroesData.ts):
--   <char>-<suit>               when accessory is "none"
--   <char>-<accessory>-<suit>   otherwise
-- where <char> comes from skin + gender.

UPDATE public.child_profiles AS c
SET avatar_config = jsonb_set(
  c.avatar_config::jsonb,
  '{heroSrc}',
  to_jsonb(
    '/heroes/' ||
    (CASE c.avatar_config->>'skin'
      WHEN 'light' THEN CASE c.avatar_config->>'gender' WHEN 'girl' THEN 'girl-light' ELSE 'boy-light' END
      WHEN 'tan'   THEN CASE c.avatar_config->>'gender' WHEN 'girl' THEN 'girl-tan'   ELSE 'boy-tan'   END
      WHEN 'brown' THEN CASE c.avatar_config->>'gender' WHEN 'girl' THEN 'girl-brown' ELSE 'boy-dark'  END
      WHEN 'dark'  THEN CASE c.avatar_config->>'gender' WHEN 'girl' THEN 'girl-puffs' ELSE 'boy-black' END
    END) ||
    (CASE
      WHEN coalesce(c.avatar_config->>'accessory', 'none') = 'none' THEN ''
      ELSE '-' || (c.avatar_config->>'accessory')
    END) ||
    '-' || (c.avatar_config->>'suitKey') ||
    '.webp'
  )
)
WHERE c.avatar_config->>'heroSrc' LIKE 'data:%'
  AND c.avatar_config->>'skin' IN ('light', 'tan', 'brown', 'dark')
  AND c.avatar_config->>'gender' IN ('girl', 'boy')
  AND c.avatar_config->>'suitKey' IN ('blue', 'green', 'purple', 'pink', 'teal')
  AND coalesce(c.avatar_config->>'accessory', 'none') IN ('none', 'tablet', 'shield', 'magnifier');
