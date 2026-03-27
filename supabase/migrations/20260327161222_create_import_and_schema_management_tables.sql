/*
  # Create Import and Schema Management Tables

  ## Purpose
    - Enable dynamic data import functionality
    - Track import sessions and results
    - Store column mappings and templates
    - Log schema changes for audit trail

  ## New Tables
    1. `import_sessions`
       - Tracks each CSV import session
       - Stores import results and error reports
       - Links to user who initiated import
    
    2. `mapping_templates`
       - Stores reusable column mapping templates
       - Allows users to save and reuse import configurations
    
    3. `column_registry`
       - Tracks dynamically created columns
       - Stores column metadata and validation rules
    
    4. `schema_change_log`
       - Audit log for all schema changes
       - Tracks who made changes and when

  ## Security
    - Enable RLS on all tables
    - Only admins and super_admins can access these tables
    - Authenticated users can view their own import sessions
*/

-- Import Sessions Table
CREATE TABLE IF NOT EXISTS import_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_table text NOT NULL,
  file_name text NOT NULL,
  total_rows integer NOT NULL DEFAULT 0,
  successful_rows integer DEFAULT 0,
  failed_rows integer DEFAULT 0,
  mapping_used jsonb,
  error_report jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'partially_completed', 'failed')),
  started_by uuid REFERENCES auth.users(id),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Mapping Templates Table
CREATE TABLE IF NOT EXISTS mapping_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  target_table text NOT NULL,
  mapping_config jsonb NOT NULL,
  transformation_rules jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(template_name, target_table)
);

-- Column Registry Table
CREATE TABLE IF NOT EXISTS column_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  column_name text NOT NULL,
  display_name text NOT NULL,
  data_type text NOT NULL,
  is_nullable boolean DEFAULT true,
  default_value text,
  validation_rules jsonb,
  is_unique boolean DEFAULT false,
  is_global boolean DEFAULT false,
  dropdown_options jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(table_name, column_name)
);

-- Schema Change Log Table
CREATE TABLE IF NOT EXISTS schema_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  column_name text,
  change_type text NOT NULL CHECK (change_type IN ('add_column', 'drop_column', 'modify_column', 'add_constraint', 'drop_constraint')),
  change_details jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message text,
  executed_by uuid REFERENCES auth.users(id),
  executed_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE import_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapping_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE column_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_change_log ENABLE ROW LEVEL SECURITY;

-- Import Sessions Policies
CREATE POLICY "Admins can view all import sessions"
  ON import_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Users can view own import sessions"
  ON import_sessions FOR SELECT
  TO authenticated
  USING (started_by = auth.uid());

CREATE POLICY "Admins can insert import sessions"
  ON import_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can update import sessions"
  ON import_sessions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
      AND profiles.is_active = true
    )
  );

-- Mapping Templates Policies
CREATE POLICY "Admins can view all mapping templates"
  ON mapping_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can insert mapping templates"
  ON mapping_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can update mapping templates"
  ON mapping_templates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can delete mapping templates"
  ON mapping_templates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
      AND profiles.is_active = true
    )
  );

-- Column Registry Policies
CREATE POLICY "Authenticated users can view column registry"
  ON column_registry FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can insert to column registry"
  ON column_registry FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Super admins can update column registry"
  ON column_registry FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Super admins can delete from column registry"
  ON column_registry FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
      AND profiles.is_active = true
    )
  );

-- Schema Change Log Policies
CREATE POLICY "Admins can view schema change log"
  ON schema_change_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Super admins can insert to schema change log"
  ON schema_change_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
      AND profiles.is_active = true
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_import_sessions_started_by ON import_sessions(started_by);
CREATE INDEX IF NOT EXISTS idx_import_sessions_status ON import_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mapping_templates_target_table ON mapping_templates(target_table);
CREATE INDEX IF NOT EXISTS idx_column_registry_table_name ON column_registry(table_name);
CREATE INDEX IF NOT EXISTS idx_schema_change_log_table_name ON schema_change_log(table_name);
