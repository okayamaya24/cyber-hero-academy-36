-- Class code + picture password login for students.
--
-- Kids log in with: class code → tap their hero → tap 2 secret pictures.
-- The class-login edge function (service role) does the checking; kids
-- never read these tables directly.

-- 1. Class login codes ------------------------------------------------------

-- 6 characters, skipping look-alikes (0/O, 1/I/L) so kids can copy them easily
CREATE OR REPLACE FUNCTION public.generate_class_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
DECLARE
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.classes WHERE login_code = code);
  END LOOP;
  RETURN code;
END;
$$;

ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS login_code text;

UPDATE public.classes SET login_code = public.generate_class_code() WHERE login_code IS NULL;

ALTER TABLE public.classes
  ALTER COLUMN login_code SET DEFAULT public.generate_class_code(),
  ALTER COLUMN login_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS classes_login_code_key ON public.classes (login_code);

-- 2. Student picture passwords ----------------------------------------------

CREATE TABLE IF NOT EXISTS public.student_picture_passwords (
  child_id uuid PRIMARY KEY REFERENCES public.child_profiles (id) ON DELETE CASCADE,
  -- Two picture ids in order, e.g. 'dog,pizza' (see src/lib/picturePassword.ts)
  pictures text NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_picture_passwords ENABLE ROW LEVEL SECURITY;

-- Only the student's own teacher/parent can see or set their pictures.
-- No policy for kids: they can't read anyone's pictures, including their own.
CREATE POLICY "Teachers can view their students' picture passwords"
ON public.student_picture_passwords
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.child_profiles c
  WHERE c.id = student_picture_passwords.child_id AND c.parent_id = auth.uid()
));

CREATE POLICY "Teachers can create their students' picture passwords"
ON public.student_picture_passwords
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.child_profiles c
  WHERE c.id = student_picture_passwords.child_id AND c.parent_id = auth.uid()
));

CREATE POLICY "Teachers can update their students' picture passwords"
ON public.student_picture_passwords
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.child_profiles c
  WHERE c.id = student_picture_passwords.child_id AND c.parent_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.child_profiles c
  WHERE c.id = student_picture_passwords.child_id AND c.parent_id = auth.uid()
));