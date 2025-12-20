/*
  # Fix prevent_privilege_escalation to Allow Signup Trigger
  
  ## Problem
  The prevent_privilege_escalation trigger blocks profile creation during
  user signup because auth.uid() is NULL when the signup trigger runs.
  
  ## Solution
  Allow profile creation when:
  1. auth.uid() is NULL (during signup trigger)
  2. The operation is an INSERT (new user creation)
  
  ## Changes
  - Update prevent_privilege_escalation to skip checks for INSERT operations with NULL auth.uid()
*/

CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_role text;
  current_auth_uid uuid;
BEGIN
  -- Get current auth user ID
  current_auth_uid := auth.uid();
  
  -- Allow INSERT operations when auth.uid() is NULL (signup trigger)
  IF TG_OP = 'INSERT' AND current_auth_uid IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Allow service role to do anything
  IF current_auth_uid IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get the current user's role
  current_user_role := get_user_role(current_auth_uid);
  
  -- Super admins can do anything
  IF current_user_role = 'super_admin' THEN
    RETURN NEW;
  END IF;
  
  -- Regular admins cannot create or modify super_admin or admin roles
  IF current_user_role = 'admin' THEN
    IF NEW.role IN ('super_admin', 'admin') THEN
      RAISE EXCEPTION 'Admins cannot create or modify super_admin or admin roles';
    END IF;
    RETURN NEW;
  END IF;
  
  -- Non-admins cannot modify roles at all
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Only admins can modify user roles';
  END IF;
  
  RETURN NEW;
END;
$$;