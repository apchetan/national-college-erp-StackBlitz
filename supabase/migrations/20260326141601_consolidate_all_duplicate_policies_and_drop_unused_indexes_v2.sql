/*
  # Consolidate All Duplicate Policies and Drop Unused Indexes

  ## Changes Made
  
  ### 1. Drop Unused Indexes
  - Remove indexes that aren't being used by queries
  - These were added in previous migration but aren't needed yet
  
  ### 2. Consolidate Duplicate Policies
  - Fix admissions table (4 duplicates)
  - Fix appointments table (5 duplicates)
  - Fix contacts table (5 duplicates)
  - Fix enquiries table (5 duplicates)
  - Fix interactions table (3 duplicates)
  - Fix profiles table (4 duplicates)
  - Fix user_permissions table (4 duplicates)

  ## Notes
  - Public insert policies for forms are intentionally permissive (by design)
  - Auth DB Connection Strategy must be configured in Supabase Dashboard
  - Leaked Password Protection must be enabled in Supabase Dashboard
*/

-- =====================================================
-- STEP 1: Drop unused indexes
-- =====================================================

DROP INDEX IF EXISTS public.idx_admissions_contact_id;
DROP INDEX IF EXISTS public.idx_appointments_contact_id;
DROP INDEX IF EXISTS public.idx_enquiries_contact_id;
DROP INDEX IF EXISTS public.idx_interactions_contact_id;
DROP INDEX IF EXISTS public.idx_profiles_created_by;

-- =====================================================
-- STEP 2: Fix ADMISSIONS table policies
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can view admissions with permissions" ON public.admissions;
DROP POLICY IF EXISTS "Users can view admissions" ON public.admissions;
DROP POLICY IF EXISTS "Users can view admissions based on permissions" ON public.admissions;
DROP POLICY IF EXISTS "Authenticated users can create admissions with permissions" ON public.admissions;
DROP POLICY IF EXISTS "Users can create admissions" ON public.admissions;
DROP POLICY IF EXISTS "Users can create admissions based on permissions" ON public.admissions;
DROP POLICY IF EXISTS "Authenticated users can update admissions with permissions" ON public.admissions;
DROP POLICY IF EXISTS "Users can update admissions based on permissions" ON public.admissions;
DROP POLICY IF EXISTS "Authenticated users can delete admissions with permissions" ON public.admissions;
DROP POLICY IF EXISTS "Users can delete admissions" ON public.admissions;
DROP POLICY IF EXISTS "Users can delete admissions based on permissions" ON public.admissions;

-- Create single consolidated policy for each action
CREATE POLICY "Admissions select policy"
  ON public.admissions FOR SELECT
  TO authenticated
  USING (has_permission(auth.uid(), 'admissions', 'view'));

CREATE POLICY "Admissions insert policy"
  ON public.admissions FOR INSERT
  TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'admissions', 'create'));

CREATE POLICY "Admissions update policy"
  ON public.admissions FOR UPDATE
  TO authenticated
  USING (has_permission(auth.uid(), 'admissions', 'edit'))
  WITH CHECK (has_permission(auth.uid(), 'admissions', 'edit'));

CREATE POLICY "Admissions delete policy"
  ON public.admissions FOR DELETE
  TO authenticated
  USING (has_permission(auth.uid(), 'admissions', 'delete'));

-- =====================================================
-- STEP 3: Fix APPOINTMENTS table policies
-- =====================================================

-- Drop duplicate public policies
DROP POLICY IF EXISTS "Public can book appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public can create appointments" ON public.appointments;

-- Drop all authenticated policies
DROP POLICY IF EXISTS "Authenticated users can view appointments with permissions" ON public.appointments;
DROP POLICY IF EXISTS "Users can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can view appointments based on permissions" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can create appointments with permissions" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments based on permissions" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments with permissions" ON public.appointments;
DROP POLICY IF EXISTS "Users can update appointments based on permissions" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments with permissions" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete appointments based on permissions" ON public.appointments;

-- Create consolidated policies
CREATE POLICY "Appointments public insert"
  ON public.appointments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Appointments select policy"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (has_permission(auth.uid(), 'appointments', 'view'));

CREATE POLICY "Appointments insert policy"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'appointments', 'create'));

CREATE POLICY "Appointments update policy"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (has_permission(auth.uid(), 'appointments', 'edit'))
  WITH CHECK (has_permission(auth.uid(), 'appointments', 'edit'));

CREATE POLICY "Appointments delete policy"
  ON public.appointments FOR DELETE
  TO authenticated
  USING (has_permission(auth.uid(), 'appointments', 'delete'));

-- =====================================================
-- STEP 4: Fix CONTACTS table policies
-- =====================================================

-- Drop duplicate public policies
DROP POLICY IF EXISTS "Public can create contacts" ON public.contacts;
DROP POLICY IF EXISTS "Public can submit contact forms" ON public.contacts;

-- Drop all authenticated policies
DROP POLICY IF EXISTS "Authenticated users can view contacts with permissions" ON public.contacts;
DROP POLICY IF EXISTS "Users can view contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can view contacts based on permissions" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can create contacts with permissions" ON public.contacts;
DROP POLICY IF EXISTS "Users can create contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can create contacts based on permissions" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can update contacts with permissions" ON public.contacts;
DROP POLICY IF EXISTS "Users can update contacts based on permissions" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can delete contacts with permissions" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete contacts based on permissions" ON public.contacts;

