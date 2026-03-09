
-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table for parent accounts
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Child profiles table
CREATE TABLE public.child_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 3 AND age <= 15),
  avatar TEXT NOT NULL DEFAULT '🦸',
  level INTEGER NOT NULL DEFAULT 1,
  points INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children"
  ON public.child_profiles FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create children"
  ON public.child_profiles FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update own children"
  ON public.child_profiles FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete own children"
  ON public.child_profiles FOR DELETE
  USING (auth.uid() = parent_id);

CREATE TRIGGER update_child_profiles_updated_at
  BEFORE UPDATE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mission progress table
CREATE TABLE public.mission_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  current_question INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (child_id, mission_id)
);

ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;

-- Parents can view/manage mission progress for their children
CREATE POLICY "Parents can view children mission progress"
  ON public.mission_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.child_profiles
      WHERE child_profiles.id = mission_progress.child_id
      AND child_profiles.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert children mission progress"
  ON public.mission_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.child_profiles
      WHERE child_profiles.id = mission_progress.child_id
      AND child_profiles.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update children mission progress"
  ON public.mission_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.child_profiles
      WHERE child_profiles.id = mission_progress.child_id
      AND child_profiles.parent_id = auth.uid()
    )
  );

CREATE TRIGGER update_mission_progress_updated_at
  BEFORE UPDATE ON public.mission_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Earned badges table
CREATE TABLE public.earned_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL DEFAULT '🏅',
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (child_id, badge_id)
);

ALTER TABLE public.earned_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view children badges"
  ON public.earned_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.child_profiles
      WHERE child_profiles.id = earned_badges.child_id
      AND child_profiles.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert children badges"
  ON public.earned_badges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.child_profiles
      WHERE child_profiles.id = earned_badges.child_id
      AND child_profiles.parent_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_child_profiles_parent ON public.child_profiles(parent_id);
CREATE INDEX idx_mission_progress_child ON public.mission_progress(child_id);
CREATE INDEX idx_earned_badges_child ON public.earned_badges(child_id);
