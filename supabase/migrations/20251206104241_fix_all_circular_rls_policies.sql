/*
  # Fix All Circular RLS Policies on Profiles Table

  ## Problem
  Multiple policies have circular dependencies where they query the profiles table
  to check if a user is an admin, but accessing profiles requires evaluating these
  same policies, creating infinite recursion.

  ## Solution
  1. Drop all existing policies on profiles table
  2. Create simple, non-circular policies:
     - Users can view their own profile only
     - Users can update their own profile only
     - No admin checks in RLS (admin access will be handled at application level)

  ## Security
  - Users can only access their own profile data
  - Admin functionality will be handled by application logic with proper authorization
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view profiles based on role" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles based on role" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create simple, non-circular policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Note: Profile creation is handled by the auth trigger, not by users
-- Admin operations will be handled at the application level with proper checks
