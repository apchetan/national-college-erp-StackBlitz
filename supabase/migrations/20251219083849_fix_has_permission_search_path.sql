/*
  # Fix has_permission Function Search Path

  ## Problem
  Function has_permission has a role mutable search_path, which is a security vulnerability
  that could allow search path hijacking attacks.

  ## Solution
  Drop and recreate the function with explicit immutable search_path setting.
  Setting `SET search_path = public, pg_temp` ensures:
  - The function always uses the public schema
  - Prevents search path manipulation attacks
  - Maintains security definer safety

  ## Changes
  - Drop existing has_permission function
  - Recreate with explicit search_path = public, pg_temp
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS public.has_permission(uuid, text);

-- Recreate with proper security settings
CREATE FUNCTION public.has_permission(
  p_user_id uuid,
  p_permission_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
  v_role text;
  v_has_permission boolean;
BEGIN
  -- Get user's role
  SELECT role INTO v_role
  FROM profiles
  WHERE id = p_user_id AND is_active = true;
  
  -- Super admins have all permissions
  IF v_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Check if user has the specific permission
  SELECT EXISTS (
    SELECT 1
    FROM user_permissions
    WHERE user_id = p_user_id
    AND permission_name = p_permission_name
    AND granted = true
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$;
