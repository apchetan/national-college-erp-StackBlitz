/*
  # Fix Missing Authenticated Insert Policies

  ## Problem
  Multiple tables only have INSERT policies for anonymous users, causing RLS violations when authenticated users try to create records.

  ## Changes
  1. Add INSERT policies for authenticated users on:
    - admissions
    - appointments
    - student_status
  
  ## Security Notes
  - Both anonymous and authenticated users can create records in these tables
  - This is appropriate for forms that need to work whether user is logged in or not
*/

-- Admissions: Add INSERT policy for authenticated users
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert admissions" ON admissions;
END $$;

CREATE POLICY "Authenticated users can insert admissions"
  ON admissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Appointments: Add INSERT policy for authenticated users
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert appointments" ON appointments;
END $$;

CREATE POLICY "Authenticated users can insert appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Student Status: Add INSERT policy for authenticated users
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert student status" ON student_status;
END $$;

CREATE POLICY "Authenticated users can insert student status"
  ON student_status
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also add SELECT policy for student_status if missing
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can view student status" ON student_status;
END $$;

CREATE POLICY "Authenticated users can view student status"
  ON student_status
  FOR SELECT
  TO authenticated
  USING (true);