-- Create consolidated policies
CREATE POLICY "Contacts public insert"
  ON public.contacts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Contacts select policy"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (has_permission(auth.uid(), 'contacts', 'view'));

CREATE POLICY "Contacts insert policy"
  ON public.contacts FOR INSERT
  TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'contacts', 'create'));

CREATE POLICY "Contacts update policy"
  ON public.contacts FOR UPDATE
  TO authenticated
  USING (has_permission(auth.uid(), 'contacts', 'edit'))
  WITH CHECK (has_permission(auth.uid(), 'contacts', 'edit'));

CREATE POLICY "Contacts delete policy"
  ON public.contacts FOR DELETE
  TO authenticated
  USING (has_permission(auth.uid(), 'contacts', 'delete'));

-- =====================================================
-- STEP 5: Fix ENQUIRIES table policies
-- =====================================================

-- Drop duplicate public policies
DROP POLICY IF EXISTS "Public can create enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Public can submit enquiry forms" ON public.enquiries;

-- Drop all authenticated policies
DROP POLICY IF EXISTS "Authenticated users can view enquiries with permissions" ON public.enquiries;
DROP POLICY IF EXISTS "Users can view enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Users can view enquiries based on permissions" ON public.enquiries;
DROP POLICY IF EXISTS "Authenticated users can create enquiries with permissions" ON public.enquiries;
DROP POLICY IF EXISTS "Users can create enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Users can create enquiries based on permissions" ON public.enquiries;
DROP POLICY IF EXISTS "Authenticated users can update enquiries with permissions" ON public.enquiries;
DROP POLICY IF EXISTS "Users can update enquiries based on permissions" ON public.enquiries;
DROP POLICY IF EXISTS "Authenticated users can delete enquiries with permissions" ON public.enquiries;
DROP POLICY IF EXISTS "Users can delete enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Users can delete enquiries based on permissions" ON public.enquiries;

-- Create consolidated policies
CREATE POLICY "Enquiries public insert"
  ON public.enquiries FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enquiries select policy"
  ON public.enquiries FOR SELECT
  TO authenticated
  USING (has_permission(auth.uid(), 'enquiries', 'view'));

CREATE POLICY "Enquiries insert policy"
  ON public.enquiries FOR INSERT
  TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'enquiries', 'create'));

CREATE POLICY "Enquiries update policy"
  ON public.enquiries FOR UPDATE
  TO authenticated
  USING (has_permission(auth.uid(), 'enquiries', 'edit'))
  WITH CHECK (has_permission(auth.uid(), 'enquiries', 'edit'));

CREATE POLICY "Enquiries delete policy"
  ON public.enquiries FOR DELETE
  TO authenticated
  USING (has_permission(auth.uid(), 'enquiries', 'delete'));

-- =====================================================
-- STEP 6: Fix INTERACTIONS table policies
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can view interactions with permissions" ON public.interactions;
DROP POLICY IF EXISTS "Users can view interactions" ON public.interactions;
DROP POLICY IF EXISTS "Users can view interactions based on permissions" ON public.interactions;
DROP POLICY IF EXISTS "Authenticated users can create interactions with permissions" ON public.interactions;
DROP POLICY IF EXISTS "Users can create interactions" ON public.interactions;
DROP POLICY IF EXISTS "Users can create interactions based on permissions" ON public.interactions;
DROP POLICY IF EXISTS "Authenticated users can delete interactions with permissions" ON public.interactions;
DROP POLICY IF EXISTS "Users can delete interactions" ON public.interactions;
DROP POLICY IF EXISTS "Users can delete interactions based on permissions" ON public.interactions;

-- Create consolidated policies
CREATE POLICY "Interactions select policy"
  ON public.interactions FOR SELECT
  TO authenticated
  USING (has_permission(auth.uid(), 'interactions', 'view'));

CREATE POLICY "Interactions insert policy"
  ON public.interactions FOR INSERT
  TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'interactions', 'create'));

CREATE POLICY "Interactions delete policy"
  ON public.interactions FOR DELETE
  TO authenticated
  USING (has_permission(auth.uid(), 'interactions', 'delete'));

-- =====================================================
-- STEP 7: Fix PROFILES table policies
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Super admin full access" ON public.profiles;
DROP POLICY IF EXISTS "Admin manage user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create single consolidated policy for each action
CREATE POLICY "Profiles select policy"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

CREATE POLICY "Profiles insert policy"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'super_admin'
    OR (
      public.get_user_role(auth.uid()) = 'admin'
      AND role NOT IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Profiles update policy"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR public.get_user_role(auth.uid()) = 'super_admin'
    OR (
      public.get_user_role(auth.uid()) = 'admin'
      AND role NOT IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR public.get_user_role(auth.uid()) = 'super_admin'
    OR (
      public.get_user_role(auth.uid()) = 'admin'
      AND role NOT IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Profiles delete policy"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'super_admin'
    OR (
      public.get_user_role(auth.uid()) = 'admin'
      AND role NOT IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- STEP 8: Fix USER_PERMISSIONS table policies
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins manage permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Super admins can manage all permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;

-- Create consolidated policies
CREATE POLICY "User permissions select policy"
  ON public.user_permissions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

CREATE POLICY "User permissions insert policy"
  ON public.user_permissions FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "User permissions update policy"
  ON public.user_permissions FOR UPDATE
  TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'))
  WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "User permissions delete policy"
  ON public.user_permissions FOR DELETE
  TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));