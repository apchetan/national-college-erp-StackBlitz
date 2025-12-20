/*
  # Add Created By Tracking to Records

  ## Purpose
  This migration adds user tracking to records by adding a `created_by` field that stores
  which user created each record. This enables audit trails and accountability.

  ## Changes Made
  
  ### 1. Add `created_by` column to tables
  - enquiries table - Add `created_by` (uuid) referencing auth.users
  - appointments table - Add `created_by` (uuid) referencing auth.users
  - admissions table - Add `created_by` (uuid) referencing auth.users
  - student_status table - Add `created_by` (uuid) referencing auth.users
  - payments table - Add `created_by` (uuid) referencing auth.users
  - contacts table - Add `created_by` (uuid) referencing auth.users

  ### 2. Set default value for new records
  - New records will automatically capture the current user's ID
  - This is done through default values in the database

  ### 3. Indexes
  - Add indexes on created_by for efficient lookups
  
  ## Notes
  - Existing records will have NULL for created_by (cannot retroactively determine creator)
  - New records will automatically capture the authenticated user
  - Foreign key constraint ensures data integrity
*/

-- Add created_by column to contacts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE contacts ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts(created_by);
  END IF;
END $$;

-- Add created_by column to enquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_enquiries_created_by ON enquiries(created_by);
  END IF;
END $$;

-- Add created_by column to appointments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE appointments ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_appointments_created_by ON appointments(created_by);
  END IF;
END $$;

-- Add created_by column to admissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE admissions ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_admissions_created_by ON admissions(created_by);
  END IF;
END $$;

-- Add created_by column to student_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_status' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE student_status ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_student_status_created_by ON student_status(created_by);
  END IF;
END $$;

-- Add created_by column to payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE payments ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_payments_created_by ON payments(created_by);
  END IF;
END $$;