/*
  # Add created_by column to admissions table

  The bulk-import edge function injects a `created_by` field for all core
  tables (contacts, enquiries, appointments, admissions). The admissions table
  was missing this column, causing every import batch to fail with a schema
  cache error.

  ## Changes
  - Add `created_by` (uuid, nullable) to admissions, referencing auth.users
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE admissions ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;
