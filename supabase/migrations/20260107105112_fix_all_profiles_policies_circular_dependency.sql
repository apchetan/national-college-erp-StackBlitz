/*
  # Fix All Profiles Policies Circular Dependencies

  ## Problem
  Multiple policies on profiles table have circular dependencies:
  - "Admins can insert profiles" - queries profiles table to check admin status
  - "Admins can update profiles" - queries profiles table to check admin status
  
  ## Solution
  Use the existing is_admin_or_super_admin() SECURITY DEFINER function for all policies
  that need to check admin status.

  ## Changes
  - Replace INSERT policy to use security definer function
  - Replace UPDATE policy to use security definer function
*/

-- Drop existing policies with circular dependencies
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Recreate INSERT policy using security definer function
CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_super_admin());

-- Recreate UPDATE policy using security definer function
CREATE POLICY "Admins can update profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_super_admin());