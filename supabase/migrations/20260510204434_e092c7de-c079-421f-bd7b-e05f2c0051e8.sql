-- Create word_search_results table
CREATE TABLE public.word_search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  stars TEXT,
  completion_time INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.word_search_results ENABLE ROW LEVEL SECURITY;

-- Public SELECT policy for testing
CREATE POLICY "Anyone can read word_search_results"
  ON public.word_search_results
  FOR SELECT
  TO public
  USING (true);

-- Public INSERT policy for testing
CREATE POLICY "Anyone can insert word_search_results"
  ON public.word_search_results
  FOR INSERT
  TO public
  WITH CHECK (true);