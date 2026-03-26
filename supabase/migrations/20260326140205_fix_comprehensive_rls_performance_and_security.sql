/*
  # Fix Comprehensive RLS Performance and Security Issues
  
  This migration addresses multiple security and performance issues:
  
  ## 1. RLS Performance Optimization
  - Wraps all `auth.uid()` calls in SELECT subqueries to prevent re-evaluation per row
  - Applies to all tables: enquiries, appointments, contacts, interactions, admissions, user_permissions, profiles
  
  ## 2. Remove Overly Permissive Policies
  - Drops policies with `USING (true)` that bypass RLS
  - Removes duplicate permissive policies that create OR conditions
  - Ensures proper permission-based access control
  
  ## 3. Function Security
  - Sets explicit search_path on all functions to prevent security issues
  
  ## 4. Index Cleanup
  - Drops unused indexes to reduce maintenance overhead
  
  ## Security Changes
  - All tables now require proper authentication and permissions
  - Anonymous users can only insert contacts/enquiries/appointments/admissions (public forms)
  - Authenticated users require specific permissions for all operations
  - Super admins maintain full access
*/

-- =====================================================
-- STEP 1: Drop all existing RLS policies
-- =====================================================

-- Enquiries policies
DROP POLICY IF EXISTS "Anyone can insert enquiries" ON enquiries;
DROP POLICY IF EXISTS "Authenticated users can delete enquiries" ON enquiries;
DROP POLICY IF EXISTS "Authenticated users can update enquiries" ON enquiries;
DROP POLICY IF EXISTS "Users can view enquiries based on permissions" ON enquiries;
DROP POLICY IF EXISTS "Users can create enquiries based on permissions" ON enquiries;
DROP POLICY IF EXISTS "Users can update enquiries based on permissions" ON enquiries;
DROP POLICY IF EXISTS "Users can delete enquiries based on permissions" ON enquiries;

-- Appointments policies
DROP POLICY IF EXISTS "Anyone can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Users can view appointments based on permissions" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments based on permissions" ON appointments;
DROP POLICY IF EXISTS "Users can update appointments based on permissions" ON appointments;
DROP POLICY IF EXISTS "Users can delete appointments based on permissions" ON appointments;

-- Contacts policies
DROP POLICY IF EXISTS "Anyone can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can delete contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can update contacts" ON contacts;
DROP POLICY IF EXISTS "Users can view contacts based on permissions" ON contacts;
DROP POLICY IF EXISTS "Users can create contacts based on permissions" ON contacts;
DROP POLICY IF EXISTS "Users can update contacts based on permissions" ON contacts;
DROP POLICY IF EXISTS "Users can delete contacts based on permissions" ON contacts;

-- Interactions policies
DROP POLICY IF EXISTS "Authenticated users can insert interactions" ON interactions;
DROP POLICY IF EXISTS "Authenticated users can delete interactions" ON interactions;
DROP POLICY IF EXISTS "Users can view interactions based on permissions" ON interactions;
DROP POLICY IF EXISTS "Users can create interactions based on permissions" ON interactions;

-- Admissions policies
DROP POLICY IF EXISTS "Anyone can insert admissions" ON admissions;
DROP POLICY IF EXISTS "Authenticated users can delete admissions" ON admissions;
DROP POLICY IF EXISTS "Authenticated users can update admissions" ON admissions;
DROP POLICY IF EXISTS "Users can view admissions based on permissions" ON admissions;
DROP POLICY IF EXISTS "Users can create admissions based on permissions" ON admissions;
DROP POLICY IF EXISTS "Users can update admissions based on permissions" ON admissions;
DROP POLICY IF EXISTS "Users can delete admissions based on permissions" ON admissions;

-- User permissions policies
DROP POLICY IF EXISTS "Users can view own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can view all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can view permissions based on role" ON user_permissions;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert any profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;

-- =====================================================
-- STEP 2: Create optimized RLS policies with SELECT wrappers
-- =====================================================

-- ENQUIRIES: Anonymous can insert (public form), authenticated need permissions
CREATE POLICY "Public can submit enquiry forms"
  ON enquiries FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view enquiries with permissions"
  ON enquiries FOR SELECT
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'enquiries', 'read'));

CREATE POLICY "Authenticated users can create enquiries with permissions"
  ON enquiries FOR INSERT
  TO authenticated
  WITH CHECK (has_permission((SELECT auth.uid()), 'enquiries', 'create'));

CREATE POLICY "Authenticated users can update enquiries with permissions"
  ON enquiries FOR UPDATE
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'enquiries', 'update'))
  WITH CHECK (has_permission((SELECT auth.uid()), 'enquiries', 'update'));

CREATE POLICY "Authenticated users can delete enquiries with permissions"
  ON enquiries FOR DELETE
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'enquiries', 'delete'));

-- APPOINTMENTS: Anonymous can insert (public booking), authenticated need permissions
CREATE POLICY "Public can book appointments"
  ON appointments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view appointments with permissions"
  ON appointments FOR SELECT
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'appointments', 'read'));

