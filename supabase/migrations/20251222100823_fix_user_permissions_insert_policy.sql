/*
  # Fix user_permissions INSERT policy
  
  1. Changes
    - Add INSERT policy for user_permissions table
    - Allow super_admins and admins to create permissions for new users
    
  2. Security
    - Only authenticated users with admin or super_admin role can insert permissions
    - Prevents privilege escalation
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can create user permissions" ON user_permissions;
DROP POLICY IF EXISTS "Super admins can create user permissions" ON user_permissions;

-- Allow super_admins and admins to create user permissions
CREATE POLICY "Admins can create user permissions"
  ON user_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_active = true
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Allow super_admins and admins to update user permissions
CREATE POLICY "Admins can update user permissions"
  ON user_permissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_active = true
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_active = true
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Allow super_admins to delete user permissions
CREATE POLICY "Super admins can delete user permissions"
  ON user_permissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_active = true
      AND profiles.role = 'super_admin'
    )
  );
