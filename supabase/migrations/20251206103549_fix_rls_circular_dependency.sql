/*
  # Fix RLS Circular Dependency for Profiles

  ## Changes
  - Remove the "Admins can view all profiles" policy that causes circular dependency
  - Simplify to just allow users to view their own profile
  - Admins will still be able to manage other profiles through the admin panel with service role
  
  ## Security
  - Users can only view their own profile
  - Admin operations will use proper authorization checks in the application layer
*/

-- Drop the problematic circular dependency policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Keep only the simple self-view policy
-- This policy already exists, but let's ensure it's the only SELECT policy
-- Users can view own profile is already created, so no need to recreate it
