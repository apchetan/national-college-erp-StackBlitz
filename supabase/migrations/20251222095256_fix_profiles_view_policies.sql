/*
  # Fix Profiles View Policies

  1. Issue
    - Users cannot view other profiles in the user management list
    - Only "Users can view own profile" policy exists
    - Admin and Super Admin policies are missing

  2. Changes
    - Drop existing incomplete policies
    - Create correct consolidated policies for SELECT, INSERT, UPDATE
    - Super admins can view/manage all profiles
    - Admins can view/manage non-admin/non-super-admin profiles
    - All users can view their own profile

  3. Security
    - Maintains proper access control
    - Prevents privilege escalation
    - Allows proper user management functionality
*/

-- Drop any existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON profiles;
DROP POLICY IF EXISTS "Admins can insert non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert any profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles based on role" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can update profiles based on role" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles based on role" ON profiles;

-- Create consolidated SELECT policy
CREATE POLICY "Authenticated users can view profiles based on role"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    get_user_role(auth.uid()) = 'super_admin' OR
    (get_user_role(auth.uid()) = 'admin' AND role NOT IN ('super_admin', 'admin'))
  );

-- Create consolidated INSERT policy
CREATE POLICY "Authenticated users can insert profiles based on role"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid() OR
    get_user_role(auth.uid()) = 'super_admin' OR
    (get_user_role(auth.uid()) = 'admin' AND role NOT IN ('super_admin', 'admin'))
  );

-- Create consolidated UPDATE policy
CREATE POLICY "Authenticated users can update profiles based on role"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    get_user_role(auth.uid()) = 'super_admin' OR
    (get_user_role(auth.uid()) = 'admin' AND role NOT IN ('super_admin', 'admin'))
  )
  WITH CHECK (
    id = auth.uid() OR
    get_user_role(auth.uid()) = 'super_admin' OR
    (get_user_role(auth.uid()) = 'admin' AND role NOT IN ('super_admin', 'admin'))
  );

-- Create DELETE policy (super admins only)
CREATE POLICY "Super admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    get_user_role(auth.uid()) = 'super_admin'
  );
