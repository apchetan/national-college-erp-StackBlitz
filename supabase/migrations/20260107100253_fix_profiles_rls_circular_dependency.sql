/*
  # Fix Profiles RLS Circular Dependency

  ## Problem
  The "Users can view relevant profiles" policy has a circular dependency:
  - To load a profile, it checks if the user is an admin
  - To check if user is admin, it queries the profiles table
  - That query triggers the same RLS check, creating infinite recursion

  ## Solution
  Users should always be able to view their own profile.
  Only viewing OTHER profiles should require admin permissions.

  ## Changes
  - Drop the problematic policy
  - Create new policy that allows users to view their own profile
  - Create separate policy for admins to view all profiles
*/

-- Drop the circular policy
DROP POLICY IF EXISTS "Users can view relevant profiles" ON public.profiles;

-- Allow users to view their own profile (no additional checks needed)
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid()) 
      AND p.role IN ('admin', 'super_admin')
      AND p.is_active = true
    )
  );