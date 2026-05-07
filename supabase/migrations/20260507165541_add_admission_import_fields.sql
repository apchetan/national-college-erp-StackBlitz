/*
  # Add new fields to admissions table for import mapping

  ## New Columns
  - `counselor` (text) — name of the assigned counselor
  - `date_of_admission` (date) — date the student was admitted (DoA)
  - `date_of_birth` (date) — student's date of birth (DoB)
  - `ms_status` (text) — manuscript/milestone status (MS Status)
  - `mobile1` (text) — primary mobile number
  - `mobile2` (text) — secondary mobile number
  - `email` (text) — student's email address
  - `fee_remark` (text) — remarks related to fee payments

  All columns are nullable to avoid breaking existing records.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'counselor'
  ) THEN
    ALTER TABLE admissions ADD COLUMN counselor text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'date_of_admission'
  ) THEN
    ALTER TABLE admissions ADD COLUMN date_of_admission date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE admissions ADD COLUMN date_of_birth date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'ms_status'
  ) THEN
    ALTER TABLE admissions ADD COLUMN ms_status text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'mobile1'
  ) THEN
    ALTER TABLE admissions ADD COLUMN mobile1 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'mobile2'
  ) THEN
    ALTER TABLE admissions ADD COLUMN mobile2 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'email'
  ) THEN
    ALTER TABLE admissions ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'fee_remark'
  ) THEN
    ALTER TABLE admissions ADD COLUMN fee_remark text;
  END IF;
END $$;
