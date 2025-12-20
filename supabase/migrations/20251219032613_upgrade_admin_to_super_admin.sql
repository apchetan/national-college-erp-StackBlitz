/*
  # Upgrade Admin to Super Admin
  
  ## Overview
  This migration upgrades existing admin users to super_admin role.
  
  ## Changes
  - Updates all users with role 'admin' to 'super_admin'
  - Preserves all other user data
  
  ## Important Notes
  - This should be run after the add_super_admin_role_system migration
  - At least one super admin must exist for the system to function properly
  - This can be reversed by manually updating the role back to 'admin'
*/

-- Upgrade all existing admin users to super_admin
UPDATE profiles
SET role = 'super_admin'
WHERE role = 'admin' AND is_active = true;
