/*
  # Add Additional Columns to Payments Table

  1. New Columns
    - `receipt_date` (date) - Date when receipt was issued
    - `balance_fee` (numeric) - Remaining balance after this payment
    - `counselor` (text) - Name of the counselor who processed the payment
    - `amount_paid` is already present as `amount` column

  2. Notes
    - payment_date already exists (date when payment was made)
    - amount already exists (amount paid in this transaction)
    - These new columns enhance payment tracking and record keeping
*/

-- Add receipt_date column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'receipt_date'
  ) THEN
    ALTER TABLE payments ADD COLUMN receipt_date date;
  END IF;
END $$;

-- Add balance_fee column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'balance_fee'
  ) THEN
    ALTER TABLE payments ADD COLUMN balance_fee numeric DEFAULT 0;
  END IF;
END $$;

-- Add counselor column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'counselor'
  ) THEN
    ALTER TABLE payments ADD COLUMN counselor text;
  END IF;
END $$;

-- Add index on receipt_date for fast lookups
CREATE INDEX IF NOT EXISTS idx_payments_receipt_date ON payments(receipt_date);

-- Add check constraint for balance_fee to ensure it's not negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'non_negative_balance_fee'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT non_negative_balance_fee CHECK (balance_fee >= 0);
  END IF;
END $$;