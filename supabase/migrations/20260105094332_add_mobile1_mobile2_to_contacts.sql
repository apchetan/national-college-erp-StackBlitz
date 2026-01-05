/*
  # Add Mobile1 and Mobile2 Columns to Contacts Table

  1. New Columns
    - `mobile1` (text) - Primary mobile number
    - `mobile2` (text) - Secondary mobile number

  2. Notes
    - Both columns are optional (nullable)
    - Added to support multiple contact numbers per person
    - Indexes added for search performance
*/

-- Add mobile1 column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'mobile1'
  ) THEN
    ALTER TABLE contacts ADD COLUMN mobile1 text;
  END IF;
END $$;

-- Add mobile2 column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'mobile2'
  ) THEN
    ALTER TABLE contacts ADD COLUMN mobile2 text;
  END IF;
END $$;

-- Add indexes for mobile number search
CREATE INDEX IF NOT EXISTS idx_contacts_mobile1 ON contacts(mobile1);
CREATE INDEX IF NOT EXISTS idx_contacts_mobile2 ON contacts(mobile2);