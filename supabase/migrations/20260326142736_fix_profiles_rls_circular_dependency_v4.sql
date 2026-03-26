/*
  # Fix Profiles RLS Circular Dependency - Final Fix
  
  ## Problem
  The `get_user_role()` function queries the `profiles` table, but the `profiles` 
  table's RLS policies call `get_user_role()`, creating a circular dependency that
  prevents users from seeing the full user list.
  
  ## Solution
  1. Drop all policies that depend on get_user_role
  2. Drop and recreate the function as SECURITY DEFINER
  3. Recreate all the policies
  
  ## Changes
  - Update get_user_role to SECURITY DEFINER to bypass RLS
  - Recreate all dependent policies
*/

-- Step 1: Drop all policies that depend on get_user_role
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;
DROP POLICY IF EXISTS "User permissions select policy" ON public.user_permissions;
DROP POLICY IF EXISTS "User permissions insert policy" ON public.user_permissions;
DROP POLICY IF EXISTS "User permissions update policy" ON public.user_permissions;
DROP POLICY IF EXISTS "User permissions delete policy" ON public.user_permissions;

-- Step 2: Drop and recreate the function with SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_role;
END;
$$;

-- Step 3: Recreate profiles policies
CREATE POLICY "Profiles select policy"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

CREATE POLICY "Profiles insert policy"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'super_admin'
    OR (
      public.get_user_role(auth.uid()) = 'admin'
      AND role NOT IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Profiles update policy"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR public.get_user_role(auth.uid()) = 'super_admin'
    OR (
      public.get_user_role(auth.uid()) = 'admin'
      AND role NOT IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR public.get_user_role(auth.uid()) = 'super_admin'
    OR (
      public.get_user_role(auth.uid()) = 'admin'
      AND role NOT IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Profiles delete policy"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'super_admin'
    OR (
      public.get_user_role(auth.uid()) = 'admin'
      AND role NOT IN ('admin', 'super_admin')
    )
  );

-- Step 4: Recreate user_permissions policies
CREATE POLICY "User permissions select policy"
  ON public.user_permissions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

CREATE POLICY "User permissions insert policy"
  ON public.user_permissions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'super_admin'
    OR (
      public.get_user_role(auth.uid()) = 'admin'
      AND NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id
        AND role IN ('admin', 'super_admin')
      )
    )
  );

CREATE POLICY "User permissions update policy"
  ON public.user_permissions FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'super_admin'
    OR (
      public.get_user_role(auth.uid()) = 'admin'
      AND NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id
        AND role IN ('admin', 'super_admin')
      )
    )
  )
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'super_admin'
    OR (
      public.get_user_role(auth.uid()) = 'admin'
      AND NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id
        AND role IN ('admin', 'super_admin')
      )
    )
  );

CREATE POLICY "User permissions delete policy"
  ON public.user_permissions FOR DELETE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'super_admin'
    OR (
      public.get_user_role(auth.uid()) = 'admin'
      AND NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id
        AND role IN ('admin', 'super_admin')
      )
    )
  );