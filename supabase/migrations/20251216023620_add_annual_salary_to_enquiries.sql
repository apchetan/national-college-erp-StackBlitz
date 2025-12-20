/*
  # Add Annual Salary Column to Enquiries Table

  1. Changes
    - Add `annual_salary` column to `enquiries` table
      - Type: numeric (to support decimal values)
      - Optional field (nullable)
      - Stores salary information for enquiries

  2. Notes
    - Uses IF NOT EXISTS to prevent errors if column already exists
    - No data migration needed as this is a new optional field
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'annual_salary'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN annual_salary numeric(12, 2);
  END IF;
END $$;
