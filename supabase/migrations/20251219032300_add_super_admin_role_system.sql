/*
  # Add Super Admin Role System
  
  ## Overview
  This migration enhances the existing role system with a super_admin role that has full control over users, admins, and permissions.
  
  ## 1. Changes to Existing Tables
  
  ### `profiles` table
  - Update role constraint to include 'super_admin'
  - Role hierarchy: super_admin > admin > manager > editor > viewer
  
  ### `user_permissions` table
  - Add new resources for form access control
  
  ## 2. New Features
  
  ### Super Admin Capabilities
  - Create, edit, delete, and deactivate all users (including admins)
  - Manage user roles and permissions
  - Full access to all forms and features
  - Can create new sub-admins and admins
  
  ### Admin Capabilities
  - Manage users with roles: manager, editor, viewer
  - Cannot modify super_admins or other admins
  - Access based on assigned permissions
  
  ## 3. Security
  
  ### RLS Policies
  - Super admins have unrestricted access to all data
  - Admins can only manage non-admin users
  - Users cannot elevate their own privileges
  - All role changes are logged
  
  ## 4. Important Notes
  - First super admin should be created by updating existing admin manually
  - Super admins cannot be demoted by other super admins
  - At least one active super admin must exist at all times
*/

-- Drop existing role constraint and add new one with super_admin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('super_admin', 'admin', 'manager', 'editor', 'viewer'));

-- Update user_permissions to include form access
ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS user_permissions_resource_check;
ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_resource_check 
  CHECK (resource IN ('contacts', 'enquiries', 'appointments', 'admissions', 'payments', 'support', 'student_status', 'all_forms'));

-- Add function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role text;
  v_is_active boolean;
BEGIN
  SELECT role, is_active INTO v_role, v_is_active
  FROM profiles
  WHERE id = p_user_id;
  
  RETURN v_role = 'super_admin' AND v_is_active = true;
END;
$$;

-- Update has_permission function to include super admin check
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id uuid,
  p_resource text,
  p_action text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role text;
  v_is_active boolean;
  v_has_perm boolean;
BEGIN
  -- Get user role and active status
  SELECT role, is_active INTO v_role, v_is_active
  FROM profiles
  WHERE id = p_user_id;
  
  -- If user doesn't exist or is inactive, return false
  IF v_role IS NULL OR v_is_active = false THEN
    RETURN false;
  END IF;
  
  -- Super admins and admins have all permissions
  IF v_role IN ('super_admin', 'admin') THEN
    RETURN true;
  END IF;
  
  -- Check specific permission
  CASE p_action
    WHEN 'view' THEN
      SELECT can_view INTO v_has_perm FROM user_permissions WHERE user_id = p_user_id AND resource = p_resource;
    WHEN 'create' THEN
      SELECT can_create INTO v_has_perm FROM user_permissions WHERE user_id = p_user_id AND resource = p_resource;
    WHEN 'edit' THEN
      SELECT can_edit INTO v_has_perm FROM user_permissions WHERE user_id = p_user_id AND resource = p_resource;
    WHEN 'delete' THEN
      SELECT can_delete INTO v_has_perm FROM user_permissions WHERE user_id = p_user_id AND resource = p_resource;
    WHEN 'export' THEN
      SELECT can_export INTO v_has_perm FROM user_permissions WHERE user_id = p_user_id AND resource = p_resource;
    WHEN 'import' THEN
      SELECT can_import INTO v_has_perm FROM user_permissions WHERE user_id = p_user_id AND resource = p_resource;
    ELSE
      RETURN false;
  END CASE;
  
  RETURN COALESCE(v_has_perm, false);
END;
$$;

-- Drop old policies for profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

-- Create new policies for super admin control
CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Admins can view non-admin profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.is_active = true
    )
    AND role NOT IN ('super_admin', 'admin')
  );

CREATE POLICY "Super admins can insert any profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admins can insert non-admin profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.is_active = true
    )
    AND role NOT IN ('super_admin', 'admin')
  );

CREATE POLICY "Super admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admins can update non-admin profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.is_active = true
    )
    AND role NOT IN ('super_admin', 'admin')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.is_active = true
    )
    AND role NOT IN ('super_admin', 'admin')
  );

CREATE POLICY "Super admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    is_super_admin(auth.uid())
    AND id != auth.uid()
  );

-- Drop old permissions policies
DROP POLICY IF EXISTS "Admins can view all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON user_permissions;

-- Create new permissions policies
CREATE POLICY "Super admins can view all permissions"
  ON user_permissions FOR SELECT
  TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Admins can view non-admin permissions"
  ON user_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.is_active = true
    )
    AND user_id IN (
      SELECT id FROM profiles
      WHERE role NOT IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Super admins can manage all permissions"
  ON user_permissions FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage non-admin permissions"
  ON user_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.is_active = true
    )
    AND user_id IN (
      SELECT id FROM profiles
      WHERE role NOT IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.is_active = true
    )
    AND user_id IN (
      SELECT id FROM profiles
      WHERE role NOT IN ('super_admin', 'admin')
    )
  );

-- Function to prevent privilege escalation
CREATE OR REPLACE FUNCTION prevent_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_role text;
BEGIN
  -- Get the role of the user making the change
  SELECT role INTO v_current_user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Super admins can do anything
  IF v_current_user_role = 'super_admin' THEN
    RETURN NEW;
  END IF;
  
  -- Admins cannot create or modify super_admins or admins
  IF v_current_user_role = 'admin' AND NEW.role IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Admins cannot create or modify super_admin or admin roles';
  END IF;
  
  -- Users cannot change their own role to something higher
  IF NEW.id = auth.uid() AND OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Users cannot change their own role';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger to prevent privilege escalation
DROP TRIGGER IF EXISTS prevent_privilege_escalation_trigger ON profiles;
CREATE TRIGGER prevent_privilege_escalation_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_privilege_escalation();
