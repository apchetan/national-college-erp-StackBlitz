/*
  # Fix Security and Performance Issues

  1. Missing Indexes
    - Add indexes for foreign keys on `student_status` table:
      - `created_by` column
      - `updated_by` column

  2. RLS Policy Optimization
    - Update RLS policies to use `(select auth.uid())` instead of `auth.uid()` for better performance
    - Affects policies on:
      - `profiles` table (2 policies)
      - `student_status` table (4 policies)

  3. Function Search Path Security
    - Fix mutable search_path for trigger functions:
      - `update_student_status_updated_at`
      - `update_payments_updated_at`

  Note: Some issues require Supabase dashboard configuration:
  - Auth DB Connection Strategy (switch to percentage-based)
  - Leaked Password Protection (enable in Auth settings)
*/

-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_student_status_created_by ON public.student_status(created_by);
CREATE INDEX IF NOT EXISTS idx_student_status_updated_by ON public.student_status(updated_by);

-- Drop and recreate profiles RLS policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- Drop and recreate student_status RLS policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view student status" ON public.student_status;
DROP POLICY IF EXISTS "Users can insert student status" ON public.student_status;
DROP POLICY IF EXISTS "Users can update student status" ON public.student_status;
DROP POLICY IF EXISTS "Users can delete student status" ON public.student_status;

CREATE POLICY "Users can view student status"
  ON public.student_status
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users can insert student status"
  ON public.student_status
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users can update student status"
  ON public.student_status
  FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users can delete student status"
  ON public.student_status
  FOR DELETE
  TO authenticated
  USING (
    (select auth.uid()) IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'staff')
    )
  );

-- Fix search_path for trigger functions by recreating them with SECURITY DEFINER and explicit schema
-- Drop triggers first, then functions
DROP TRIGGER IF EXISTS student_status_updated_at ON public.student_status;
DROP FUNCTION IF EXISTS public.update_student_status_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_student_status_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER student_status_updated_at
  BEFORE UPDATE ON public.student_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_status_updated_at();

DROP TRIGGER IF EXISTS payments_updated_at ON public.payments;
DROP FUNCTION IF EXISTS public.update_payments_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_payments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payments_updated_at();