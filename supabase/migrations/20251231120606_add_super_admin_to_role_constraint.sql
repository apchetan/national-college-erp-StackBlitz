/*
  # Add super_admin to role constraint

  1. Changes
    - Drop existing role check constraint
    - Add new constraint that includes super_admin
*/

-- Drop existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with super_admin included
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('super_admin', 'admin', 'manager', 'editor', 'viewer'));