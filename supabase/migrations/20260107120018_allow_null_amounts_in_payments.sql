/*
  # Allow NULL amounts in payments table for imports

  ## Problem
  The positive_amount constraint blocks imports when amount is NULL or 0.
  During imports, payment data might not be complete yet.

  ## Solution
  Modify the constraint to allow NULL values while still requiring positive amounts when set.

  ## Changes
  1. Drop the old positive_amount constraint
  2. Add new constraint that allows NULL: (amount IS NULL OR amount > 0)
*/

-- Drop the existing constraint
ALTER TABLE public.payments 
DROP CONSTRAINT IF EXISTS positive_amount;

-- Add new constraint that allows NULL values
ALTER TABLE public.payments 
ADD CONSTRAINT positive_amount CHECK (amount IS NULL OR amount > 0);