/*
  # Fix Profiles RLS Circular Dependency with Security Definer Function

  1. Problem
    - Previous migration still had circular dependency in admin check
    
  2. Solution
    - Create a SECURITY DEFINER function that can check if user is admin
    - This function runs with elevated privileges and breaks the circular dependency
    - Use this function in RLS policies

  3. Changes
    - Create is_user_admin() security definer function
    - Update RLS policies to use this function
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile simple" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a security definer function to check if current user is admin
-- This breaks the circular dependency by using elevated privileges
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  );
$$;

-- Create simple policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy: Admins can view all profiles (using security definer function)
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_current_user_admin());