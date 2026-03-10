
CREATE TABLE public.daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  challenge_date date NOT NULL DEFAULT CURRENT_DATE,
  game_type text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  points_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_id, challenge_date)
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view children daily challenges"
  ON public.daily_challenges FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM child_profiles WHERE child_profiles.id = daily_challenges.child_id AND child_profiles.parent_id = auth.uid()
  ));

CREATE POLICY "Parents can insert children daily challenges"
  ON public.daily_challenges FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM child_profiles WHERE child_profiles.id = daily_challenges.child_id AND child_profiles.parent_id = auth.uid()
  ));

CREATE POLICY "Parents can update children daily challenges"
  ON public.daily_challenges FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM child_profiles WHERE child_profiles.id = daily_challenges.child_id AND child_profiles.parent_id = auth.uid()
  ));
