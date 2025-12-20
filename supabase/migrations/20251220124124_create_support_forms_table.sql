/*
  # Create Support Forms Table

  1. New Tables
    - `support_forms`
      - `id` (uuid, primary key)
      - `contact_id` (uuid, foreign key to contacts)
      - `subject` (text)
      - `message` (text)
      - `enquiry_type` (text)
      - `priority` (text, default 'medium')
      - `status` (text, default 'new')
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `support_forms` table
    - Add policies for authenticated users to:
      - Read all support forms
      - Insert new support forms
      - Update support forms
      - Delete support forms

  3. Indexes
    - Add index on contact_id for faster lookups
    - Add index on status for filtering
    - Add index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS support_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  enquiry_type text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_forms ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_support_forms_contact_id ON support_forms(contact_id);
CREATE INDEX IF NOT EXISTS idx_support_forms_status ON support_forms(status);
CREATE INDEX IF NOT EXISTS idx_support_forms_created_at ON support_forms(created_at DESC);

CREATE POLICY "Users can view all support forms"
  ON support_forms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert support forms"
  ON support_forms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update support forms"
  ON support_forms FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete support forms"
  ON support_forms FOR DELETE
  TO authenticated
  USING (true);