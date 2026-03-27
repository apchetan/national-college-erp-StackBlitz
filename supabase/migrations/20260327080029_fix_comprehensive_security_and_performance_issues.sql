/*
  # Comprehensive Security and Performance Fixes

  ## Overview
  This migration addresses critical security and performance issues identified in the database audit.

  ## Changes Made

  ### 1. Performance Improvements - Add Missing Indexes
  - Add index on `admissions.contact_id` (foreign key)
  - Add index on `appointments.contact_id` (foreign key)
  - Add index on `enquiries.contact_id` (foreign key)
  - Add index on `interactions.contact_id` (foreign key)
  - Add index on `profiles.created_by` (foreign key)

  ### 2. RLS Policy Optimization - Fix Auth Function Calls
  All RLS policies updated to use `(select auth.uid())` instead of `auth.uid()` to prevent
  re-evaluation for each row, significantly improving query performance at scale.
  
  Tables affected:
  - contacts (select, insert, update, delete policies)
  - enquiries (select, insert, update, delete policies)
  - appointments (select, insert, update, delete policies)
  - admissions (select, insert, update, delete policies)
  - interactions (select, insert, delete policies)
  - profiles (select, insert, update, delete policies)
  - user_permissions (select, insert, update, delete policies)

  ### 3. Remove Duplicate Permissive Policies
  Consolidate duplicate policies for UPDATE operations:
  - admissions: Keep "Admissions update policy", remove "Users can update admissions"
  - appointments: Keep "Appointments update policy", remove "Users can update appointments"
  - contacts: Keep "Contacts update policy", remove "Users can update contacts"
  - enquiries: Keep "Enquiries update policy", remove "Users can update enquiries"

  ### 4. Public Insert Policies (Intentional)
  The "always true" policies for INSERT operations on contacts, enquiries, appointments, and admissions
  are intentional and required for public form submissions. These policies allow anonymous users to
  submit enquiry forms, book appointments, and register without authentication.

  ## Security Notes
  - All policies maintain proper authentication and authorization checks
  - Public insert policies are necessary for customer-facing forms
  - Performance improvements do not compromise security
*/

-- =====================================================
-- PART 1: ADD MISSING INDEXES FOR FOREIGN KEYS
-- =====================================================

-- Add index for admissions.contact_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'admissions' AND indexname = 'idx_admissions_contact_id'
  ) THEN
    CREATE INDEX idx_admissions_contact_id ON public.admissions(contact_id);
  END IF;
END $$;

-- Add index for appointments.contact_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'appointments' AND indexname = 'idx_appointments_contact_id'
  ) THEN
    CREATE INDEX idx_appointments_contact_id ON public.appointments(contact_id);
  END IF;
END $$;

-- Add index for enquiries.contact_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'enquiries' AND indexname = 'idx_enquiries_contact_id'
  ) THEN
    CREATE INDEX idx_enquiries_contact_id ON public.enquiries(contact_id);
  END IF;
END $$;

-- Add index for interactions.contact_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'interactions' AND indexname = 'idx_interactions_contact_id'
  ) THEN
    CREATE INDEX idx_interactions_contact_id ON public.interactions(contact_id);
  END IF;
END $$;

-- Add index for profiles.created_by if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_created_by'
  ) THEN
    CREATE INDEX idx_profiles_created_by ON public.profiles(created_by);
  END IF;
END $$;

-- =====================================================
-- PART 2: DROP DUPLICATE PERMISSIVE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can update admissions" ON public.admissions;
DROP POLICY IF EXISTS "Users can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update enquiries" ON public.enquiries;

-- =====================================================
-- PART 3: FIX CONTACTS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Contacts select policy" ON public.contacts;
DROP POLICY IF EXISTS "Contacts insert policy" ON public.contacts;
DROP POLICY IF EXISTS "Contacts update policy" ON public.contacts;
DROP POLICY IF EXISTS "Contacts delete policy" ON public.contacts;

-- Recreate with optimized auth function calls
CREATE POLICY "Contacts select policy"
  ON public.contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'contacts', 'read')
    )
  );

CREATE POLICY "Contacts insert policy"
  ON public.contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'contacts', 'create')
    )
  );

CREATE POLICY "Contacts update policy"
  ON public.contacts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'contacts', 'update')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'contacts', 'update')
    )
  );

CREATE POLICY "Contacts delete policy"
  ON public.contacts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'contacts', 'delete')
    )
  );

