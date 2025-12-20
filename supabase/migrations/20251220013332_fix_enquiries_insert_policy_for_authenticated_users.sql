/*
  # Fix Enquiries Insert Policy for Authenticated Users

  ## Problem
  The enquiries table only has an INSERT policy for anonymous (anon) users, but authenticated users are being blocked from creating enquiries.

  ## Changes
  1. Add INSERT policy for authenticated users
    - Allows authenticated users to insert enquiries
    - Uses WITH CHECK (true) to permit all inserts
  
  ## Security Notes
  - Both anonymous and authenticated users can create enquiries
  - This is appropriate for an enquiry form that should accept submissions from logged-in users
*/

-- Drop the policy if it exists and recreate it
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert enquiries" ON enquiries;
END $$;

-- Create INSERT policy for authenticated users
CREATE POLICY "Authenticated users can insert enquiries"
  ON enquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
