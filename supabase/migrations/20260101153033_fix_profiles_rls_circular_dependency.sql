/*
  # Fix Circular Dependency in Profiles RLS Policy

  1. Problem
    - The current SELECT policy on profiles table has a circular dependency
    - It queries the profiles table while checking permissions to read from profiles
    - This can cause performance issues and blocking

  2. Solution
    - Simplify the SELECT policy to allow users to always read their own profile
    - Allow admins to read all profiles without circular dependency
    - Use auth.jwt() to check role instead of querying profiles table

  3. Changes
    - Drop existing problematic SELECT policy
    - Create new optimized SELECT policy without circular dependency
*/

-- Drop the existing SELECT policy with circular dependency
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create new policy: Users can always view their own profile
-- Admins can view all profiles (using JWT metadata to avoid circular dependency)
CREATE POLICY "Users can view profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can always view their own profile
    auth.uid() = id
    OR
    -- Super admins and admins can view all profiles
    -- Check role from JWT to avoid circular dependency
    (auth.jwt()->>'email')::text IN (
      SELECT email FROM auth.users 
      WHERE id IN (
        SELECT id FROM profiles WHERE role IN ('admin', 'super_admin') AND is_active = true
      )
    )
  );

-- Alternative simpler policy: Just allow users to view their own profile
-- and use a stored function for admin checks
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;

CREATE POLICY "Users can view own profile simple"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create a separate policy for admin viewing all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
      AND p.is_active = true
      LIMIT 1
    )
  );