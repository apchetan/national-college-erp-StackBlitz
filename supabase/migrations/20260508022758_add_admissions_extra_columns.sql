/*
  # Add extra columns to admissions table

  ## New Columns
  - `name` (text) — student's full name
  - `course` (text) — course name (separate from program)
  - `session` (text) — academic session (e.g. "2024-25")
  - `form_sent_date` (date) — date the admission form was sent
  - `university` (text) — affiliated university name
  - `total_fee` (numeric) — total fee for the course
  - `fee_paid` (numeric) — amount of fee paid so far
  - `fee_balance` (numeric) — remaining fee balance

  All columns are nullable to avoid breaking existing records.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'name'
  ) THEN
    ALTER TABLE admissions ADD COLUMN name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'course'
  ) THEN
    ALTER TABLE admissions ADD COLUMN course text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'session'
  ) THEN
    ALTER TABLE admissions ADD COLUMN session text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'form_sent_date'
  ) THEN
    ALTER TABLE admissions ADD COLUMN form_sent_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'university'
  ) THEN
    ALTER TABLE admissions ADD COLUMN university text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'total_fee'
  ) THEN
    ALTER TABLE admissions ADD COLUMN total_fee numeric(12, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'fee_paid'
  ) THEN
    ALTER TABLE admissions ADD COLUMN fee_paid numeric(12, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'fee_balance'
  ) THEN
    ALTER TABLE admissions ADD COLUMN fee_balance numeric(12, 2);
  END IF;
END $$;
