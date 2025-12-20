/*
  # Fix Function Search Path Mutability

  1. Changes
    - Recreate has_permission and set_created_by functions with immutable search_path
    - This prevents potential security issues from search_path manipulation
    
  2. Functions Modified
    - has_permission(uuid, text): Check user permissions
    - has_permission(uuid, text, text): Check resource-specific permissions
    - set_created_by(): Trigger function to auto-set created_by field
    
  3. Security
    - Setting search_path to empty string with SECURITY DEFINER prevents injection attacks
    - Functions must now use schema-qualified names (e.g., auth.uid(), public.profiles)
    
  4. Note
    - Policies that depend on these functions will be automatically recreated
*/

-- Drop and recreate has_permission(uuid, text) with proper search_path
DROP FUNCTION IF EXISTS has_permission(uuid, text) CASCADE;

CREATE OR REPLACE FUNCTION has_permission(p_user_id uuid, p_permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_permissions up
    WHERE up.user_id = p_user_id
    AND up.resource = p_permission_name
  );
END;
$$;

-- Drop and recreate has_permission(uuid, text, text) with proper search_path
DROP FUNCTION IF EXISTS has_permission(uuid, text, text) CASCADE;

CREATE OR REPLACE FUNCTION has_permission(p_user_id uuid, p_resource text, p_action text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
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

-- Recreate RLS policies that depend on has_permission(uuid, text, text)
-- CONTACTS policies
CREATE POLICY "Users can create contacts based on permissions"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'contacts', 'create'));

CREATE POLICY "Users can update contacts based on permissions"
  ON contacts FOR UPDATE
  TO authenticated
  USING (has_permission(auth.uid(), 'contacts', 'edit'))
  WITH CHECK (has_permission(auth.uid(), 'contacts', 'edit'));

CREATE POLICY "Users can delete contacts based on permissions"
  ON contacts FOR DELETE
  TO authenticated
  USING (has_permission(auth.uid(), 'contacts', 'delete'));

-- ENQUIRIES policies
CREATE POLICY "Users can create enquiries based on permissions"
  ON enquiries FOR INSERT
  TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'enquiries', 'create'));

CREATE POLICY "Users can update enquiries based on permissions"
  ON enquiries FOR UPDATE
  TO authenticated
  USING (has_permission(auth.uid(), 'enquiries', 'edit'))
  WITH CHECK (has_permission(auth.uid(), 'enquiries', 'edit'));

CREATE POLICY "Users can delete enquiries based on permissions"
  ON enquiries FOR DELETE
  TO authenticated
  USING (has_permission(auth.uid(), 'enquiries', 'delete'));

-- APPOINTMENTS policies
CREATE POLICY "Users can create appointments based on permissions"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'appointments', 'create'));

CREATE POLICY "Users can update appointments based on permissions"
  ON appointments FOR UPDATE
  TO authenticated
  USING (has_permission(auth.uid(), 'appointments', 'edit'))
  WITH CHECK (has_permission(auth.uid(), 'appointments', 'edit'));

CREATE POLICY "Users can delete appointments based on permissions"
  ON appointments FOR DELETE
  TO authenticated
  USING (has_permission(auth.uid(), 'appointments', 'delete'));

-- ADMISSIONS policies
CREATE POLICY "Users can view admissions based on permissions"
  ON admissions FOR SELECT
  TO authenticated
  USING (has_permission(auth.uid(), 'admissions', 'view'));

CREATE POLICY "Users can create admissions based on permissions"
  ON admissions FOR INSERT
  TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'admissions', 'create'));

CREATE POLICY "Users can update admissions based on permissions"
  ON admissions FOR UPDATE
  TO authenticated
  USING (has_permission(auth.uid(), 'admissions', 'edit'))
  WITH CHECK (has_permission(auth.uid(), 'admissions', 'edit'));

CREATE POLICY "Users can delete admissions based on permissions"
  ON admissions FOR DELETE
  TO authenticated
  USING (has_permission(auth.uid(), 'admissions', 'delete'));

-- INTERACTIONS policies
CREATE POLICY "Users can view interactions based on permissions"
  ON interactions FOR SELECT
  TO authenticated
  USING (has_permission(auth.uid(), 'interactions', 'view'));

CREATE POLICY "Users can create interactions based on permissions"
  ON interactions FOR INSERT
  TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'interactions', 'create'));

-- Drop and recreate set_created_by trigger function with proper search_path
DROP FUNCTION IF EXISTS set_created_by() CASCADE;

CREATE OR REPLACE FUNCTION set_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate triggers for set_created_by function
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_created_by_trigger' 
    AND tgrelid = 'public.contacts'::regclass
  ) THEN
    CREATE TRIGGER set_created_by_trigger
      BEFORE INSERT ON public.contacts
      FOR EACH ROW
      EXECUTE FUNCTION set_created_by();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_created_by_trigger' 
    AND tgrelid = 'public.enquiries'::regclass
  ) THEN
    CREATE TRIGGER set_created_by_trigger
      BEFORE INSERT ON public.enquiries
      FOR EACH ROW
      EXECUTE FUNCTION set_created_by();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_created_by_trigger' 
    AND tgrelid = 'public.appointments'::regclass
  ) THEN
    CREATE TRIGGER set_created_by_trigger
      BEFORE INSERT ON public.appointments
      FOR EACH ROW
      EXECUTE FUNCTION set_created_by();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_created_by_trigger' 
    AND tgrelid = 'public.admissions'::regclass
  ) THEN
    CREATE TRIGGER set_created_by_trigger
      BEFORE INSERT ON public.admissions
      FOR EACH ROW
      EXECUTE FUNCTION set_created_by();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_created_by_trigger' 
    AND tgrelid = 'public.payments'::regclass
  ) THEN
    CREATE TRIGGER set_created_by_trigger
      BEFORE INSERT ON public.payments
      FOR EACH ROW
      EXECUTE FUNCTION set_created_by();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_created_by_trigger' 
    AND tgrelid = 'public.student_status'::regclass
  ) THEN
    CREATE TRIGGER set_created_by_trigger
      BEFORE INSERT ON public.student_status
      FOR EACH ROW
      EXECUTE FUNCTION set_created_by();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_created_by_trigger' 
    AND tgrelid = 'public.support_forms'::regclass
  ) THEN
    CREATE TRIGGER set_created_by_trigger
      BEFORE INSERT ON public.support_forms
      FOR EACH ROW
      EXECUTE FUNCTION set_created_by();
  END IF;
END $$;