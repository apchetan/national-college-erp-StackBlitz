/*
  # Replace Admission Date with Specialisation

  1. Changes
    - Remove `admission_date` column from the `admissions` table
    - Add `specialisation` column to the `admissions` table
      - Type: text
      - Optional field (can be null)
      - Stores the student's area of specialisation/concentration
  
  2. Notes
    - This field allows tracking what specific area within a program the student is focusing on
    - Examples: Computer Science, Business Administration, Data Science, etc.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'admission_date'
  ) THEN
    ALTER TABLE admissions DROP COLUMN admission_date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'specialisation'
  ) THEN
    ALTER TABLE admissions ADD COLUMN specialisation text;
  END IF;
END $$;