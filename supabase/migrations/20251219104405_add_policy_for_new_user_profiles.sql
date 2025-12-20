/*
  # Add Policy to Allow New User Profile Creation

  ## Problem
  When new users sign up, the trigger creates a profile, but RLS policies
  may block the profile creation or reading.

  ## Solution
  Add a policy that allows new users to create and read their own profile
  during the signup process.

  ## Changes
  - Add INSERT policy for users creating their own profile
  - Ensure SELECT policy allows new users to read their profile
*/

-- Add policy to allow users to create their own profile (needed for signup flow)
CREATE POLICY "Users can insert own profile during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- Update the existing "Users can view own profile" policy to ensure it works
-- (it should already exist, but we'll recreate it to be sure)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));