
CREATE TABLE public.training_game_settings (
  id TEXT NOT NULL PRIMARY KEY,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  tier_junior BOOLEAN NOT NULL DEFAULT false,
  tier_hero BOOLEAN NOT NULL DEFAULT false,
  tier_elite BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.training_game_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read training game settings"
  ON public.training_game_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creator can manage training game settings"
  ON public.training_game_settings FOR ALL
  TO public
  USING (is_creator());
