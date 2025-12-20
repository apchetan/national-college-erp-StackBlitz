/*
  # Add City Column to Contacts Table

  1. Changes
    - Add `city` column to `contacts` table
      - Type: text
      - Optional field for storing contact's city
  
  2. Notes
    - City will be used in admission forms and other contact records
    - No default value as this is optional information
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'city'
  ) THEN
    ALTER TABLE contacts ADD COLUMN city text;
  END IF;
END $$;