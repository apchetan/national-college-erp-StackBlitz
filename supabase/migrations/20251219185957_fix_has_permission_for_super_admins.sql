/*
  # Update has_permission Function to Handle Super Admins

  1. Problem
    - Current has_permission() function only checks user_permissions table
    - Super admins don't automatically have all permissions
    - Super admins need explicit entries in user_permissions for each resource

  2. Solution
    - Update has_permission() to check if user is a super_admin first
    - If super_admin, automatically return true for all permissions
    - Otherwise, check user_permissions table as before

  3. Changes
    - Drop existing has_permission(uuid, text, text) function
    - Recreate with super_admin check at the beginning
    - Use get_user_role() helper if it exists, otherwise query profiles directly

  4. Security Notes
    - Function remains SECURITY DEFINER
    - search_path is empty for security
    - Super admins have unrestricted access by design
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS has_permission(uuid, text, text) CASCADE;

-- Recreate with super admin support
CREATE OR REPLACE FUNCTION public.has_permission(
  p_user_id uuid,
  p_resource text,
  p_action text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
STABLE
AS $$
DECLARE
  v_role text;
BEGIN
  -- Get user's role
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = p_user_id
  AND is_active = true;
  
  -- Super admins have all permissions
  IF v_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Check user_permissions table for specific permissions
  RETURN EXISTS (
    SELECT 1
    FROM public.user_permissions up
    WHERE up.user_id = p_user_id
    AND up.resource = p_resource
    AND (
      (p_action = 'view' AND up.can_view = true) OR
      (p_action = 'create' AND up.can_create = true) OR
      (p_action = 'edit' AND up.can_edit = true) OR
      (p_action = 'delete' AND up.can_delete = true) OR
      (p_action = 'export' AND up.can_export = true) OR
      (p_action = 'import' AND up.can_import = true)
    )
  );
END;
$$;
