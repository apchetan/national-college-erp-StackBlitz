/*
  # Fix Profiles RLS 500 Error - Remove Circular Dependencies
  
  1. Problem
    - SELECT policies on profiles table query the profiles table itself
    - This creates infinite recursion causing 500 errors
    - User cannot load their profile, breaking the entire app
  
  2. Solution
    - Drop all existing circular policies
    - Create simple, non-recursive policies:
      * Users can view their own profile (auth.uid() = id)
      * Super admins can view all profiles (check user_permissions directly)
      * Admins can view all profiles (check user_permissions directly)
    - Use user_permissions table instead of profiles table for role checks
  
  3. Security
    - Maintains proper access control
    - No circular dependencies
    - Efficient database queries
*/

-- Drop all existing profiles policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles based on role" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles based on role" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;

-- SELECT policies: Simple and non-recursive
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_permissions.user_id = auth.uid()
      AND user_permissions.resource = 'super_admin'
      AND user_permissions.can_view = true
    )
  );

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_permissions.user_id = auth.uid()
      AND user_permissions.resource = 'users'
      AND user_permissions.can_view = true
    )
  );

-- UPDATE policies: Users can update own profile (but not change role)
CREATE POLICY "Users can update own basic profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Super admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_permissions.user_id = auth.uid()
      AND user_permissions.resource = 'super_admin'
      AND user_permissions.can_edit = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_permissions.user_id = auth.uid()
      AND user_permissions.resource = 'super_admin'
      AND user_permissions.can_edit = true
    )
  );

-- INSERT policy: Only super admins can create profiles manually
CREATE POLICY "Super admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_permissions.user_id = auth.uid()
      AND user_permissions.resource = 'super_admin'
      AND user_permissions.can_create = true
    )
  );

-- DELETE policy: Only super admins can delete profiles
CREATE POLICY "Super admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_permissions.user_id = auth.uid()
      AND user_permissions.resource = 'super_admin'
      AND user_permissions.can_delete = true
    )
  );
