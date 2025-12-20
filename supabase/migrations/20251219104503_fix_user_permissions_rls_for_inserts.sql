/*
  # Fix User Permissions RLS for Insert Operations

  ## Problem
  When admins create users and insert permissions, the RLS policies check
  the profiles table to verify the target user's role. However, this can fail
  due to RLS restrictions on reading profiles.

  ## Solution
  Update user_permissions policies to use the get_user_role() function which
  bypasses RLS when checking roles.

  ## Changes
  - Updated all user_permissions policies to use get_user_role()
  - Simplified policy logic for better performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view permissions based on role" ON user_permissions;
DROP POLICY IF EXISTS "Super admins can view all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can view non-admin permissions" ON user_permissions;
DROP POLICY IF EXISTS "Super admins can manage all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage non-admin permissions" ON user_permissions;

-- SELECT Policies
CREATE POLICY "Users can view own permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Super admins can view all permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (get_user_role((select auth.uid())) = 'super_admin');

CREATE POLICY "Admins can view non-super-admin permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (
    get_user_role((select auth.uid())) IN ('admin', 'super_admin')
    AND get_user_role(user_id) NOT IN ('super_admin', 'admin')
  );

-- INSERT Policies
CREATE POLICY "Super admins can insert all permissions"
  ON user_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role((select auth.uid())) = 'super_admin');

CREATE POLICY "Admins can insert non-super-admin permissions"
  ON user_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role((select auth.uid())) IN ('admin', 'super_admin')
    AND get_user_role(user_id) NOT IN ('super_admin', 'admin')
  );

-- UPDATE Policies
CREATE POLICY "Super admins can update all permissions"
  ON user_permissions
  FOR UPDATE
  TO authenticated
  USING (get_user_role((select auth.uid())) = 'super_admin')
  WITH CHECK (get_user_role((select auth.uid())) = 'super_admin');

CREATE POLICY "Admins can update non-super-admin permissions"
  ON user_permissions
  FOR UPDATE
  TO authenticated
  USING (
    get_user_role((select auth.uid())) IN ('admin', 'super_admin')
    AND get_user_role(user_id) NOT IN ('super_admin', 'admin')
  )
  WITH CHECK (
    get_user_role((select auth.uid())) IN ('admin', 'super_admin')
    AND get_user_role(user_id) NOT IN ('super_admin', 'admin')
  );

-- DELETE Policies
CREATE POLICY "Super admins can delete all permissions"
  ON user_permissions
  FOR DELETE
  TO authenticated
  USING (get_user_role((select auth.uid())) = 'super_admin');

CREATE POLICY "Admins can delete non-super-admin permissions"
  ON user_permissions
  FOR DELETE
  TO authenticated
  USING (
    get_user_role((select auth.uid())) IN ('admin', 'super_admin')
    AND get_user_role(user_id) NOT IN ('super_admin', 'admin')
  );