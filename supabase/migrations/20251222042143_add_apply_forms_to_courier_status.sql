/*
  # Add Apply Form Fields to Courier Status

  1. Changes
    - Add `received_from_student_apply_forms` (text array) - stores selected apply forms for received from student section
    - Add `sent_to_student_apply_forms` (text array) - stores selected apply forms for sent to student section
    - Add `sent_to_university_apply_forms` (text array) - stores selected apply forms for sent to university section
    - Add `received_from_university_apply_forms` (text array) - stores selected apply forms for received from university section

  2. Purpose
    - Enable tracking of specific document types in courier tracking
    - Support multi-select dropdown for apply forms in each courier section
*/

-- Add apply form array columns to courier_status table
DO $$
BEGIN
  -- Received from Student apply forms
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courier_status' AND column_name = 'received_from_student_apply_forms'
  ) THEN
    ALTER TABLE courier_status 
    ADD COLUMN received_from_student_apply_forms text[] DEFAULT ARRAY[]::text[];
  END IF;

  -- Sent to Student apply forms
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courier_status' AND column_name = 'sent_to_student_apply_forms'
  ) THEN
    ALTER TABLE courier_status 
    ADD COLUMN sent_to_student_apply_forms text[] DEFAULT ARRAY[]::text[];
  END IF;

  -- Sent to University apply forms
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courier_status' AND column_name = 'sent_to_university_apply_forms'
  ) THEN
    ALTER TABLE courier_status 
    ADD COLUMN sent_to_university_apply_forms text[] DEFAULT ARRAY[]::text[];
  END IF;

  -- Received from University apply forms
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courier_status' AND column_name = 'received_from_university_apply_forms'
  ) THEN
    ALTER TABLE courier_status 
    ADD COLUMN received_from_university_apply_forms text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;