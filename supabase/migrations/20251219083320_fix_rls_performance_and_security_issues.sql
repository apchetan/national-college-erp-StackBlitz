/*
  # Fix RLS Performance and Security Issues

  ## Problems Identified
  1. RLS policies using `auth.uid()` directly causes re-evaluation for each row (performance issue)
  2. Functions have mutable search_path (security vulnerability)
  3. Unused indexes consuming storage and slowing down writes

  ## Solutions Applied

  ### 1. RLS Performance Optimization
  Replace `auth.uid()` with `(select auth.uid())` in all policies to cache the value
  and avoid re-evaluation for each row.

  ### 2. Function Security
  Add explicit `SET search_path = public, pg_temp` to all security definer functions
  to prevent search path hijacking attacks.

  ### 3. Index Cleanup
  Drop indexes that are not being used to improve write performance and reduce storage.

  ## Changes Made
  - Updated all RLS policies on profiles table
  - Updated all RLS policies on user_permissions table
  - Fixed search_path for is_super_admin, prevent_privilege_escalation, and has_permission functions
  - Dropped unused indexes

  ## Security Notes
  - Multiple permissive policies per table are intentional (they work as OR conditions)
  - All policies remain restrictive by default
  - Function security improved with explicit search_path
*/

-- =====================================================
-- PART 1: Fix Function Search Paths (Security Issue)
-- =====================================================

-- Fix is_super_admin function
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role text;
  v_is_active boolean;
BEGIN
  SELECT role, is_active INTO v_role, v_is_active
  FROM profiles
  WHERE id = p_user_id;
  
  RETURN v_role = 'super_admin' AND v_is_active = true;
END;
$$;

-- Fix prevent_privilege_escalation function
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Get the current user's role
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Super admins can do anything
  IF current_user_role = 'super_admin' THEN
    RETURN NEW;
  END IF;
  
  -- Regular admins cannot create or modify super_admin or admin roles
  IF current_user_role = 'admin' THEN
    IF NEW.role IN ('super_admin', 'admin') THEN
      RAISE EXCEPTION 'Admins cannot create or modify super_admin or admin roles';
    END IF;
    RETURN NEW;
  END IF;
  
  -- Non-admins cannot modify roles at all
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Only admins can modify user roles';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix has_permission function
CREATE OR REPLACE FUNCTION public.has_permission(
  p_user_id uuid,
  p_permission_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role text;
  v_has_permission boolean;
BEGIN
  -- Get user's role
  SELECT role INTO v_role
  FROM profiles
  WHERE id = p_user_id AND is_active = true;
  
  -- Super admins have all permissions
  IF v_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Check if user has the specific permission
  SELECT EXISTS (
    SELECT 1
    FROM user_permissions
    WHERE user_id = p_user_id
    AND permission_name = p_permission_name
    AND granted = true
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$;

-- =====================================================
-- PART 2: Optimize RLS Policies for Profiles Table
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;

-- Create optimized policies with (select auth.uid())
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Super admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = (select auth.uid())
        AND p.role = 'super_admin'
        AND p.is_active = true
    )
  );

CREATE POLICY "Admins can view non-admin profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = (select auth.uid())
        AND p.role IN ('admin', 'super_admin')
        AND p.is_active = true
    )
    AND role NOT IN ('super_admin', 'admin')
  );

CREATE POLICY "Super admins can insert any profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = (select auth.uid())
        AND p.role = 'super_admin'
        AND p.is_active = true
    )
  );

CREATE POLICY "Admins can insert non-admin profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = (select auth.uid())
        AND p.role IN ('admin', 'super_admin')
        AND p.is_active = true
    )
    AND role NOT IN ('super_admin', 'admin')
  );

CREATE POLICY "Super admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = (select auth.uid())
        AND p.role = 'super_admin'
        AND p.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = (select auth.uid())
        AND p.role = 'super_admin'
        AND p.is_active = true
    )
  );

CREATE POLICY "Admins can update non-admin profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = (select auth.uid())
        AND p.role IN ('admin', 'super_admin')
        AND p.is_active = true
    )
    AND role NOT IN ('super_admin', 'admin')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = (select auth.uid())
        AND p.role IN ('admin', 'super_admin')
        AND p.is_active = true
    )
    AND role NOT IN ('super_admin', 'admin')
  );

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Super admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = (select auth.uid())
        AND p.role = 'super_admin'
        AND p.is_active = true
    )
    AND id != (select auth.uid())
  );

-- =====================================================
-- PART 3: Optimize RLS Policies for User Permissions
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view permissions based on role" ON user_permissions;
DROP POLICY IF EXISTS "Super admins can view all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can view non-admin permissions" ON user_permissions;
DROP POLICY IF EXISTS "Super admins can manage all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage non-admin permissions" ON user_permissions;

-- Create optimized policies
CREATE POLICY "Users can view permissions based on role"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid())
        AND role IN ('super_admin', 'admin')
        AND is_active = true
    )
  );

CREATE POLICY "Super admins can view all permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid())
        AND role = 'super_admin'
        AND is_active = true
    )
  );

CREATE POLICY "Admins can view non-admin permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = user_permissions.user_id
        AND p.role NOT IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Super admins can manage all permissions"
  ON user_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid())
        AND role = 'super_admin'
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid())
        AND role = 'super_admin'
        AND is_active = true
    )
  );

CREATE POLICY "Admins can manage non-admin permissions"
  ON user_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = user_permissions.user_id
        AND p.role NOT IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = user_permissions.user_id
        AND p.role NOT IN ('super_admin', 'admin')
    )
  );

-- =====================================================
-- PART 4: Drop Unused Indexes
-- =====================================================

-- Drop unused indexes to improve write performance
DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_profiles_created_by;
DROP INDEX IF EXISTS idx_payments_payment_date;
DROP INDEX IF EXISTS idx_support_forms_contact_id;
DROP INDEX IF EXISTS idx_support_forms_status;
DROP INDEX IF EXISTS idx_support_forms_created_at;
DROP INDEX IF EXISTS idx_appointments_contact_id;
DROP INDEX IF EXISTS idx_interactions_contact_id;
DROP INDEX IF EXISTS idx_student_status_contact_id;
DROP INDEX IF EXISTS idx_student_status_program;
DROP INDEX IF EXISTS idx_student_status_created_at;
DROP INDEX IF EXISTS idx_student_status_created_by;
DROP INDEX IF EXISTS idx_student_status_updated_by;
