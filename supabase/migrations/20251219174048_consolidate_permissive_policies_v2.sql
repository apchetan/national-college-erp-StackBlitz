/*
  # Consolidate Multiple Permissive RLS Policies

  1. Changes
    - Consolidate multiple permissive policies into single policies per action
    - This resolves security warnings about multiple permissive policies
    - Maintains the same access control logic using OR conditions
    
  2. Tables Modified
    - profiles: Consolidate SELECT, INSERT, UPDATE policies
    - user_permissions: Consolidate SELECT, INSERT, UPDATE, DELETE policies
    
  3. Security
    - No change to actual permissions, just consolidating the policy checks
    - Super admins can do everything
    - Admins can manage non-admin/non-super-admin users
    - Regular users can manage their own data
*/

-- =============================================
-- PROFILES TABLE - Consolidate Policies
-- =============================================

-- Drop existing permissive policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON profiles;
DROP POLICY IF EXISTS "Admins can insert non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert any profile" ON profiles;

-- Create consolidated SELECT policy
CREATE POLICY "Authenticated users can view profiles based on role"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    get_user_role(auth.uid()) = 'super_admin' OR
    (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'super_admin']) AND role NOT IN ('super_admin', 'admin'))
  );

-- Create consolidated UPDATE policy
CREATE POLICY "Authenticated users can update profiles based on role"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    get_user_role(auth.uid()) = 'super_admin' OR
    (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'super_admin']) AND role NOT IN ('super_admin', 'admin'))
  )
  WITH CHECK (
    id = auth.uid() OR
    get_user_role(auth.uid()) = 'super_admin' OR
    (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'super_admin']) AND role NOT IN ('super_admin', 'admin'))
  );

-- Create consolidated INSERT policy
CREATE POLICY "Authenticated users can insert profiles based on role"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid() OR
    get_user_role(auth.uid()) = 'super_admin' OR
    (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'super_admin']) AND role NOT IN ('super_admin', 'admin'))
  );

-- =============================================
-- USER_PERMISSIONS TABLE - Consolidate Policies
-- =============================================

-- Drop existing permissive policies for user_permissions
DROP POLICY IF EXISTS "Users can view own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can view non-super-admin permissions" ON user_permissions;
DROP POLICY IF EXISTS "Super admins can view all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can insert non-super-admin permissions" ON user_permissions;
DROP POLICY IF EXISTS "Super admins can insert all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can update non-super-admin permissions" ON user_permissions;
DROP POLICY IF EXISTS "Super admins can update all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can delete non-super-admin permissions" ON user_permissions;
DROP POLICY IF EXISTS "Super admins can delete all permissions" ON user_permissions;

-- Create consolidated SELECT policy
CREATE POLICY "Authenticated users can view permissions based on role"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    get_user_role(auth.uid()) = 'super_admin' OR
    (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'super_admin']) AND get_user_role(user_id) NOT IN ('super_admin', 'admin'))
  );

-- Create consolidated INSERT policy
CREATE POLICY "Authenticated users can insert permissions based on role"
  ON user_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) = 'super_admin' OR
    (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'super_admin']) AND get_user_role(user_id) NOT IN ('super_admin', 'admin'))
  );

-- Create consolidated UPDATE policy
CREATE POLICY "Authenticated users can update permissions based on role"
  ON user_permissions
  FOR UPDATE
  TO authenticated
  USING (
    get_user_role(auth.uid()) = 'super_admin' OR
    (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'super_admin']) AND get_user_role(user_id) NOT IN ('super_admin', 'admin'))
  )
  WITH CHECK (
    get_user_role(auth.uid()) = 'super_admin' OR
    (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'super_admin']) AND get_user_role(user_id) NOT IN ('super_admin', 'admin'))
  );

-- Create consolidated DELETE policy
CREATE POLICY "Authenticated users can delete permissions based on role"
  ON user_permissions
  FOR DELETE
  TO authenticated
  USING (
    get_user_role(auth.uid()) = 'super_admin' OR
    (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'super_admin']) AND get_user_role(user_id) NOT IN ('super_admin', 'admin'))
  );