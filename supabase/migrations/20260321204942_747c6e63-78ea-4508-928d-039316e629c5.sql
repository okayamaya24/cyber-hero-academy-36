ALTER TABLE public.mission_progress ADD COLUMN IF NOT EXISTS game_type text;
ALTER TABLE public.mission_progress ADD COLUMN IF NOT EXISTS stars_earned integer NOT NULL DEFAULT 0;