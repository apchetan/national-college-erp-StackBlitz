/*
  # Fix Profiles Table Infinite Recursion

  ## Problem
  The RLS policies on the profiles table are querying the profiles table itself,
  creating infinite recursion when trying to load user profiles.

  ## Solution
  Create a security definer function that bypasses RLS to get user role,
  then use this function in the RLS policies instead of querying profiles directly.

  ## Changes
  1. Create get_user_role() function with SECURITY DEFINER
  2. Replace all profiles table RLS policies to use this function
  3. Ensure function has proper search_path security
*/

-- =====================================================
-- Create Helper Function to Get User Role (Bypasses RLS)
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role
  FROM profiles
  WHERE id = p_user_id AND is_active = true;
  
  RETURN v_role;
END;
$$;

-- =====================================================
-- Recreate All Profiles Policies Using get_user_role()
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;

-- SELECT Policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Super admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (get_user_role((select auth.uid())) = 'super_admin');

CREATE POLICY "Admins can view non-admin profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    get_user_role((select auth.uid())) IN ('admin', 'super_admin')
    AND role NOT IN ('super_admin', 'admin')
  );

-- INSERT Policies
CREATE POLICY "Super admins can insert any profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role((select auth.uid())) = 'super_admin');

CREATE POLICY "Admins can insert non-admin profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role((select auth.uid())) IN ('admin', 'super_admin')
    AND role NOT IN ('super_admin', 'admin')
  );

-- UPDATE Policies
CREATE POLICY "Super admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (get_user_role((select auth.uid())) = 'super_admin')
  WITH CHECK (get_user_role((select auth.uid())) = 'super_admin');

CREATE POLICY "Admins can update non-admin profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    get_user_role((select auth.uid())) IN ('admin', 'super_admin')
    AND role NOT IN ('super_admin', 'admin')
  )
  WITH CHECK (
    get_user_role((select auth.uid())) IN ('admin', 'super_admin')
    AND role NOT IN ('super_admin', 'admin')
  );

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- DELETE Policy
CREATE POLICY "Super admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    get_user_role((select auth.uid())) = 'super_admin'
    AND id != (select auth.uid())
  );

-- =====================================================
-- Update Other Functions to Use get_user_role()
-- =====================================================

-- Update is_super_admin function
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN get_user_role(p_user_id) = 'super_admin';
END;
$$;

-- Update prevent_privilege_escalation function
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Get the current user's role using the helper function
  current_user_role := get_user_role(auth.uid());
  
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

-- Update has_permission function
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
  -- Get user's role using the helper function
  v_role := get_user_role(p_user_id);
  
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