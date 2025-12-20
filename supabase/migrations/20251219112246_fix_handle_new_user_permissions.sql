/*
  # Fix handle_new_user Function Permissions
  
  ## Problem
  The trigger function may not have proper permissions to insert into profiles
  during user creation via Admin API.
  
  ## Solution
  1. Grant necessary permissions to the function
  2. Ensure function runs with proper security context
  3. Add better error handling
  
  ## Changes
  - Recreate handle_new_user function with proper grants
  - Add exception handling
  - Ensure trigger is properly attached
*/

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_role text;
  v_full_name text;
BEGIN
  -- Extract metadata
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'viewer');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  
  -- Insert the new profile (bypassing RLS via SECURITY DEFINER)
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_role,
    true
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure the function owner has necessary permissions
GRANT INSERT, UPDATE ON public.profiles TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA auth TO postgres;