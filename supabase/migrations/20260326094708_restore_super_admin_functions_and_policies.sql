/*
  # Restore Super Admin Functions and Fix Profiles Policies
  
  1. Problem
    - is_super_admin() function was dropped
    - has_permission() doesn't include super_admin checks
    - Profiles policies are broken/circular
  
  2. Solution
    - Recreate is_super_admin() function
    - Update has_permission() to include super_admin
    - Fix all profiles policies to use these functions correctly
  
  3. Security
    - SECURITY DEFINER functions prevent circular RLS
    - Proper role hierarchy: super_admin > admin > others
*/

-- Recreate is_super_admin function
CREATE OR REPLACE FUNCTION is_super_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update has_permission to include super_admin
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id uuid,
  p_resource text,
  p_action text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Drop all existing profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own basic profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles based on role" ON profiles;

-- SELECT Policies (non-circular)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

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

-- INSERT Policies
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

-- UPDATE Policies
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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

-- DELETE Policy
CREATE POLICY "Super admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    is_super_admin(auth.uid())
    AND id != auth.uid()
  );
