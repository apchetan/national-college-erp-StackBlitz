/*
  # Fix handle_new_user Trigger to Bypass RLS

  ## Problem
  When creating a new user via auth.signUp(), the handle_new_user() trigger
  tries to insert into profiles table, but RLS policies block it because the
  new user doesn't have permissions yet.

  ## Solution
  Update the handle_new_user() function to:
  1. Set proper search_path for security
  2. Bypass RLS during profile creation
  3. Handle potential conflicts gracefully

  ## Changes
  - Updated handle_new_user() function with SET LOCAL to bypass RLS
*/

-- Drop and recreate the handle_new_user function with RLS bypass
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Temporarily bypass RLS for this operation
  SET LOCAL row_security = off;
  
  -- Insert the new profile
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer'),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;