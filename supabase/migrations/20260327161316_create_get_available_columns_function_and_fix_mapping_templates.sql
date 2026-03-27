/*
  # Create get_available_columns Function and Fix mapping_templates

  ## Purpose
    - Create function to retrieve available columns for a table
    - Add missing is_active column to mapping_templates
    - Enable dynamic column mapping in the import interface

  ## Changes
    1. Create get_available_columns function
       - Returns all columns for a specified table
       - Includes both system columns and custom columns from column_registry
    
    2. Add is_active column to mapping_templates
       - Allows soft deletion of templates
       - Default value is true

  ## Security
    - Function is SECURITY DEFINER to access information_schema
    - Only authenticated users can call the function
*/

-- Add is_active column to mapping_templates if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mapping_templates' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE mapping_templates ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Create get_available_columns function
CREATE OR REPLACE FUNCTION get_available_columns(p_table_name text)
RETURNS TABLE (
  column_name text,
  display_name text,
  data_type text,
  is_custom boolean,
  is_nullable boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  -- Get system columns from information_schema
  SELECT 
    c.column_name::text,
    c.column_name::text as display_name,
    c.data_type::text,
    false as is_custom,
    CASE WHEN c.is_nullable = 'YES' THEN true ELSE false END as is_nullable
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = p_table_name
    AND c.column_name NOT IN ('id', 'created_at', 'updated_at', 'created_by')
  
  UNION ALL
  
  -- Get custom columns from column_registry
  SELECT 
    cr.column_name::text,
    cr.display_name::text,
    cr.data_type::text,
    true as is_custom,
    cr.is_nullable
  FROM column_registry cr
  WHERE cr.table_name = p_table_name
  
  ORDER BY is_custom, column_name;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_available_columns(text) TO authenticated;

-- Create an index on is_active for better query performance
CREATE INDEX IF NOT EXISTS idx_mapping_templates_is_active ON mapping_templates(is_active) WHERE is_active = true;
