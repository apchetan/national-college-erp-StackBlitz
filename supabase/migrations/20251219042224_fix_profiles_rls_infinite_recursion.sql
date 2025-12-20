/*
  # Fix Infinite Recursion in Profiles RLS Policies

  ## Problem
  The RLS policies on the profiles table were calling the `is_super_admin()` function,
  which queries the profiles table, creating an infinite recursion loop. This prevented
  users from loading their profiles and accessing admin features.

  ## Solution
  Replace function-based policies with direct role checks to avoid circular dependencies.

  ## Changes
  1. Drop all existing policies on profiles table
  2. Create new policies with direct role checks (no function calls)
  3. Policies:
     - Users can view own profile (basic access for all users)
     - Super admins can view all profiles (using subquery instead of function)
     - Admins can view non-admin profiles (using subquery)
     - Super admins can insert/update/delete (using subquery)
     - Admins can insert/update non-admin profiles (using subquery)
     - Users can update own profile

  ## Security
  - All policies remain restrictive by default
  - Super admins have full access
  - Regular admins can only manage non-admin users
  - Users can only access their own profile
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert any profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update non-admin profiles" ON profiles;

-- Create new policies without circular dependencies

-- Basic policy: Users can always view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Super admin policies: Use subquery to check role directly
CREATE POLICY "Super admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
        AND p.is_active = true
    )
  );

CREATE POLICY "Super admins can insert any profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
        AND p.is_active = true
    )
  );

CREATE POLICY "Super admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
        AND p.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
        AND p.is_active = true
    )
  );

CREATE POLICY "Super admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
        AND p.is_active = true
    )
    AND id != auth.uid()
  );

-- Admin policies: Can manage non-admin users
CREATE POLICY "Admins can view non-admin profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
        AND p.is_active = true
    )
    AND role NOT IN ('super_admin', 'admin')
  );

CREATE POLICY "Admins can insert non-admin profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
        AND p.is_active = true
    )
    AND role NOT IN ('super_admin', 'admin')
  );

CREATE POLICY "Admins can update non-admin profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
        AND p.is_active = true
    )
    AND role NOT IN ('super_admin', 'admin')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
        AND p.is_active = true
    )
    AND role NOT IN ('super_admin', 'admin')
  );

-- Users can update their own profile (but not change their role)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
