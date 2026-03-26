/*
  # Fix Remaining Security and Performance Issues

  ## Performance Optimizations
  1. Add missing indexes on foreign key columns for better query performance
     - admissions.contact_id
     - appointments.contact_id
     - enquiries.contact_id
     - interactions.contact_id
     - profiles.created_by

  ## Security Improvements
  1. Consolidate multiple permissive policies on profiles table
  2. Consolidate multiple permissive policies on user_permissions table
  
  ## Note on "Always True" Policies
  - The public insert policies for admissions, appointments, contacts, and enquiries
    are intentionally permissive to allow anonymous form submissions
  - This is by design for public-facing forms (contact forms, appointment booking, etc.)
  
  ## Note on Auth DB Connection Strategy
  - This is a Supabase project configuration setting that can only be changed
    through the Supabase Dashboard (Project Settings > Database > Connection Pooling)
  - Cannot be modified via SQL migration

  ## Note on Leaked Password Protection
  - This is a Supabase Auth configuration setting that can only be changed
    through the Supabase Dashboard (Authentication > Policies)
  - Cannot be modified via SQL migration
*/

-- =====================================================
-- STEP 1: Add missing foreign key indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_admissions_contact_id 
  ON public.admissions(contact_id);

CREATE INDEX IF NOT EXISTS idx_appointments_contact_id 
  ON public.appointments(contact_id);

CREATE INDEX IF NOT EXISTS idx_enquiries_contact_id 
  ON public.enquiries(contact_id);

CREATE INDEX IF NOT EXISTS idx_interactions_contact_id 
  ON public.interactions(contact_id);

CREATE INDEX IF NOT EXISTS idx_profiles_created_by 
  ON public.profiles(created_by);

-- =====================================================
-- STEP 2: Fix PROFILES table - consolidate policies
-- =====================================================

-- Drop old policies that create conflicts
DROP POLICY IF EXISTS "Admins can manage non-admin profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins have full access to profiles" ON public.profiles;

-- Drop the policies we created in the last migration
DROP POLICY IF EXISTS "Super admins have full access" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage non-super-admin profiles" ON public.profiles;

-- Recreate with better names to avoid conflicts
CREATE POLICY "Super admin full access"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    public.get_user_role((SELECT auth.uid())) = 'super_admin'
  )
  WITH CHECK (
    public.get_user_role((SELECT auth.uid())) = 'super_admin'
  );

CREATE POLICY "Admin manage user profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    public.get_user_role((SELECT auth.uid())) = 'admin'
    AND role NOT IN ('admin', 'super_admin')
  )
  WITH CHECK (
    public.get_user_role((SELECT auth.uid())) = 'admin'
    AND role NOT IN ('admin', 'super_admin')
  );

-- =====================================================
-- STEP 3: Fix USER_PERMISSIONS table - consolidate policies
-- =====================================================

-- Drop old conflicting policies
DROP POLICY IF EXISTS "Admins can manage user permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can manage all permissions" ON public.user_permissions;

-- Recreate as single policy
CREATE POLICY "Admins manage permissions"
  ON public.user_permissions FOR ALL
  TO authenticated
  USING (
    public.get_user_role((SELECT auth.uid())) IN ('admin', 'super_admin')
  )
  WITH CHECK (
    public.get_user_role((SELECT auth.uid())) IN ('admin', 'super_admin')
  );