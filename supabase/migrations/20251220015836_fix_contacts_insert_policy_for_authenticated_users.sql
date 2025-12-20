/*
  # Fix Contacts Insert Policy for Authenticated Users

  ## Problem
  The contacts table only has an INSERT policy for anonymous (anon) users, but authenticated users are being blocked from creating contacts.

  ## Changes
  1. Add INSERT policy for authenticated users
    - Allows authenticated users to insert contacts
    - Uses WITH CHECK (true) to permit all inserts
  
  ## Security Notes
  - Both anonymous and authenticated users can create contacts
  - This is appropriate since forms need to create contacts whether user is logged in or not
*/

-- Drop the policy if it exists and recreate it
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON contacts;
END $$;

-- Create INSERT policy for authenticated users
CREATE POLICY "Authenticated users can insert contacts"
  ON contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
