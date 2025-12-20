/*
  # Add Date of Birth to Contacts Table

  1. Changes
    - Add `date_of_birth` column to the `contacts` table
      - Type: date
      - Optional field (can be null)
      - Stores the birth date of the contact/student
  
  2. Notes
    - This field is required for admissions but optional for general contacts
    - The date picker in the UI restricts selection to past dates only
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE contacts ADD COLUMN date_of_birth date;
  END IF;
END $$;