/*
  # Authentication and Role-Based Access Control System

  ## Overview
  This migration sets up a complete authentication and authorization system with role-based access control.

  ## 1. New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users.id
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role (admin, manager, editor, viewer)
  - `is_active` (boolean) - Whether user account is active
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `created_by` (uuid) - ID of admin who created this user

  ### `user_permissions`
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Links to profiles.id
  - `resource` (text) - Resource name (contacts, enquiries, appointments, admissions)
  - `can_view` (boolean) - Can view records
  - `can_create` (boolean) - Can create records
  - `can_edit` (boolean) - Can edit records
  - `can_delete` (boolean) - Can delete records
  - `can_export` (boolean) - Can export data
  - `can_import` (boolean) - Can import data

  ## 2. Security
  
  ### RLS Policies
  - Admins can manage all users and have full access to all data
  - Managers can view and edit data based on their permissions
  - Editors can create and edit data based on their permissions
  - Viewers can only view data based on their permissions
  - All tables have RLS enabled with role-based access control
  
  ## 3. Important Notes
  - Default admin user should be created manually after migration
  - All existing data remains accessible to admins
  - User passwords are managed by Supabase Auth
  - Role hierarchy: admin > manager > editor > viewer
*/

-- Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'editor', 'viewer')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource text NOT NULL CHECK (resource IN ('contacts', 'enquiries', 'appointments', 'admissions')),
  can_view boolean DEFAULT false,
  can_create boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  can_export boolean DEFAULT false,
  can_import boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, resource)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_resource ON user_permissions(resource);

-- Enable RLS on new tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- User permissions policies
CREATE POLICY "Users can view own permissions"
  ON user_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all permissions"
  ON user_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can manage permissions"
  ON user_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

-- Helper function to check user permission
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
  
  -- Admins have all permissions
  IF v_role = 'admin' THEN
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

-- Update RLS policies for existing tables to check permissions

-- Contacts policies
DROP POLICY IF EXISTS "Enable read access for all users" ON contacts;
DROP POLICY IF EXISTS "Enable insert for all users" ON contacts;
DROP POLICY IF EXISTS "Enable update for all users" ON contacts;
DROP POLICY IF EXISTS "Enable delete for all users" ON contacts;

CREATE POLICY "Users can view contacts based on permissions"
  ON contacts FOR SELECT
  TO authenticated
  USING (has_permission(auth.uid(), 'contacts', 'view'));

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

-- Enquiries policies
DROP POLICY IF EXISTS "Enable read access for all users" ON enquiries;
DROP POLICY IF EXISTS "Enable insert for all users" ON enquiries;
DROP POLICY IF EXISTS "Enable update for all users" ON enquiries;
DROP POLICY IF EXISTS "Enable delete for all users" ON enquiries;

CREATE POLICY "Users can view enquiries based on permissions"
  ON enquiries FOR SELECT
  TO authenticated
  USING (has_permission(auth.uid(), 'enquiries', 'view'));

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

-- Appointments policies
DROP POLICY IF EXISTS "Enable read access for all users" ON appointments;
DROP POLICY IF EXISTS "Enable insert for all users" ON appointments;
DROP POLICY IF EXISTS "Enable update for all users" ON appointments;
DROP POLICY IF EXISTS "Enable delete for all users" ON appointments;

CREATE POLICY "Users can view appointments based on permissions"
  ON appointments FOR SELECT
  TO authenticated
  USING (has_permission(auth.uid(), 'appointments', 'view'));

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

-- Admissions policies
DROP POLICY IF EXISTS "Enable read access for all users" ON admissions;
DROP POLICY IF EXISTS "Enable insert for all users" ON admissions;
DROP POLICY IF EXISTS "Enable update for all users" ON admissions;
DROP POLICY IF EXISTS "Enable delete for all users" ON admissions;

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

-- Interactions policies
DROP POLICY IF EXISTS "Enable read access for all users" ON interactions;
DROP POLICY IF EXISTS "Enable insert for all users" ON interactions;

CREATE POLICY "Users can view interactions based on permissions"
  ON interactions FOR SELECT
  TO authenticated
  USING (
    has_permission(auth.uid(), 'contacts', 'view') OR
    has_permission(auth.uid(), 'enquiries', 'view') OR
    has_permission(auth.uid(), 'appointments', 'view') OR
    has_permission(auth.uid(), 'admissions', 'view')
  );

CREATE POLICY "Users can create interactions based on permissions"
  ON interactions FOR INSERT
  TO authenticated
  WITH CHECK (
    has_permission(auth.uid(), 'contacts', 'create') OR
    has_permission(auth.uid(), 'enquiries', 'create') OR
    has_permission(auth.uid(), 'appointments', 'create') OR
    has_permission(auth.uid(), 'admissions', 'create')
  );

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_user_permissions_updated_at ON user_permissions;
CREATE TRIGGER update_user_permissions_updated_at
  BEFORE UPDATE ON user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();