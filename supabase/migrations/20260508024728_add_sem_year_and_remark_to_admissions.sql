/*
  # Add Sem_Year and remark columns to admissions table

  ## New Columns
  - `sem_year` (text) — semester or year (e.g. "Sem 1", "Year 2")
  - `remark` (text) — long-form remarks/notes about the admission
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'sem_year'
  ) THEN
    ALTER TABLE admissions ADD COLUMN sem_year text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admissions' AND column_name = 'remark'
  ) THEN
    ALTER TABLE admissions ADD COLUMN remark text;
  END IF;
END $$;
