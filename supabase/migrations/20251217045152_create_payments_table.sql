/*
  # Create Payments Table

  ## Purpose
  This migration creates a payments table to track individual fee payment transactions for admissions.

  ## Tables Created
  
  ### 1. payments
  - `id` (uuid, primary key) - Unique identifier for each payment
  - `admission_id` (uuid, foreign key) - Links to admissions table
  - `amount` (numeric) - Amount paid in this transaction
  - `payment_date` (date) - Date when payment was made
  - `payment_mode` (text) - Mode of payment (cash, cheque, card, upi, net_banking, other)
  - `transaction_number` (text) - Transaction reference number
  - `notes` (text) - Additional notes about the payment
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record last update timestamp

  ## Security
  - Enable RLS on payments table
  - Add policies for authenticated users to:
    - View payments (SELECT)
    - Create payments (INSERT)
    - Update payments (UPDATE)
    - Delete payments (DELETE)

  ## Indexes
  - Index on admission_id for fast lookups of payments by admission
  - Index on payment_date for chronological queries
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id uuid NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_mode text NOT NULL DEFAULT 'cash',
  transaction_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_payment_mode CHECK (payment_mode IN ('cash', 'cheque', 'card', 'upi', 'net_banking', 'other')),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_payments_admission_id ON payments(admission_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete payments"
  ON payments FOR DELETE
  TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_payments_updated_at ON payments;
CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();