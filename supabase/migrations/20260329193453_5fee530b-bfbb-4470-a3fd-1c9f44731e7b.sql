
-- Add role and account_type to existing profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'family',
  ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'family',
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';

-- Update existing profiles to have role='family'
UPDATE public.profiles SET role = 'family', account_type = 'family' WHERE role IS NULL OR role = 'family';

-- Update handle_new_user to include role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email, role, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'family'),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'family')
  );
  RETURN NEW;
END;
$function$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Kids table (for new portal system)
CREATE TABLE IF NOT EXISTS public.kids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  age int,
  username text UNIQUE,
  avatar_color text DEFAULT 'blue',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.kids ENABLE ROW LEVEL SECURITY;

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- CMS Games table
CREATE TABLE IF NOT EXISTS public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text DEFAULT '🎮',
  category_id uuid REFERENCES public.categories(id),
  age_range text,
  status text DEFAULT 'draft',
  featured boolean DEFAULT false,
  publish_date timestamptz,
  players_count int DEFAULT 0,
  completions_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Badges registry table (admin-managed)
CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text DEFAULT '🏅',
  description text,
  trigger_condition text,
  active boolean DEFAULT true,
  earned_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  display_month text,
  display_day text,
  status text DEFAULT 'scheduled',
  badge_id uuid REFERENCES public.badges(id),
  double_xp boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Game sessions (kid activity log)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id uuid REFERENCES public.kids(id) ON DELETE CASCADE NOT NULL,
  game_id uuid REFERENCES public.games(id),
  status text DEFAULT 'in_progress',
  score int,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_seconds int
);
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Platform settings (feature flags)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value boolean DEFAULT true
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- ========== RLS POLICIES ==========

-- Helper: check if user is creator
CREATE OR REPLACE FUNCTION public.is_creator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'creator'
  )
$$;

-- Kids RLS
CREATE POLICY "Creator full access on kids" ON public.kids FOR ALL USING (public.is_creator());
CREATE POLICY "Parents manage own kids" ON public.kids FOR ALL USING (
  parent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
) WITH CHECK (
  parent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Categories RLS
CREATE POLICY "Anyone authenticated can read categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creator can manage categories" ON public.categories FOR ALL USING (public.is_creator());

-- Games RLS
CREATE POLICY "Anyone authenticated can read games" ON public.games FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creator can manage games" ON public.games FOR ALL USING (public.is_creator());

-- Badges RLS
CREATE POLICY "Anyone authenticated can read badges" ON public.badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creator can manage badges" ON public.badges FOR ALL USING (public.is_creator());

-- Events RLS
CREATE POLICY "Anyone authenticated can read events" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creator can manage events" ON public.events FOR ALL USING (public.is_creator());

-- Game sessions RLS
CREATE POLICY "Creator full access on game_sessions" ON public.game_sessions FOR ALL USING (public.is_creator());
CREATE POLICY "Parents manage own kids sessions" ON public.game_sessions FOR ALL USING (
  kid_id IN (
    SELECT k.id FROM public.kids k
    JOIN public.profiles p ON k.parent_id = p.id
    WHERE p.user_id = auth.uid()
  )
) WITH CHECK (
  kid_id IN (
    SELECT k.id FROM public.kids k
    JOIN public.profiles p ON k.parent_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Platform settings RLS
CREATE POLICY "Anyone authenticated can read settings" ON public.platform_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creator can manage settings" ON public.platform_settings FOR ALL USING (public.is_creator());

-- Seed platform_settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('special_events_visible', true),
  ('leaderboards_visible', true),
  ('onboarding_enabled', true),
  ('school_accounts_enabled', true),
  ('maintenance_mode', false)
ON CONFLICT (key) DO NOTHING;

-- Seed categories
INSERT INTO public.categories (name) VALUES
  ('Math'), ('Reading'), ('Science'), ('Spelling'), ('History'), ('Art'), ('Coding')
ON CONFLICT DO NOTHING;
