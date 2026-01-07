/*
  # Fix Profiles RLS Circular Dependency with Security Definer Function

  ## Problem
  The "Admins can view all profiles" policy still causes circular dependency:
  - It queries the profiles table to check if user is admin
  - That query triggers RLS, which checks if user is admin
  - Creates infinite recursion

  ## Solution
  Create a SECURITY DEFINER function that bypasses RLS to check admin status.
  This function runs with elevated privileges and doesn't trigger RLS policies.

  ## Changes
  1. Create is_admin_or_super_admin() function with SECURITY DEFINER
  2. Replace the admin policy to use this function
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create function to check if current user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  );
END;
$$;

-- Create new policy using the security definer function
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_super_admin());