CREATE POLICY "Authenticated users can create appointments with permissions"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (has_permission((SELECT auth.uid()), 'appointments', 'create'));

CREATE POLICY "Authenticated users can update appointments with permissions"
  ON appointments FOR UPDATE
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'appointments', 'update'))
  WITH CHECK (has_permission((SELECT auth.uid()), 'appointments', 'update'));

CREATE POLICY "Authenticated users can delete appointments with permissions"
  ON appointments FOR DELETE
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'appointments', 'delete'));

-- CONTACTS: Anonymous can insert (public form), authenticated need permissions
CREATE POLICY "Public can submit contact forms"
  ON contacts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view contacts with permissions"
  ON contacts FOR SELECT
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'contacts', 'read'));

CREATE POLICY "Authenticated users can create contacts with permissions"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (has_permission((SELECT auth.uid()), 'contacts', 'create'));

CREATE POLICY "Authenticated users can update contacts with permissions"
  ON contacts FOR UPDATE
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'contacts', 'update'))
  WITH CHECK (has_permission((SELECT auth.uid()), 'contacts', 'update'));

CREATE POLICY "Authenticated users can delete contacts with permissions"
  ON contacts FOR DELETE
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'contacts', 'delete'));

-- INTERACTIONS: Authenticated only with permissions
CREATE POLICY "Authenticated users can view interactions with permissions"
  ON interactions FOR SELECT
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'interactions', 'read'));

CREATE POLICY "Authenticated users can create interactions with permissions"
  ON interactions FOR INSERT
  TO authenticated
  WITH CHECK (has_permission((SELECT auth.uid()), 'interactions', 'create'));

CREATE POLICY "Authenticated users can delete interactions with permissions"
  ON interactions FOR DELETE
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'interactions', 'delete'));

-- ADMISSIONS: Anonymous can insert (public form), authenticated need permissions
CREATE POLICY "Public can submit admission forms"
  ON admissions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view admissions with permissions"
  ON admissions FOR SELECT
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'admissions', 'read'));

CREATE POLICY "Authenticated users can create admissions with permissions"
  ON admissions FOR INSERT
  TO authenticated
  WITH CHECK (has_permission((SELECT auth.uid()), 'admissions', 'create'));

CREATE POLICY "Authenticated users can update admissions with permissions"
  ON admissions FOR UPDATE
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'admissions', 'update'))
  WITH CHECK (has_permission((SELECT auth.uid()), 'admissions', 'update'));

CREATE POLICY "Authenticated users can delete admissions with permissions"
  ON admissions FOR DELETE
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'admissions', 'delete'));

-- USER_PERMISSIONS: View own permissions or if admin/super_admin
CREATE POLICY "Users can view own permissions"
  ON user_permissions FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    has_permission((SELECT auth.uid()), 'user_permissions', 'read')
  );

CREATE POLICY "Admins can manage user permissions"
  ON user_permissions FOR ALL
  TO authenticated
  USING (has_permission((SELECT auth.uid()), 'user_permissions', 'update'))
  WITH CHECK (has_permission((SELECT auth.uid()), 'user_permissions', 'update'));

-- PROFILES: Complex policies for self, admin, and super_admin access
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (
    id = (SELECT auth.uid()) AND
    role = (SELECT role FROM profiles WHERE id = (SELECT auth.uid()))
  );

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage non-admin profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p1
      WHERE p1.id = (SELECT auth.uid())
      AND p1.role = 'admin'
    )
    AND role NOT IN ('admin', 'super_admin')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p1
      WHERE p1.id = (SELECT auth.uid())
      AND p1.role = 'admin'
    )
    AND role NOT IN ('admin', 'super_admin')
  );

CREATE POLICY "Super admins have full access to profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'super_admin'
    )
  );

-- =====================================================
-- STEP 3: Fix function search paths
-- =====================================================

CREATE OR REPLACE FUNCTION prevent_role_self_modification()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.id = auth.uid() AND OLD.role <> NEW.role THEN
    RAISE EXCEPTION 'Users cannot modify their own role';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION log_interaction()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO interactions (contact_id, type, notes, created_by)
  VALUES (NEW.id, 'created', 'Contact created', auth.uid());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 4: Drop unused indexes
-- =====================================================

DROP INDEX IF EXISTS idx_admissions_contact_id;
DROP INDEX IF EXISTS idx_admissions_status;
DROP INDEX IF EXISTS idx_contacts_email;
DROP INDEX IF EXISTS idx_contacts_status;
DROP INDEX IF EXISTS idx_enquiries_contact_id;
DROP INDEX IF EXISTS idx_enquiries_status;
DROP INDEX IF EXISTS idx_appointments_contact_id;
DROP INDEX IF EXISTS idx_appointments_status;
DROP INDEX IF EXISTS idx_interactions_contact_id;
DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_user_permissions_resource;
DROP INDEX IF EXISTS idx_profiles_created_by;
