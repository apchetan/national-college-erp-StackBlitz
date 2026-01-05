/*
  # Dynamic Column Mapping System

  1. New Tables
    - `column_registry` - Stores all custom columns across all tables
      - `id` (uuid, primary key)
      - `table_name` (text) - Target table name
      - `column_name` (text) - Column name in database
      - `display_name` (text) - User-friendly display name
      - `data_type` (text) - Data type (text, number, decimal, date, boolean, email, phone, dropdown, multiselect)
      - `is_nullable` (boolean) - Whether column accepts null values
      - `default_value` (text) - Default value if any
      - `validation_rules` (jsonb) - Validation rules as JSON
      - `is_unique` (boolean) - Whether column has unique constraint
      - `is_global` (boolean) - Available across all forms
      - `dropdown_options` (jsonb) - Options for dropdown/multiselect
      - `created_by` (uuid) - Admin who created this column
      - `created_at` (timestamptz)
      - `is_active` (boolean) - Soft delete flag
    
    - `mapping_templates` - Stores reusable column mapping templates
      - `id` (uuid, primary key)
      - `template_name` (text) - User-defined template name
      - `description` (text) - Template description
      - `target_table` (text) - Target table/form name
      - `mapping_config` (jsonb) - Complete mapping configuration
      - `transformation_rules` (jsonb) - Data transformation rules
      - `created_by` (uuid) - Admin who created template
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `is_active` (boolean)
    
    - `schema_change_log` - Audit log for schema modifications
      - `id` (uuid, primary key)
      - `table_name` (text) - Table that was modified
      - `column_name` (text) - Column that was added/modified
      - `change_type` (text) - Type of change (add_column, modify_column, etc.)
      - `change_details` (jsonb) - Full details of the change
      - `executed_by` (uuid) - Admin who made the change
      - `executed_at` (timestamptz)
      - `status` (text) - success, failed, rolled_back
      - `error_message` (text) - If failed, error details

    - `import_sessions` - Track import operations
      - `id` (uuid, primary key)
      - `target_table` (text) - Target table/form
      - `file_name` (text) - Original file name
      - `total_rows` (integer) - Total rows in file
      - `successful_rows` (integer) - Successfully imported rows
      - `failed_rows` (integer) - Failed rows
      - `mapping_used` (jsonb) - Mapping configuration used
      - `error_report` (jsonb) - Row-wise error details
      - `started_by` (uuid) - Admin who initiated import
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `status` (text) - pending, processing, completed, failed

  2. Security
    - Enable RLS on all new tables
    - Only super_admin can create/modify columns
    - Only admin/super_admin can import data
    - All users can view their own import history

  3. Indexes
    - Add indexes for performance on lookup columns
*/

-- Create column_registry table
CREATE TABLE IF NOT EXISTS column_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  column_name text NOT NULL,
  display_name text NOT NULL,
  data_type text NOT NULL CHECK (data_type IN ('text', 'number', 'decimal', 'date', 'boolean', 'email', 'phone', 'dropdown', 'multiselect')),
  is_nullable boolean DEFAULT true,
  default_value text,
  validation_rules jsonb DEFAULT '{}',
  is_unique boolean DEFAULT false,
  is_global boolean DEFAULT false,
  dropdown_options jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(table_name, column_name)
);

-- Create mapping_templates table
CREATE TABLE IF NOT EXISTS mapping_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  description text,
  target_table text NOT NULL,
  mapping_config jsonb NOT NULL DEFAULT '{}',
  transformation_rules jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create schema_change_log table
CREATE TABLE IF NOT EXISTS schema_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  column_name text,
  change_type text NOT NULL CHECK (change_type IN ('add_column', 'modify_column', 'remove_column', 'add_constraint', 'remove_constraint')),
  change_details jsonb NOT NULL DEFAULT '{}',
  executed_by uuid REFERENCES auth.users(id),
  executed_at timestamptz DEFAULT now(),
  status text DEFAULT 'success' CHECK (status IN ('success', 'failed', 'rolled_back')),
  error_message text
);

