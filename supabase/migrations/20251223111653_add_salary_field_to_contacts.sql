/*
  # Add Salary Field to Contacts Table
  
  ## Purpose
  Add salary field to contacts table for import mapping functionality.
  Field is nullable to support flexible import mappings where salary is optional.
  
  ## New Field
  - `salary` (numeric) - Annual salary or compensation information (nullable)
  
  ## Data Integrity
  - Field is nullable to allow optional mapping during imports
  - No constraints on value to allow various salary formats
  - Normalization will be handled at application layer
*/

-- Add salary field to contacts table (nullable)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'salary'
  ) THEN
    ALTER TABLE contacts ADD COLUMN salary numeric;
  END IF;
END $$;