-- =====================================================
-- PART 4: FIX ENQUIRIES TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enquiries select policy" ON public.enquiries;
DROP POLICY IF EXISTS "Enquiries insert policy" ON public.enquiries;
DROP POLICY IF EXISTS "Enquiries update policy" ON public.enquiries;
DROP POLICY IF EXISTS "Enquiries delete policy" ON public.enquiries;

-- Recreate with optimized auth function calls
CREATE POLICY "Enquiries select policy"
  ON public.enquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'enquiries', 'read')
    )
  );

CREATE POLICY "Enquiries insert policy"
  ON public.enquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'enquiries', 'create')
    )
  );

CREATE POLICY "Enquiries update policy"
  ON public.enquiries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'enquiries', 'update')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'enquiries', 'update')
    )
  );

CREATE POLICY "Enquiries delete policy"
  ON public.enquiries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'enquiries', 'delete')
    )
  );

-- =====================================================
-- PART 5: FIX APPOINTMENTS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Appointments select policy" ON public.appointments;
DROP POLICY IF EXISTS "Appointments insert policy" ON public.appointments;
DROP POLICY IF EXISTS "Appointments update policy" ON public.appointments;
DROP POLICY IF EXISTS "Appointments delete policy" ON public.appointments;

-- Recreate with optimized auth function calls
CREATE POLICY "Appointments select policy"
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'appointments', 'read')
    )
  );

CREATE POLICY "Appointments insert policy"
  ON public.appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'appointments', 'create')
    )
  );

CREATE POLICY "Appointments update policy"
  ON public.appointments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'appointments', 'update')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'appointments', 'update')
    )
  );

CREATE POLICY "Appointments delete policy"
  ON public.appointments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'appointments', 'delete')
    )
  );

-- =====================================================
-- PART 6: FIX ADMISSIONS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admissions select policy" ON public.admissions;
DROP POLICY IF EXISTS "Admissions insert policy" ON public.admissions;
DROP POLICY IF EXISTS "Admissions update policy" ON public.admissions;
DROP POLICY IF EXISTS "Admissions delete policy" ON public.admissions;

-- Recreate with optimized auth function calls
CREATE POLICY "Admissions select policy"
  ON public.admissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'admissions', 'read')
    )
  );

CREATE POLICY "Admissions insert policy"
  ON public.admissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'admissions', 'create')
    )
  );

CREATE POLICY "Admissions update policy"
  ON public.admissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'admissions', 'update')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'admissions', 'update')
    )
  );

CREATE POLICY "Admissions delete policy"
  ON public.admissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'admissions', 'delete')
    )
  );

-- =====================================================
-- PART 7: FIX INTERACTIONS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Interactions select policy" ON public.interactions;
DROP POLICY IF EXISTS "Interactions insert policy" ON public.interactions;
DROP POLICY IF EXISTS "Interactions delete policy" ON public.interactions;

-- Recreate with optimized auth function calls
CREATE POLICY "Interactions select policy"
  ON public.interactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'interactions', 'read')
    )
  );

CREATE POLICY "Interactions insert policy"
  ON public.interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'interactions', 'create')
    )
  );

CREATE POLICY "Interactions delete policy"
  ON public.interactions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'interactions', 'delete')
    )
  );

-- =====================================================
-- PART 8: FIX PROFILES TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;

-- Recreate with optimized auth function calls
CREATE POLICY "Profiles select policy"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'profiles', 'read')
    )
  );

CREATE POLICY "Profiles insert policy"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'profiles', 'create')
    )
  );

CREATE POLICY "Profiles update policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'profiles', 'update')
    )
  )
  WITH CHECK (
    id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'profiles', 'update')
    )
  );

CREATE POLICY "Profiles delete policy"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'profiles', 'delete')
    )
  );

-- =====================================================
-- PART 9: FIX USER_PERMISSIONS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "User permissions select policy" ON public.user_permissions;
DROP POLICY IF EXISTS "User permissions insert policy" ON public.user_permissions;
DROP POLICY IF EXISTS "User permissions update policy" ON public.user_permissions;
DROP POLICY IF EXISTS "User permissions delete policy" ON public.user_permissions;

-- Recreate with optimized auth function calls
CREATE POLICY "User permissions select policy"
  ON public.user_permissions
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'user_permissions', 'read')
    )
  );

CREATE POLICY "User permissions insert policy"
  ON public.user_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'user_permissions', 'create')
    )
  );

CREATE POLICY "User permissions update policy"
  ON public.user_permissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'user_permissions', 'update')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'user_permissions', 'update')
    )
  );

CREATE POLICY "User permissions delete policy"
  ON public.user_permissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.has_permission((select auth.uid()), 'user_permissions', 'delete')
    )
  );
