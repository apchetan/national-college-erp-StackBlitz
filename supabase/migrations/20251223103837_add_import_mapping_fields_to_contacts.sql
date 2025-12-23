/*
  # Add Import Mapping Fields to Contacts Table
  
  ## Purpose
  Extend the contacts table with additional fields required for comprehensive data import mapping.
  Only First Name, Phone, and Email will be mandatory during import; all other fields are nullable.
  
  ## New Fields Added
  - `program` (text) - Course/Program interested in
  - `date_of_application` (date) - Date when application was submitted
  - `role` (text) - Job role/title
  - `industry` (text) - Industry sector
  - `ug_degree` (text) - Undergraduate degree
  - `ug_specialization` (text) - UG specialization
  - `ug_university` (text) - UG university name
  - `pg_degree` (text) - Postgraduate degree
  - `pg_specialization` (text) - PG specialization
  - `pg_university` (text) - PG university name
  - `remark` (text) - Additional remarks/notes specific to import
  
  ## Data Integrity
  - All new fields are nullable to support flexible import mappings
  - No constraints on data to allow various formats during import
  - Normalization will be handled at application layer
*/

-- Add new fields to contacts table (all nullable)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'program'
  ) THEN
    ALTER TABLE contacts ADD COLUMN program text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'date_of_application'
  ) THEN
    ALTER TABLE contacts ADD COLUMN date_of_application date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'role'
  ) THEN
    ALTER TABLE contacts ADD COLUMN role text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'industry'
  ) THEN
    ALTER TABLE contacts ADD COLUMN industry text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'ug_degree'
  ) THEN
    ALTER TABLE contacts ADD COLUMN ug_degree text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'ug_specialization'
  ) THEN
    ALTER TABLE contacts ADD COLUMN ug_specialization text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'ug_university'
  ) THEN
    ALTER TABLE contacts ADD COLUMN ug_university text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'pg_degree'
  ) THEN
    ALTER TABLE contacts ADD COLUMN pg_degree text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'pg_specialization'
  ) THEN
    ALTER TABLE contacts ADD COLUMN pg_specialization text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'pg_university'
  ) THEN
    ALTER TABLE contacts ADD COLUMN pg_university text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'remark'
  ) THEN
    ALTER TABLE contacts ADD COLUMN remark text;
  END IF;
END $$;