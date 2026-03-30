
-- Add grade_level to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade_level text;

-- Add locked, min_grade, max_grade to games
ALTER TABLE games ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;
ALTER TABLE games ADD COLUMN IF NOT EXISTS min_grade integer;
ALTER TABLE games ADD COLUMN IF NOT EXISTS max_grade integer;

-- parent_kid_links table
CREATE TABLE IF NOT EXISTS parent_kid_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  kid_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, kid_id)
);
ALTER TABLE parent_kid_links ENABLE ROW LEVEL SECURITY;

-- kid_progress table
CREATE TABLE IF NOT EXISTS kid_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id uuid NOT NULL,
  game_id uuid REFERENCES games(id),
  progress_data jsonb,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(kid_id, game_id)
);
ALTER TABLE kid_progress ENABLE ROW LEVEL SECURITY;

-- announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  target_audience text DEFAULT 'all',
  target_grade_min integer,
  target_grade_max integer,
  sent_at timestamptz DEFAULT now(),
  created_by uuid,
  is_active boolean DEFAULT true
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- email_log table
CREATE TABLE IF NOT EXISTS email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body text NOT NULL,
  recipient_type text,
  recipient_email text,
  sent_at timestamptz DEFAULT now(),
  sent_by uuid,
  status text DEFAULT 'sent'
);
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- RLS: Creator can read all profiles (for admin Users page)
CREATE POLICY "Creator can read all profiles" ON profiles FOR SELECT USING (is_creator());

-- RLS: Creator full access on parent_kid_links
CREATE POLICY "Creator full access on parent_kid_links" ON parent_kid_links FOR ALL USING (is_creator());
CREATE POLICY "Users manage own links" ON parent_kid_links FOR ALL USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());
CREATE POLICY "Kids can read their own links" ON parent_kid_links FOR SELECT USING (kid_id = auth.uid());

-- RLS: kid_progress
CREATE POLICY "Creator full access on kid_progress" ON kid_progress FOR ALL USING (is_creator());
CREATE POLICY "Kids manage own progress" ON kid_progress FOR ALL USING (kid_id = auth.uid()) WITH CHECK (kid_id = auth.uid());
CREATE POLICY "Parents read linked kids progress" ON kid_progress FOR SELECT USING (
  kid_id IN (SELECT pkl.kid_id FROM parent_kid_links pkl WHERE pkl.parent_id = auth.uid())
);

-- RLS: announcements
CREATE POLICY "Anyone authenticated can read announcements" ON announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creator can manage announcements" ON announcements FOR ALL USING (is_creator());

-- RLS: email_log
CREATE POLICY "Creator can manage email_log" ON email_log FOR ALL USING (is_creator());

-- Seed cybersecurity-focused categories
INSERT INTO categories (name) VALUES 
  ('Cybersecurity'), ('Privacy'), ('Safe Browsing'), ('Critical Thinking'), ('Digital Citizenship')
ON CONFLICT DO NOTHING;

-- Ensure platform_settings seeds exist
INSERT INTO platform_settings (key, value) VALUES 
  ('special_events_visible', true),
  ('leaderboards_visible', true),
  ('onboarding_enabled', true),
  ('school_accounts_enabled', true),
  ('maintenance_mode', false)
ON CONFLICT (key) DO NOTHING;
