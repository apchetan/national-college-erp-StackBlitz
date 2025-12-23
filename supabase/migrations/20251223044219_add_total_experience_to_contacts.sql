/*
  # Add Total Experience Field to Contacts Table

  ## Changes
  1. Tables Modified
    - `contacts`
      - Add `total_experience` column (integer, nullable)
      - Represents years of work experience (0-50)
      - Default value: NULL (not required field)

  ## Notes
  - Field is nullable to maintain backward compatibility
  - Stores total years of work experience
  - Used in appointment booking and admission forms
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'total_experience'
  ) THEN
    ALTER TABLE contacts ADD COLUMN total_experience integer;
  END IF;
END $$;