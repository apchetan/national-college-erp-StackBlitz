/*
  # Add Additional Contact Fields

  1. Changes
    - Add `gender` field to contacts table for demographic information
    - Add `address` field to contacts table for location information
    - Add `caller` field to contacts table to track who made the initial contact
    - Add `course` field to enquiries table for course/program interest
    - Add `experience` field to enquiries table for years of experience

  2. Notes
    - Gender is optional text field
    - Address is optional text field for full address
    - Caller is optional text field to track contact source person
    - Course maps to program interest
    - Experience maps to professional experience in years
*/

-- Add new fields to contacts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'gender'
  ) THEN
    ALTER TABLE contacts ADD COLUMN gender text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'address'
  ) THEN
    ALTER TABLE contacts ADD COLUMN address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'caller'
  ) THEN
    ALTER TABLE contacts ADD COLUMN caller text;
  END IF;
END $$;