-- Create import_sessions table
CREATE TABLE IF NOT EXISTS import_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_table text NOT NULL,
  file_name text NOT NULL,
  total_rows integer DEFAULT 0,
  successful_rows integer DEFAULT 0,
  failed_rows integer DEFAULT 0,
  mapping_used jsonb DEFAULT '{}',
  error_report jsonb DEFAULT '[]',
  started_by uuid REFERENCES auth.users(id),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partially_completed'))
);

-- Enable RLS
ALTER TABLE column_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapping_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for column_registry
CREATE POLICY "Super admins can manage column registry"
  ON column_registry
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can view column registry"
  ON column_registry
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
      AND profiles.is_active = true
    )
  );

-- RLS Policies for mapping_templates
CREATE POLICY "Admins can manage mapping templates"
  ON mapping_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
      AND profiles.is_active = true
    )
  );

-- RLS Policies for schema_change_log
CREATE POLICY "Admins can view schema change log"
  ON schema_change_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Super admins can insert schema changes"
  ON schema_change_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
      AND profiles.is_active = true
    )
  );

-- RLS Policies for import_sessions
CREATE POLICY "Users can view own import sessions"
  ON import_sessions
  FOR SELECT
  TO authenticated
  USING (started_by = auth.uid());

CREATE POLICY "Admins can view all import sessions"
  ON import_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Authenticated users can create import sessions"
  ON import_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (started_by = auth.uid());

CREATE POLICY "Users can update own import sessions"
  ON import_sessions
  FOR UPDATE
  TO authenticated
  USING (started_by = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_column_registry_table_name ON column_registry(table_name) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_column_registry_is_global ON column_registry(is_global) WHERE is_active = true AND is_global = true;
CREATE INDEX IF NOT EXISTS idx_mapping_templates_target ON mapping_templates(target_table) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_schema_log_table ON schema_change_log(table_name, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_sessions_user ON import_sessions(started_by, started_at DESC);

-- Create function to get available columns for a table
CREATE OR REPLACE FUNCTION get_available_columns(p_table_name text)
RETURNS TABLE (
  column_name text,
  display_name text,
  data_type text,
  is_custom boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  -- Get existing database columns
  SELECT 
    c.column_name::text,
    c.column_name::text as display_name,
    c.data_type::text,
    false as is_custom
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
  AND c.table_name = p_table_name
  
  UNION ALL
  
  -- Get custom columns from registry
  SELECT 
    cr.column_name,
    cr.display_name,
    cr.data_type,
    true as is_custom
  FROM column_registry cr
  WHERE cr.table_name = p_table_name
  AND cr.is_active = true
  
  UNION ALL
  
  -- Get global custom columns
  SELECT 
    cr.column_name,
    cr.display_name,
    cr.data_type,
    true as is_custom
  FROM column_registry cr
  WHERE cr.is_global = true
  AND cr.is_active = true
  
  ORDER BY display_name;
END;
$$;

-- Create function to validate data type
CREATE OR REPLACE FUNCTION validate_data_type(p_value text, p_data_type text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  CASE p_data_type
    WHEN 'number' THEN
      RETURN p_value ~ '^-?[0-9]+$';
    WHEN 'decimal' THEN
      RETURN p_value ~ '^-?[0-9]+\.?[0-9]*$';
    WHEN 'date' THEN
      BEGIN
        PERFORM p_value::date;
        RETURN true;
      EXCEPTION WHEN OTHERS THEN
        RETURN false;
      END;
    WHEN 'boolean' THEN
      RETURN lower(p_value) IN ('true', 'false', 't', 'f', 'yes', 'no', '1', '0');
    WHEN 'email' THEN
      RETURN p_value ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
    WHEN 'phone' THEN
      RETURN p_value ~ '^[0-9+\-\s\(\)]+$';
    ELSE
      RETURN true;
  END CASE;
END;
$$;