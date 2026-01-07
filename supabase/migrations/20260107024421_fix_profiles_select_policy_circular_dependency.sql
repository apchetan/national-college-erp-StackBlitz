/*
  # Fix Profiles SELECT Policy Circular Dependency

  ## Problem
  The current SELECT policy on profiles has a circular dependency:
  - To view your profile, it checks if you're an admin
  - To check if you're an admin, it queries the profiles table
  - This creates an infinite loop causing "Error loading profile"

  ## Solution
  1. Create a security definer function that bypasses RLS to check user role
  2. Update the SELECT policy to use this function
  3. This allows users to always view their own profile without circular checks

  ## Changes
  - Create `is_admin_user()` function with SECURITY DEFINER
  - Update "Users can view relevant profiles" policy to use the function
  - Users can always see their own profile
  - Admins can see all profiles
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view relevant profiles" ON profiles;

-- Create helper function to check if current user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  );
$$;

-- Create new SELECT policy without circular dependency
CREATE POLICY "Users can view relevant profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR is_admin_user()
  );
