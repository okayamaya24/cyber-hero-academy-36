-- Create memory_match_results table
CREATE TABLE public.memory_match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL DEFAULT '',
  xp_earned INTEGER NOT NULL DEFAULT 0,
  stars TEXT DEFAULT NULL,
  completion_time INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.memory_match_results ENABLE ROW LEVEL SECURITY;

-- Public policies for testing
CREATE POLICY "Anyone can read memory_match_results"
ON public.memory_match_results
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can insert memory_match_results"
ON public.memory_match_results
FOR INSERT
TO public
WITH CHECK (true);