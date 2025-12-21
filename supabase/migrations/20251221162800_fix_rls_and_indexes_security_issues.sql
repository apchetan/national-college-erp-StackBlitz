/*
  # Fix Critical Security and Performance Issues
  
  ## Changes Made
  
  ### 1. Enable RLS on Public Tables
  - Enable RLS on contacts, enquiries, appointments, admissions tables
  - Add policies to allow authenticated users to perform operations
  
  ### 2. Add Missing Foreign Key Indexes
  - Add index on profiles.created_by
  - Add index on student_status.created_by
  - Add index on student_status.updated_by
  
  ### 3. Fix Auth RLS Initialization (Performance)
  - Replace auth.uid() with (select auth.uid()) in all RLS policies
  - This prevents re-evaluation for each row, improving performance
  
  ### 4. Fix Function Search Paths
  - Set search_path to 'public' for all functions to prevent security issues
  
  ### 5. Drop Unused Indexes
  - Remove indexes that are not being used to improve write performance
  
  ## Security Notes
  - All tables now have RLS enabled
  - Foreign keys are properly indexed for performance
  - Functions have secure search paths
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_created_by 
  ON public.profiles(created_by);

CREATE INDEX IF NOT EXISTS idx_student_status_created_by 
  ON public.student_status(created_by);

CREATE INDEX IF NOT EXISTS idx_student_status_updated_by 
  ON public.student_status(updated_by);

-- =====================================================
-- 2. ENABLE RLS ON PUBLIC TABLES
-- =====================================================

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CREATE RLS POLICIES FOR PUBLIC TABLES
-- =====================================================

-- Contacts policies
CREATE POLICY "Authenticated users can view contacts"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert contacts"
  ON public.contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contacts"
  ON public.contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contacts"
  ON public.contacts FOR DELETE
  TO authenticated
  USING (true);

-- Enquiries policies
CREATE POLICY "Authenticated users can view enquiries"
  ON public.enquiries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert enquiries"
  ON public.enquiries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update enquiries"
  ON public.enquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete enquiries"
  ON public.enquiries FOR DELETE
  TO authenticated
  USING (true);

-- Appointments policies
CREATE POLICY "Authenticated users can view appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete appointments"
  ON public.appointments FOR DELETE
  TO authenticated
  USING (true);

-- Admissions policies
CREATE POLICY "Authenticated users can view admissions"
  ON public.admissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert admissions"
  ON public.admissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update admissions"
  ON public.admissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete admissions"
  ON public.admissions FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- 4. FIX AUTH RLS INITIALIZATION ISSUES
-- =====================================================

-- Drop and recreate profiles policies with optimized auth.uid()
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

-- Drop and recreate user_permissions policies with optimized auth.uid()
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
CREATE POLICY "Users can view own permissions"
  ON public.user_permissions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate student_status policies with optimized auth.uid()
DROP POLICY IF EXISTS "Users can view student status" ON public.student_status;
CREATE POLICY "Users can view student status"
  ON public.student_status FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'student_status', 'select')
    )
  );

DROP POLICY IF EXISTS "Users can insert student status" ON public.student_status;
CREATE POLICY "Users can insert student status"
  ON public.student_status FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'student_status', 'insert')
    )
  );

DROP POLICY IF EXISTS "Users can update student status" ON public.student_status;
CREATE POLICY "Users can update student status"
  ON public.student_status FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'student_status', 'update')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'student_status', 'update')
    )
  );

DROP POLICY IF EXISTS "Users can delete student status" ON public.student_status;
CREATE POLICY "Users can delete student status"
  ON public.student_status FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'student_status', 'delete')
    )
  );

-- =====================================================
-- 5. FIX FUNCTION SEARCH PATHS
-- =====================================================

ALTER FUNCTION public.update_student_status_updated_at() 
  SET search_path = public;

ALTER FUNCTION public.update_payments_updated_at() 
  SET search_path = public;

ALTER FUNCTION public.handle_new_user() 
  SET search_path = public;

ALTER FUNCTION public.update_updated_at_column() 
  SET search_path = public;

-- =====================================================
-- 6. DROP UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS public.idx_profiles_role;
DROP INDEX IF EXISTS public.idx_profiles_email;
DROP INDEX IF EXISTS public.idx_user_permissions_user_id;
DROP INDEX IF EXISTS public.idx_student_status_contact_id;
DROP INDEX IF EXISTS public.idx_student_status_program;
DROP INDEX IF EXISTS public.idx_student_status_created_at;
DROP INDEX IF EXISTS public.idx_payments_admission_id;
DROP INDEX IF EXISTS public.idx_support_forms_contact_id;
DROP INDEX IF EXISTS public.idx_support_forms_status;
DROP INDEX IF EXISTS public.idx_interactions_contact_id;
DROP INDEX IF EXISTS public.idx_contacts_status;
DROP INDEX IF EXISTS public.idx_enquiries_status;
DROP INDEX IF EXISTS public.idx_appointments_contact_id;
DROP INDEX IF EXISTS public.idx_appointments_status;
DROP INDEX IF EXISTS public.idx_admissions_status;
