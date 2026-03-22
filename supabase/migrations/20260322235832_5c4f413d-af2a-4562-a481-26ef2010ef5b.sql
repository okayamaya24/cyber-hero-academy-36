
-- Continent progress table
CREATE TABLE public.continent_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  continent_id text NOT NULL,
  status text NOT NULL DEFAULT 'locked',
  boss_defeated boolean NOT NULL DEFAULT false,
  zones_completed integer NOT NULL DEFAULT 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(child_id, continent_id)
);

-- Zone progress table
CREATE TABLE public.zone_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  continent_id text NOT NULL,
  zone_id text NOT NULL,
  status text NOT NULL DEFAULT 'locked',
  games_completed integer NOT NULL DEFAULT 0,
  total_games integer NOT NULL DEFAULT 4,
  stars_earned integer NOT NULL DEFAULT 0,
  unlocked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(child_id, zone_id)
);

-- Add columns to child_profiles
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS villains_defeated integer NOT NULL DEFAULT 0;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS worlds_completed integer NOT NULL DEFAULT 0;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS master_certificate_earned boolean NOT NULL DEFAULT false;

-- RLS for continent_progress
ALTER TABLE public.continent_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view children continent progress" ON public.continent_progress
  FOR SELECT TO public USING (
    EXISTS (SELECT 1 FROM public.child_profiles WHERE child_profiles.id = continent_progress.child_id AND child_profiles.parent_id = auth.uid())
  );

CREATE POLICY "Parents can insert children continent progress" ON public.continent_progress
  FOR INSERT TO public WITH CHECK (
    EXISTS (SELECT 1 FROM public.child_profiles WHERE child_profiles.id = continent_progress.child_id AND child_profiles.parent_id = auth.uid())
  );

CREATE POLICY "Parents can update children continent progress" ON public.continent_progress
  FOR UPDATE TO public USING (
    EXISTS (SELECT 1 FROM public.child_profiles WHERE child_profiles.id = continent_progress.child_id AND child_profiles.parent_id = auth.uid())
  );

-- RLS for zone_progress
ALTER TABLE public.zone_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view children zone progress" ON public.zone_progress
  FOR SELECT TO public USING (
    EXISTS (SELECT 1 FROM public.child_profiles WHERE child_profiles.id = zone_progress.child_id AND child_profiles.parent_id = auth.uid())
  );

CREATE POLICY "Parents can insert children zone progress" ON public.zone_progress
  FOR INSERT TO public WITH CHECK (
    EXISTS (SELECT 1 FROM public.child_profiles WHERE child_profiles.id = zone_progress.child_id AND child_profiles.parent_id = auth.uid())
  );

CREATE POLICY "Parents can update children zone progress" ON public.zone_progress
  FOR UPDATE TO public USING (
    EXISTS (SELECT 1 FROM public.child_profiles WHERE child_profiles.id = zone_progress.child_id AND child_profiles.parent_id = auth.uid())
  );
