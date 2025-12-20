/*
  # Update Qualifications Field to Support Multiple Selections

  1. Changes
    - Change `qualification` field in `admissions` table from text to text array
    - This allows storing multiple qualifications for each admission
  
  2. Notes
    - Existing data will be preserved and converted to array format
*/

-- Update the qualification column to support array of text values
ALTER TABLE admissions 
  ALTER COLUMN qualification TYPE text[] USING 
    CASE 
      WHEN qualification IS NULL THEN NULL
      ELSE ARRAY[qualification]
    END;
