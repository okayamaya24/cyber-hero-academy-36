CREATE TABLE public.crossword_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier TEXT NOT NULL,
  topic TEXT NOT NULL,
  puzzle_title TEXT NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  stars TEXT,
  hints_used INTEGER NOT NULL DEFAULT 0,
  completion_time INTEGER NOT NULL DEFAULT 0,
  words_placed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crossword_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read crossword results"
ON public.crossword_results
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone authenticated can insert crossword results"
ON public.crossword_results
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE INDEX idx_crossword_results_created_at ON public.crossword_results(created_at DESC);